export interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationCount {
  total: number;
  unread: number;
}