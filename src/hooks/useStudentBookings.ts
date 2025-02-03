import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { DateTime } from 'luxon';
import { supabase } from '../lib/supabase';
import type { Booking } from '../types/booking';

export function useStudentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, check for any bookings that need to be cancelled
      const { data: { server_time } } = await supabase
        .rpc('get_server_timestamp');

      // Get all bookings
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          teacher:teacher_id(firstName, lastName)
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      const transformedBookings = data?.map(booking => ({
        id: booking.id,
        teacherId: booking.teacher_id,
        teacherName: `${booking.teacher.firstName} ${booking.teacher.lastName}`,
        studentId: booking.student_id,
        subject: booking.subject,
        startTime: booking.start_time,
        endTime: booking.end_time,
        status: booking.status,
        message: booking.message,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at
      })) || [];

      setBookings(transformedBookings);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshBookingStatuses = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current server timestamp and update booking statuses
      const { data: { server_time }, error: timestampError } = await supabase
        .rpc('refresh_booking_statuses', { user_id: user.id });

      if (timestampError) throw timestampError;

      // Refetch bookings to get updated statuses
      await fetchBookings();
      toast.success('Booking statuses updated');
    } catch (err) {
      console.error('Error refreshing bookings:', err);
      toast.error('Failed to refresh bookings');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('student_id', user.id)
        .single();

      if (error) throw error;
      
      await fetchBookings();
      toast.success('Booking cancelled successfully');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error('Failed to cancel booking');
    }
  };

  const proceedToPayment = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('bookings')
        .update({ status: 'paid' })
        .eq('id', id)
        .eq('student_id', user.id)
        .single();

      if (error) throw error;
      
      await fetchBookings();
      toast.success('Payment processed successfully');
    } catch (err) {
      console.error('Error processing payment:', err);
      toast.error('Failed to process payment');
    }
  };

  const rescheduleBooking = async (bookingId: string, newStartTime: string, message?: string) => {
    if (!bookingId || typeof bookingId !== 'string') {
      toast.error('Invalid booking ID');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select()
        .eq('id', bookingId)
        .eq('student_id', user.id)
        .single();

      if (fetchError || !booking) {
        throw new Error('Booking not found');
      }

      // Convert local time to UTC for storage
      const startTimeUTC = DateTime.fromISO(newStartTime, { zone: 'local' }).toUTC().toISO();
      if (!startTimeUTC) {
        throw new Error('Invalid start time');
      }

      // Calculate end time (1 hour duration)
      const endTimeUTC = DateTime.fromISO(startTimeUTC).plus({ hours: 1 }).toISO();

      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          start_time: startTimeUTC,
          end_time: endTimeUTC,
          status: 'pending',
          message: message?.trim() || null
        })
        .eq('id', bookingId)
        .eq('student_id', user.id);

      if (updateError) throw updateError;

      await fetchBookings();
      toast.success('Booking rescheduled successfully');
    } catch (err) {
      console.error('Error rescheduling booking:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to reschedule booking');
      throw err;
    }
  };

  return {
    bookings,
    loading,
    error,
    cancelBooking,
    proceedToPayment,
    rescheduleBooking,
    refreshBookingStatuses,
    fetchBookings
  };
}