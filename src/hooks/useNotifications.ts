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

  // Validate date helper
  const validateDate = useCallback((dateStr: string): string => {
    try {
      const dt = DateTime.fromISO(dateStr, { zone: 'UTC' });
      if (!dt.isValid) {
        console.error('Invalid date detected:', dateStr);
        return DateTime.now().toISO()!;
      }
      return dt.toISO()!;
    } catch (error) {
      console.error('Date validation error:', error);
      return DateTime.now().toISO()!;
    }
  }, []);

  // Fetch notifications handler
  const fetchNotifications = useCallback(async () => {
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

      if (mounted.current) {
        setNotifications(notificationData);
        setCounts({
          total: notificationData.length,
          unread: notificationData.filter(n => !n.read).length
        });
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
      if (mounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
        toast.error('Failed to load notifications');
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [user, validateDate]);

  // Setup real-time subscription
  useEffect(() => {
    if (!user) return;

    const setupSubscription = async () => {
      try {
        // Clean up existing subscription
        if (channelRef.current) {
          await channelRef.current.unsubscribe();
        }

        const channel = supabase.channel(`user_notifications:${user.id}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          }, () => {
            if (mounted.current) {
              fetchNotifications();
            }
          });

        channelRef.current = channel;
        await channel.subscribe();
      } catch (error) {
        console.error('Subscription error:', error);
        toast.error('Failed to subscribe to notifications');
      }
    };

    setupSubscription();
    fetchNotifications();

    return () => {
      mounted.current = false;
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [user, fetchNotifications]);

  // Mark as read handler
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

  // Mark all as read handler
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