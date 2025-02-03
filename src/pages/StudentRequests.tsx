import React, { useState } from 'react';
import { BookingsList } from '../components/booking/BookingsList';
import { BookingStatusFilter } from '../components/booking/BookingStatusFilter';
import { useTeacherBookings } from '../hooks/useTeacherBookings';
import type { BookingStatus } from '../types/booking';

export function StudentRequests() {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'all'>('all');
  const { bookings, loading, error, approveBooking, rejectBooking } = useTeacherBookings();

  const filteredBookings = selectedStatus === 'all'
    ? bookings
    : bookings.filter(booking => booking.status === selectedStatus);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Requests</h1>
      
      <BookingStatusFilter
        selectedStatus={selectedStatus}
        onChange={setSelectedStatus}
        bookings={bookings}
      />

      <BookingsList
        bookings={filteredBookings}
        loading={loading}
        error={error}
        onApprove={approveBooking}
        onReject={rejectBooking}
      />
    </div>
  );
}