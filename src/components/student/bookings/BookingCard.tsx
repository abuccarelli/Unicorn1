import React, { useState } from 'react';
import { Clock, Calendar, MessageSquare, XCircle, CreditCard, CalendarClock, Globe } from 'lucide-react';
import { DateTime } from 'luxon';
import { BookingMessageModal } from '../../booking/BookingMessageModal';
import { RescheduleModal } from '../../booking/RescheduleModal';
import type { Booking } from '../../../types/booking';

interface BookingCardProps {
  booking: Booking;
  onCancel: (id: string) => Promise<void>;
  onPay: (id: string) => Promise<void>;
  onReschedule: (id: string, newStartTime: string, message?: string) => Promise<void>;
}

export function BookingCard({ booking, onCancel, onPay, onReschedule }: BookingCardProps) {
  const [showMessage, setShowMessage] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const startTime = DateTime.fromISO(booking.startTime.toString(), { zone: 'UTC' }).setZone(userTimezone);

  const handleReschedule = async (data: { bookingId: string; newStartTime: string; message?: string }) => {
    try {
      await onReschedule(data.bookingId, data.newStartTime, data.message);
      setShowReschedule(false);
    } catch (error) {
      console.error('Reschedule error:', error);
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending Approval' },
      approved: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Approved' },
      cancelled: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelled' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
      paid: { bg: 'bg-violet-100', text: 'text-violet-800', label: 'Paid' }
    };

    const config = statusConfig[booking.status];
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold shadow-sm`}>
        {config.label}
      </span>
    );
  };

  const canCancel = ['pending', 'approved'].includes(booking.status);
  const canPay = booking.status === 'approved';
  const canReschedule = ['pending', 'approved'].includes(booking.status);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{booking.subject}</h3>
            <p className="text-sm text-gray-600">with {booking.teacherName}</p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              <span>{startTime.toFormat('cccc, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <span>{startTime.toFormat('h:mm a')}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Globe className="h-4 w-4 mr-2 text-gray-400" />
              <span>{userTimezone}</span>
            </div>
          </div>

          {booking.message && (
            <button
              onClick={() => setShowMessage(true)}
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              View Message
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
          <div className="flex gap-2">
            {canPay && (
              <button
                onClick={() => onPay(booking.id)}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </button>
            )}
            {canReschedule && (
              <button
                onClick={() => setShowReschedule(true)}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <CalendarClock className="h-4 w-4 mr-2" />
                Reschedule
              </button>
            )}
          </div>
          {canCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <XCircle className="h-4 w-4 mr-2 text-gray-400" />
              Cancel Booking
            </button>
          )}
        </div>
      </div>

      {showMessage && booking.message && (
        <BookingMessageModal
          message={booking.message}
          onClose={() => setShowMessage(false)}
        />
      )}

      {showReschedule && (
        <RescheduleModal
          bookingId={booking.id}
          currentStartTime={booking.startTime}
          onClose={() => setShowReschedule(false)}
          onSubmit={handleReschedule}
        />
      )}
    </>
  );
}