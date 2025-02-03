import React from 'react';
import { TeacherCard } from './TeacherCard';
import type { Teacher } from '../../types/teacher';

interface TeacherListProps {
  teachers: Teacher[];
}

export function TeacherList({ teachers }: TeacherListProps) {
  if (teachers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No teachers found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {teachers.map(teacher => (
        <TeacherCard key={teacher.id} teacher={teacher} />
      ))}
    </div>
  );
}