import React, { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationList } from './NotificationList';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { counts, loading, error, refresh } = useNotifications();

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    refresh();
  }, [refresh]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className="relative inline-block">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        aria-label={`${counts.unread || 0} unread notifications`}
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {!loading && counts.unread > 0 && (
          <span 
            className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-xs text-white font-medium flex items-center justify-center transform -translate-y-1/2 translate-x-1/2 border-2 border-white"
            aria-hidden="true"
          >
            {counts.unread > 99 ? '99+' : counts.unread}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={handleClose}
          />
          <div 
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-40 max-h-[80vh] overflow-y-auto transform -translate-x-1/2 sm:translate-x-0"
            role="dialog"
            aria-modal="true"
          >
            <NotificationList onClose={handleClose} />
          </div>
        </>
      )}
    </div>
  );
}