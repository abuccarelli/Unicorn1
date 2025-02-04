import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';
import type { Notification, NotificationCount } from '../types/notification';
import { DateTime } from 'luxon';

export function useNotifications() {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counts, setCounts] = useState<NotificationCount>({ total: 0, unread: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validateDate = (dateStr: string): string => {
    try {
      const dt = DateTime.fromISO(dateStr, { zone: 'UTC' });
      if (!dt.isValid) {
        console.error('Invalid date detected:', dateStr);
        return 'Invalid date';
      }
      return dt.toISO();
    } catch (error) {
      console.error('Date validation error:', error);
      return 'Invalid date';
    }
  };

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setCounts({ total: 0, unread: 0 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const notificationData = (data || []).map(notification => ({
        ...notification,
        createdAt: validateDate(notification.created_at)
      }));

      setNotifications(notificationData);
      setCounts({
        total: notificationData.length,
        unread: notificationData.filter(n => !n.read).length
      });
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (user) {
      const channel = supabase.channel(`user_notifications:${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchNotifications();
        })
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(current =>
        current.map(n => n.id === id ? { ...n, read: true } : n)
      );

      setCounts(current => ({
        ...current,
        unread: Math.max(0, current.unread - 1)
      }));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(current =>
        current.map(n => ({ ...n, read: true }))
      );

      setCounts(current => ({
        ...current,
        unread: 0
      }));

      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Failed to mark all notifications as read');
    }
  };

  return {
    notifications,
    counts,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
}