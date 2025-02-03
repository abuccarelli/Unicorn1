import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Clock, Globe } from 'lucide-react';
import { DateTime } from 'luxon';
import { useAuthContext } from '../../context/AuthContext';
import type { Teacher } from '../../types/teacher';
import type { BookingFormData } from '../../types/booking';

interface BookingFormProps {
  teacher: Teacher;
  onSubmit: (data: BookingFormData) => Promise<void>;
}

export function BookingForm({ teacher, onSubmit }: BookingFormProps) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    subject: teacher.subjects?.[0] || '',
    date: '',
    time: '',
    duration: 1,
    message: ''
  });

  // Get user's timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const teacherTimezone = teacher.timezone || userTimezone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to book a session');
      return;
    }

    setLoading(true);
    try {
      // Create DateTime object from local input in user's timezone
      const localDateTime = DateTime.fromFormat(
        `${formData.date} ${formData.time}`,
        'yyyy-MM-dd HH:mm',
        { zone: userTimezone }
      );

      if (!localDateTime.isValid) {
        throw new Error('Invalid date or time');
      }

      // Convert to UTC for storage
      const startTimeUTC = localDateTime.toUTC().toISO();
      
      await onSubmit({
        ...formData,
        startTimeUTC
      });
      toast.success('Booking request sent successfully');
    } catch (error) {
      toast.error('Failed to submit booking request');
    } finally {
      setLoading(false);
    }
  };

  // Convert selected time to teacher's timezone for preview
  const getTeacherTime = (): string | null => {
    if (!formData.date || !formData.time) return null;
    
    // Create DateTime object from local input in user's timezone
    const localDateTime = DateTime.fromFormat(
      `${formData.date} ${formData.time}`, 
      'yyyy-MM-dd HH:mm',
      { zone: userTimezone }
    );

    if (!localDateTime.isValid) return null;

    // Convert to teacher's timezone
    const teacherTime = localDateTime.setZone(teacherTimezone);
    return teacherTime.toFormat('h:mm a');
  };

  const teacherTime = getTeacherTime();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Subject</label>
        <select
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Select a subject</option>
          {teacher.subjects?.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Time</label>
        <div className="mt-1 space-y-2">
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
          <div className="flex items-start space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Your time ({userTimezone})</span>
            </div>
            {teacherTime && (
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                <span>Teacher's time: {teacherTime} ({teacherTimezone})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Duration (hours)</label>
        <input
          type="number"
          min="1"
          step="1"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value, 10) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Message (Optional)</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Any specific requirements or topics you'd like to cover?"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Rate: {teacher.currency} {teacher.hourly_rate}/hour
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Book Session'}
        </button>
      </div>
    </form>
  );
}