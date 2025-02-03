import React from 'react';
import { RefreshCw } from 'lucide-react';
import { BookingCard } from './BookingCard';
import { LoadingSpinner } from '../../LoadingSpinner';
import type { Booking } from '../../../types/booking';

interface BookingsListProps {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  onCancel: (id: string) => Promise<void>;
  onPay: (id: string) => Promise<void>;
  onReschedule: (id: string, newStartTime: string, message?: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function BookingsList({ 
  bookings, 
  loading, 
  error, 
  onCancel, 
  onPay,
  onReschedule,
  onRefresh
}: BookingsListProps) {
  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No bookings found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={onCancel}
              onPay={onPay}
              onReschedule={onReschedule}
            />
          ))}
        </div>
      )}
    </div>
  );
}