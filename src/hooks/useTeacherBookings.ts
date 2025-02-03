import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import type { Booking } from '../types/booking';

export function useTeacherBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          student:student_id(firstName, lastName)
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedBookings = data.map(booking => ({
        id: booking.id,
        teacherId: booking.teacher_id,
        studentId: booking.student_id,
        studentName: `${booking.student.firstName} ${booking.student.lastName}`,
        subject: booking.subject,
        startTime: booking.start_time,
        endTime: booking.end_time,
        status: booking.status,
        message: booking.message,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at
      }));

      setBookings(transformedBookings);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings');
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

      // Call the server-side function to refresh booking statuses
      const { data, error } = await supabase
        .rpc('refresh_booking_statuses', { user_id: user.id });

      if (error) throw error;

      // Fetch updated bookings
      await fetchBookings();
      toast.success('Booking statuses updated');
    } catch (err) {
      console.error('Error refreshing bookings:', err);
      toast.error('Failed to refresh bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id: string, status: 'approved' | 'cancelled') => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('bookings')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('teacher_id', user.id)
        .single();

      if (error) throw error;

      // After updating, refresh all bookings to get latest statuses
      await fetchBookings();
      toast.success(`Booking ${status === 'approved' ? 'approved' : 'rejected'}`);
    } catch (err) {
      console.error('Error updating booking:', err);
      toast.error(`Failed to ${status === 'approved' ? 'approve' : 'reject'} booking`);
    } finally {
      setLoading(false);
    }
  };

  const approveBooking = (id: string) => updateBookingStatus(id, 'approved');
  const rejectBooking = (id: string) => updateBookingStatus(id, 'cancelled');

  // Initial fetch
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    approveBooking,
    rejectBooking,
    refreshBookingStatuses,
    fetchBookings
  };
}