import React from 'react';
import { RefreshCw } from 'lucide-react';
import { RequestCard } from './RequestCard';
import { LoadingSpinner } from '../../LoadingSpinner';
import type { Booking } from '../../../types/booking';

interface RequestsListProps {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function RequestsList({ 
  bookings, 
  loading, 
  error, 
  onApprove, 
  onReject,
  onRefresh 
}: RequestsListProps) {
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

      {loading ? (
        <LoadingSpinner />
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No requests found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map(booking => (
            <RequestCard
              key={booking.id}
              booking={booking}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}