import React from 'react';
import { Clock, Calendar, MessageSquare } from 'lucide-react';
import { DateTime } from 'luxon';
import type { Booking } from '../../types/booking';

interface BookingRequestCardProps {
  booking: Booking;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export function BookingRequestCard({ booking, onApprove, onReject }: BookingRequestCardProps) {
  const startTime = DateTime.fromJSDate(new Date(booking.startTime));
  
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{booking.subject}</h3>
          <p className="text-sm text-gray-500">From: {booking.studentName}</p>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{startTime.toFormat('MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span>{startTime.toFormat('h:mm a')}</span>
        </div>
        {booking.message && (
          <div className="flex items-start text-sm text-gray-600">
            <MessageSquare className="h-4 w-4 mr-2 mt-1" />
            <p>{booking.message}</p>
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => onApprove(booking.id)}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Approve
        </button>
        <button
          onClick={() => onReject(booking.id)}
          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Reject
        </button>
      </div>
    </div>
  );
}