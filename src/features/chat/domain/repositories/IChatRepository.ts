import { Message } from '../entities/Message';
import { Room } from '../entities/Room';

// Datos de la imagen tal como los entrega el picker
export interface ImageToUpload {
  uri: string;
  mimeType?: string;
}

export interface IChatRepository {
  getRooms(): Promise<Room[]>;
  createRoom(name: string, userId: string): Promise<Room>;
  getMessages(roomId: string): Promise<Message[]>;
  sendMessage(roomId: string, userId: string, content: string, imageUrl?: string): Promise<Message>;
  uploadImage(roomId: string, userId: string, image: ImageToUpload): Promise<string>;
  removeImage(imageUrl: string): Promise<void>;
  // Devuelve la función unsubscribe, compatible con el return de useEffect
  subscribeToRoom(roomId: string, onMessage: (msg: Message) => void): () => void;
}
