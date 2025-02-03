import React from 'react';
import { useParams } from 'react-router-dom';
import { useTeacherProfile } from '../hooks/useTeacherProfile';
import { TeacherProfileHeader } from '../components/teachers/TeacherProfileHeader';
import { TeacherProfileDetails } from '../components/teachers/TeacherProfileDetails';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function TeacherProfile() {
  const { id } = useParams<{ id: string }>();
  const { teacher, loading, error } = useTeacherProfile(id!);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!teacher) return <div className="text-gray-600">Teacher not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TeacherProfileHeader teacher={teacher} />
      <TeacherProfileDetails teacher={teacher} />
    </div>
  );
}