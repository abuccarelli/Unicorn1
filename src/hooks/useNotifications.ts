import { useState, useEffect, useCallback, useRef } from 'react';
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
  const channelRef = useRef<any>(null);
  const mounted = useRef(true);

  // Fetch notifications handler
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setCounts({ total: 0, unread: 0 });
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching notifications for user:', user.id);
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Deduplicate notifications by content and created_at within a 1-second window
      const deduplicatedData = data?.reduce((acc, notification) => {
        const isDuplicate = acc.some(n => 
          n.content === notification.content &&
          n.type === notification.type &&
          Math.abs(
            DateTime.fromISO(n.created_at).toMillis() - 
            DateTime.fromISO(notification.created_at).toMillis()
          ) < 1000 // 1 second window
        );

        if (!isDuplicate) {
          acc.push(notification);
        }
        return acc;
      }, [] as any[]) || [];

      const notificationData = deduplicatedData.map(notification => ({
        ...notification,
        createdAt: notification.created_at
      }));

      if (mounted.current) {
        setNotifications(notificationData);
        setCounts({
          total: notificationData.length,
          unread: notificationData.filter(n => !n.read).length
        });
        setError(null);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
      if (mounted.current) {
        setError('Failed to load notifications');
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [user]);

  // Setup subscription
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setCounts({ total: 0, unread: 0 });
      setLoading(false);
      return;
    }

    console.log('Setting up notifications subscription');
    setLoading(true);

    const channel = supabase.channel(`notifications:${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        console.log('Notification change detected, refreshing...');
        // Add a small delay to ensure all notifications are created
        setTimeout(fetchNotifications, 100);
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          fetchNotifications();
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('Cleaning up notifications subscription');
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [user, fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
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
  }, [user]);

  const markAllAsRead = useCallback(async () => {
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
  }, [user]);

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