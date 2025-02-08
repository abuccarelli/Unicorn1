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
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch notifications handler with retry logic
  const fetchNotifications = useCallback(async (retryCount = 0) => {
    if (!user) {
      setNotifications([]);
      setCounts({ total: 0, unread: 0 });
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        // If session error, let auth context handle it
        if (fetchError.message?.includes('JWT')) {
          throw fetchError;
        }
        // For network errors, retry up to 3 times
        if (fetchError.message?.includes('Failed to fetch') && retryCount < 3) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          retryTimeoutRef.current = setTimeout(() => {
            if (mounted.current) {
              fetchNotifications(retryCount + 1);
            }
          }, delay);
          return;
        }
        throw fetchError;
      }

      // Deduplicate notifications
      const deduplicatedData = data?.reduce((acc, notification) => {
        const isDuplicate = acc.some(n => 
          n.content === notification.content &&
          n.type === notification.type &&
          Math.abs(
            DateTime.fromISO(n.created_at).toMillis() - 
            DateTime.fromISO(notification.created_at).toMillis()
          ) < 1000
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
        // Only show toast for non-network errors
        if (!err.message?.includes('Failed to fetch')) {
          toast.error('Failed to load notifications');
        }
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [user]);

  // Setup subscription
  useEffect(() => {
    mounted.current = true;

    if (!user) {
      setNotifications([]);
      setCounts({ total: 0, unread: 0 });
      setLoading(false);
      return;
    }

    // Setup realtime subscription
    const setupSubscription = async () => {
      try {
        // Clean up existing subscription
        if (channelRef.current) {
          await channelRef.current.unsubscribe();
        }

        const channel = supabase.channel(`notifications:${user.id}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          }, () => {
            if (mounted.current) {
              fetchNotifications();
            }
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED' && mounted.current) {
              fetchNotifications();
            }
          });

        channelRef.current = channel;

      } catch (err) {
        console.error('Subscription error:', err);
        // Retry subscription after delay
        setTimeout(() => {
          if (mounted.current) {
            setupSubscription();
          }
        }, 5000);
      }
    };

    setupSubscription();

    // Cleanup function
    return () => {
      mounted.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
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