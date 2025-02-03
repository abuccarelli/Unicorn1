import React from 'react';
import { BookingCard } from './BookingCard';
import { LoadingSpinner } from '../LoadingSpinner';
import type { Booking } from '../../types/booking';

interface BookingsListProps {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export function BookingsList({ bookings, loading, error, onApprove, onReject }: BookingsListProps) {
  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No booking requests found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {bookings.map(booking => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  );
}