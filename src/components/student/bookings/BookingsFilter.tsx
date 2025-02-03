import React from 'react';
import { Clock, CheckCircle, XCircle, CheckSquare, CreditCard } from 'lucide-react';
import type { Booking, BookingStatus } from '../../../types/booking';

interface BookingsFilterProps {
  selectedStatus: BookingStatus | 'all';
  onChange: (status: BookingStatus | 'all') => void;
  bookings: Booking[];
}

export function BookingsFilter({ selectedStatus, onChange, bookings }: BookingsFilterProps) {
  const getStatusCount = (status: BookingStatus) => 
    bookings.filter(booking => booking.status === status).length;

  const stats = [
    { 
      value: 'pending',
      label: 'Pending',
      count: getStatusCount('pending'),
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    { 
      value: 'approved',
      label: 'Approved',
      count: getStatusCount('approved'),
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    { 
      value: 'paid',
      label: 'Paid',
      count: getStatusCount('paid'),
      icon: CreditCard,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    { 
      value: 'cancelled',
      label: 'Rejected',
      count: getStatusCount('cancelled'),
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    { 
      value: 'completed',
      label: 'Completed',
      count: getStatusCount('completed'),
      icon: CheckSquare,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {stats.map(({ value, label, count, icon: Icon, color, bg }) => (
        <button
          key={value}
          onClick={() => onChange(value as BookingStatus)}
          className={`p-4 rounded-lg transition-colors ${
            selectedStatus === value ? bg : 'bg-white'
          } hover:bg-gray-50 shadow-sm`}
        >
          <div className="flex items-center">
            <Icon className={`h-5 w-5 ${color}`} />
            <span className="ml-2 text-sm font-medium text-gray-900">{label}</span>
          </div>
          <p className={`mt-2 text-2xl font-semibold ${color}`}>{count}</p>
        </button>
      ))}
    </div>
  );
}