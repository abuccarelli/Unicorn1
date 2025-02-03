import { useState } from 'react';
import { DateTime } from 'luxon';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import type { BookingFormData, RescheduleData } from '../types/booking';

export function useBookings() {
  const [loading, setLoading] = useState(false);

  const createBooking = async (teacherId: string, data: BookingFormData) => {
    setLoading(true);
    try {
      if (!data.startTimeUTC) {
        throw new Error('Start time is required');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Convert to local DateTime for validation
      const startTime = DateTime.fromISO(data.startTimeUTC);
      const now = DateTime.now();

      // Client-side validation
      if (startTime <= now) {
        throw new Error('Booking time must be in the future');
      }

      // Calculate end time in UTC
      const endTime = startTime.plus({ hours: data.duration });

      const { error } = await supabase
        .from('bookings')
        .insert([
          {
            teacher_id: teacherId,
            student_id: user.id,
            subject: data.subject,
            start_time: startTime.toUTC().toISO(),
            end_time: endTime.toUTC().toISO(),
            message: data.message,
            status: 'pending'
          }
        ]);

      if (error) {
        console.error('Booking error:', error);
        throw new Error(error.message);
      }

      toast.success('Booking request sent successfully');
    } catch (err) {
      console.error('Error creating booking:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createBooking
  };
}