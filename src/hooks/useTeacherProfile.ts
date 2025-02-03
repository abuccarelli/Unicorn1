import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Teacher } from '../types/teacher';

export function useTeacherProfile(teacherId: string) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeacher() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', teacherId)
          .eq('role', 'teacher')
          .single();

        if (error) throw error;
        setTeacher(data as Teacher);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch teacher profile');
      } finally {
        setLoading(false);
      }
    }

    fetchTeacher();
  }, [teacherId]);

  return { teacher, loading, error };
}