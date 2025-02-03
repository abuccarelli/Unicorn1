import React, { useState } from 'react';
import { X, Clock, Calendar } from 'lucide-react';
import { DateTime } from 'luxon';
import { storeDateTime } from '../../utils/dateTime';
import type { RescheduleData } from '../../types/booking';

interface RescheduleModalProps {
  onClose: () => void;
  onSubmit: (data: RescheduleData) => Promise<void>;
  bookingId: string;
  currentStartTime: string | Date;
}

export function RescheduleModal({ onClose, onSubmit, bookingId, currentStartTime }: RescheduleModalProps) {
  const currentDate = DateTime.fromISO(currentStartTime.toString());
  const [date, setDate] = useState(currentDate.toFormat('yyyy-MM-dd'));
  const [time, setTime] = useState(currentDate.toFormat('HH:mm'));
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const newStartTime = storeDateTime(date, time);
      await onSubmit({
        bookingId,
        newStartTime,
        message: message.trim() || undefined
      });
    } catch (error) {
      console.error('Reschedule error:', error);
    } finally {
      setLoading(false);
    }
  };

  const minDate = DateTime.now().toFormat('yyyy-MM-dd');

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reschedule Booking</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4 inline mr-2" />
              New Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={minDate}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4 inline mr-2" />
              New Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reason for Rescheduling (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Please provide a reason for rescheduling..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Rescheduling...' : 'Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}