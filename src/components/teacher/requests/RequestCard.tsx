import React from 'react';
import { Clock, Calendar, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { formatDate, formatTime } from '../../../utils/dateTime';
import type { Booking } from '../../../types/booking';

interface RequestCardProps {
  booking: Booking;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export function RequestCard({ booking, onApprove, onReject }: RequestCardProps) {
  const getStatusBadge = () => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
      paid: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Paid' }
    };

    const config = statusConfig[booking.status];
    return (
      <span className={`${config.bg} ${config.text} px-2.5 py-0.5 rounded-full text-xs font-medium`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{booking.subject}</h3>
          <p className="text-sm text-gray-500">From: {booking.studentName}</p>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{formatDate(booking.startTime)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span>{formatTime(booking.startTime)}</span>
        </div>
        {booking.message && (
          <div className="flex items-start text-sm text-gray-600">
            <MessageSquare className="h-4 w-4 mr-2 mt-1" />
            <p>{booking.message}</p>
          </div>
        )}
      </div>

      {booking.status === 'pending' && (
        <div className="flex space-x-3">
          <button
            onClick={() => onApprove(booking.id)}
            className="flex-1 inline-flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </button>
          <button
            onClick={() => onReject(booking.id)}
            className="flex-1 inline-flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}