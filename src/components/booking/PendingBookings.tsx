import React from 'react';
import { BookingRequestCard } from './BookingRequestCard';
import { useTeacherBookings } from '../../hooks/useTeacherBookings';
import { LoadingSpinner } from '../LoadingSpinner';

export function PendingBookings() {
  const { bookings, loading, error, approveBooking, rejectBooking } = useTeacherBookings();
  const pendingBookings = bookings.filter(booking => booking.status === 'pending');

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  if (pendingBookings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No pending booking requests</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {pendingBookings.map(booking => (
        <BookingRequestCard
          key={booking.id}
          booking={booking}
          onApprove={approveBooking}
          onReject={rejectBooking}
        />
      ))}
    </div>
  );
}