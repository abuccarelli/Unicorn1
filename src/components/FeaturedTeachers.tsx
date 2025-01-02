import React from 'react';
import { featuredTeachers } from '../data/featuredTeachers';
import { TeacherCard } from './TeacherCard';

export function FeaturedTeachers() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Teachers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredTeachers.map((teacher) => (
          <TeacherCard key={teacher.id} teacher={teacher} />
        ))}
      </div>
    </div>
  );
}