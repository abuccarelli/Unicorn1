export interface Conversation {
  id: string;
  bookingId: string;
  otherPartyId: string;
  otherPartyName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
}