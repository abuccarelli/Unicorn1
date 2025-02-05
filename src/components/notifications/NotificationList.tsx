import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Loader2, MessageSquare, Calendar, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { formatRelativeTime } from '../../utils/dateTime';
import type { NotificationType } from '../../types/notification';

interface NotificationListProps {
  onClose: () => void;
}

// Memoize notification icon mapping
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'message':
      return <MessageSquare className="h-5 w-5 text-blue-500" />;
    case 'booking_approved':
      return <Check className="h-5 w-5 text-green-500" />;
    case 'booking_rejected':
    case 'booking_cancelled':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'booking_rescheduled':
      return <Calendar className="h-5 w-5 text-orange-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

// Memoize notification color mapping
const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'message':
      return 'bg-blue-50';
    case 'booking_approved':
      return 'bg-green-50';
    case 'booking_rejected':
    case 'booking_cancelled':
      return 'bg-red-50';
    case 'booking_rescheduled':
      return 'bg-orange-50';
    case 'system_alert':
      return 'bg-yellow-50';
    default:
      return 'bg-gray-50';
  }
};

export const NotificationList = React.memo(({ onClose }: NotificationListProps) => {
  const navigate = useNavigate();
  const { notifications, loading, error, markAsRead, markAllAsRead } = useNotifications();

  // Memoize handlers
  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleClick = useCallback(async (id: string, link?: string) => {
    await markAsRead(id);
    onClose();
    if (link) {
      navigate(link);
    }
  }, [markAsRead, onClose, navigate]);

  // Memoize sorted notifications
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-indigo-600" />
        <p className="mt-2 text-gray-500">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Failed to load notifications</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Bell className="h-8 w-8 mx-auto mb-2" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto">
          {sortedNotifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleClick(notification.id, notification.link)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                notification.read ? 'opacity-75' : ''
              } ${getNotificationColor(notification.type)}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-indigo-600'}`}>
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{notification.content}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </div>
                {!notification.read && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    New
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

NotificationList.displayName = 'NotificationList';