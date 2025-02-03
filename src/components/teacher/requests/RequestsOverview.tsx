import React, { useState } from 'react';
import { RequestsStats } from './RequestsStats';
import { RequestsList } from './RequestsList';
import { useTeacherBookings } from '../../../hooks/useTeacherBookings';
import type { BookingStatus } from '../../../types/booking';

export function RequestsOverview() {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'all'>('all');
  const { 
    bookings, 
    loading, 
    error, 
    approveBooking, 
    rejectBooking,
    refreshBookingStatuses
  } = useTeacherBookings();

  const filteredBookings = selectedStatus === 'all'
    ? bookings
    : bookings.filter(booking => booking.status === selectedStatus);

  return (
    <div className="space-y-6">
      <RequestsStats 
        bookings={bookings}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />
      <RequestsList
        bookings={filteredBookings}
        loading={loading}
        error={error}
        onApprove={approveBooking}
        onReject={rejectBooking}
        onRefresh={refreshBookingStatuses}
      />
    </div>
  );
}