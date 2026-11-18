import { Message } from '@features/chat/domain/entities/Message';
import { IChatRepository } from '@features/chat/domain/repositories/IChatRepository';

export class GetMessagesUseCase {
  constructor(private readonly chatRepo: IChatRepository) {}

  execute(roomId: string): Promise<Message[]> {
    return this.chatRepo.getMessages(roomId);
  }
}
