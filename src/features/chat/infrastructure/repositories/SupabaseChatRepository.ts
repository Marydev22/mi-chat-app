import { supabase } from '@shared/infrastructure/supabase/client';
import { Message } from '@features/chat/domain/entities/Message';
import { Room } from '@features/chat/domain/entities/Room';
import {
  IChatRepository,
  ImageToUpload,
} from '@features/chat/domain/repositories/IChatRepository';
import { File as ExpoFile } from 'expo-file-system';

// Único lugar del slice chat que conoce Supabase.
export class SupabaseChatRepository implements IChatRepository {
  private readonly bucket = 'chat-images';

  async getRooms(): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapRoom);
  }

  async createRoom(name: string, userId: string): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .insert({ name, created_by: userId })
      .select()
      .single();
    if (error) throw error;
    return this.mapRoom(data);
  }

  async getMessages(roomId: string): Promise<Message[]> {
    // Traemos los 50 MÁS RECIENTES (descendente) y los invertimos para mostrarlos en orden
    const { data, error } = await supabase
      .from('messages')
      .select('id, room_id, user_id, content, created_at, image_url, profiles(username)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []).map(this.mapMessage).reverse();
  }

  async sendMessage(
    roomId: string,
    userId: string,
    content: string,
    imageUrl?: string,
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({ room_id: roomId, user_id: userId, content, image_url: imageUrl ?? null })
      .select('id, room_id, user_id, content, created_at, image_url, profiles(username)')
      .single();
    if (error) throw error;
    return this.mapMessage(data);
  }

  // En React Native, storage-js espera un ArrayBuffer (no Blob/FormData).
  // expo-file-system lee tanto URIs file:// como content:// de Android.
  async uploadImage(
    roomId: string,
    userId: string,
    image: ImageToUpload,
  ): Promise<string> {
    const extension = this.extensionFor(image.mimeType);
    // La primera carpeta es el userId: la política RLS de Storage lo exige.
    const path = `${userId}/${roomId}/${Date.now()}.${extension}`;
    const arrayBuffer = await new ExpoFile(image.uri).arrayBuffer();

    const { error } = await supabase.storage
      .from(this.bucket)
      .upload(path, arrayBuffer, { contentType: image.mimeType ?? 'image/jpeg' });
    if (error) throw error;

    const { data } = supabase.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async removeImage(imageUrl: string): Promise<void> {
    const marker = `/storage/v1/object/public/${this.bucket}/`;
    const index = imageUrl.indexOf(marker);
    if (index === -1) return; // No es una URL de nuestro bucket: nada que borrar.

    const path = imageUrl.slice(index + marker.length).split('?')[0];
    const { error } = await supabase.storage.from(this.bucket).remove([path]);
    if (error) throw error;
  }

  subscribeToRoom(roomId: string, onMessage: (msg: Message) => void): () => void {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // El payload no incluye el username: se obtiene con una query extra
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', payload.new.user_id)
            .single();

          onMessage({
            id: payload.new.id,
            roomId: payload.new.room_id,
            userId: payload.new.user_id,
            content: payload.new.content,
            createdAt: new Date(payload.new.created_at),
            authorUsername: profile?.username,
            imageUrl: payload.new.image_url ?? undefined,
          });
        },
      )
      .subscribe();

    // Cleanup: cierra el canal (y su WebSocket) al desmontar el componente
    return () => {
      supabase.removeChannel(channel);
    };
  }

  private extensionFor(mimeType?: string): string {
    switch (mimeType) {
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      case 'image/heic':
      case 'image/heif':
        return 'heic';
      default:
        return 'jpg';
    }
  }

  // Mappers: snake_case de Supabase -> camelCase de nuestro dominio
  private mapRoom = (raw: any): Room => ({
    id: raw.id,
    name: raw.name,
    createdBy: raw.created_by,
    createdAt: new Date(raw.created_at),
  });

  private mapMessage = (raw: any): Message => ({
    id: raw.id,
    roomId: raw.room_id,
    userId: raw.user_id,
    content: raw.content,
    createdAt: new Date(raw.created_at),
    authorUsername: raw.profiles?.username,
    imageUrl: raw.image_url ?? undefined,
  });
}
