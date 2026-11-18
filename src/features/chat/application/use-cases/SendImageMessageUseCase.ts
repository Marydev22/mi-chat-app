import { ChatError } from '@shared/domain/errors/AppError';
import { Message } from '@features/chat/domain/entities/Message';
import {
  IChatRepository,
  ImageToUpload,
} from '@features/chat/domain/repositories/IChatRepository';

// Orquesta: subir la imagen a Storage -> guardar el mensaje -> limpiar si falla.
export class SendImageMessageUseCase {
  constructor(private readonly chatRepo: IChatRepository) {}

  async execute(roomId: string, userId: string, image: ImageToUpload): Promise<Message> {
    if (!image?.uri) throw new ChatError('Selecciona una imagen para enviar');

    let imageUrl: string;
    try {
      imageUrl = await this.chatRepo.uploadImage(roomId, userId, image);
    } catch (error) {
      throw new ChatError(`No se pudo subir la imagen: ${this.detail(error)}`, error);
    }

    try {
      
      return await this.chatRepo.sendMessage(roomId, userId, '', imageUrl);
    } catch (error) {
      // Evitamos dejar el archivo huérfano en Storage si no se guardó el mensaje.
      await this.chatRepo.removeImage(imageUrl).catch(() => {});
      throw new ChatError(`No se pudo enviar la imagen: ${this.detail(error)}`, error);
    }
  }

  private detail(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
