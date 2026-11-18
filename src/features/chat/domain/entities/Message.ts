export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt: Date;
  authorUsername?: string; // Desnormalización controlada para la UI
  imageUrl?: string; }
