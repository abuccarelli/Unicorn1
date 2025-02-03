import React from 'react';
import type { Booking, BookingStatus } from '../../types/booking';

interface BookingStatusFilterProps {
  selectedStatus: BookingStatus | 'all';
  onChange: (status: BookingStatus | 'all') => void;
  bookings: Booking[];
}

export function BookingStatusFilter({ selectedStatus, onChange, bookings }: BookingStatusFilterProps) {
  const getStatusCount = (status: BookingStatus) => 
    bookings.filter(booking => booking.status === status).length;

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => onChange('all')}
            className={`
              whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm
              ${selectedStatus === 'all'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => onChange('pending')}
            className={`
              whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm
              ${selectedStatus === 'pending'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Pending ({getStatusCount('pending')})
          </button>
          <button
            onClick={() => onChange('confirmed')}
            className={`
              whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm
              ${selectedStatus === 'confirmed'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Approved ({getStatusCount('confirmed')})
          </button>
          <button
            onClick={() => onChange('cancelled')}
            className={`
              whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm
              ${selectedStatus === 'cancelled'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Rejected ({getStatusCount('cancelled')})
          </button>
          <button
            onClick={() => onChange('completed')}
            className={`
              whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm
              ${selectedStatus === 'completed'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Completed ({getStatusCount('completed')})
          </button>
        </nav>
      </div>
    </div>
  );
}