export type NotificationType = 
  | 'message'
  | 'booking_approved'
  | 'booking_rejected'
  | 'booking_cancelled'
  | 'booking_rescheduled'
  | 'system_alert';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  link?: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    bookingId?: string;
    senderId?: string;
    senderName?: string;
  };
}

export interface NotificationCount {
  total: number;
  unread: number;
}