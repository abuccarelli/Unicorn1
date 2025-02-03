import React from 'react';
import type { Booking, BookingStatus } from '../../../types/booking';

interface RequestsFilterProps {
  selectedStatus: BookingStatus | 'all';
  onChange: (status: BookingStatus | 'all') => void;
  bookings: Booking[];
}

export function RequestsFilter({ selectedStatus, onChange, bookings }: RequestsFilterProps) {
  const getStatusCount = (status: BookingStatus) => 
    bookings.filter(booking => booking.status === status).length;

  const filters = [
    { value: 'all', label: 'All', count: bookings.length },
    { value: 'pending', label: 'Pending', count: getStatusCount('pending') },
    { value: 'approved', label: 'Approved', count: getStatusCount('approved') },
    { value: 'cancelled', label: 'Rejected', count: getStatusCount('cancelled') },
    { value: 'completed', label: 'Completed', count: getStatusCount('completed') }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          {filters.map(({ value, label, count }) => (
            <button
              key={value}
              onClick={() => onChange(value as BookingStatus | 'all')}
              className={`
                whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm
                ${selectedStatus === value
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {label} ({count})
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}