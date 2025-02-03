import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { formatRelativeTime } from '../../utils/dateTime';

interface NotificationListProps {
  onClose: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const navigate = useNavigate();
  const { notifications, loading, error, markAsRead, markAllAsRead } = useNotifications();

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

  const handleClick = async (id: string, link?: string) => {
    await markAsRead(id);
    onClose();
    if (link) {
      navigate(link);
    }
  };

  return (
    <div className="divide-y divide-gray-100">
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
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
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleClick(notification.id, notification.link)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                notification.read ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
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
}