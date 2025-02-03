import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthContext } from '../../context/AuthContext';
import { BookingForm } from '../booking/BookingForm';
import { useBookings } from '../../hooks/useBookings';
import { supabase } from '../../lib/supabase';
import type { Teacher } from '../../types/teacher';
import type { BookingFormData } from '../../types/booking';

interface TeacherProfileDetailsProps {
  teacher: Teacher;
}

export function TeacherProfileDetails({ teacher }: TeacherProfileDetailsProps) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const { createBooking, loading } = useBookings();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handleBooking = async (data: BookingFormData) => {
    await createBooking(teacher.id, data);
    setShowBookingForm(false);
  };

  const handleMessage = async () => {
    if (!user) {
      toast.error('Please sign in to send messages');
      return;
    }

    try {
      // First check if user is a student
      if (user.user_metadata.role !== 'student') {
        toast.error('Only students can initiate conversations');
        return;
      }

      // Check for existing conversation
      const { data: existingConv, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('student_id', user.id)
        .eq('teacher_id', teacher.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingConv) {
        navigate(`/messages/${existingConv.id}`);
        return;
      }

      // Create new conversation
      const { data: newConv, error: insertError } = await supabase
        .from('conversations')
        .insert({
          student_id: user.id,
          teacher_id: teacher.id
        })
        .select()
        .single();

      if (insertError) throw insertError;

      navigate(`/messages/${newConv.id}`);
    } catch (err) {
      console.error('Error with conversation:', err);
      toast.error('Failed to start conversation. Please try again.');
    }
  };

  const isStudent = user?.user_metadata.role === 'student';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">About Me</h2>
        <p className="text-gray-600 whitespace-pre-wrap">{teacher.bio}</p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          {showBookingForm ? (
            <BookingForm teacher={teacher} onSubmit={handleBooking} />
          ) : (
            <>
              <button
                onClick={() => setShowBookingForm(true)}
                className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Book a Session
              </button>
              
              {isStudent && (
                <button
                  onClick={handleMessage}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Message Teacher
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}