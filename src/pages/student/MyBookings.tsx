import React, { useState, useEffect } from 'react';
import { BookingsList } from '../../components/student/bookings/BookingsList';
import { BookingsFilter } from '../../components/student/bookings/BookingsFilter';
import { useStudentBookings } from '../../hooks/useStudentBookings';
import type { BookingStatus } from '../../types/booking';

export function MyBookings() {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'all'>('all');
  const { 
    bookings, 
    loading, 
    error, 
    cancelBooking, 
    proceedToPayment,
    rescheduleBooking,
    refreshBookingStatuses,
    fetchBookings
  } = useStudentBookings();

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = selectedStatus === 'all'
    ? bookings
    : bookings.filter(booking => booking.status === selectedStatus);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
      
      <BookingsFilter
        selectedStatus={selectedStatus}
        onChange={setSelectedStatus}
        bookings={bookings}
      />

      <BookingsList
        bookings={filteredBookings}
        loading={loading}
        error={error}
        onCancel={cancelBooking}
        onPay={proceedToPayment}
        onReschedule={rescheduleBooking}
        onRefresh={refreshBookingStatuses}
      />
    </div>
  );
}