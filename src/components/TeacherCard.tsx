import React from 'react';
import { Clock, Star, Book } from 'lucide-react';
import type { User } from '../types';

interface TeacherCardProps {
  teacher: User;
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <img
          src={teacher.profileImage || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80'}
          alt={teacher.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900">{teacher.name}</h3>
        <p className="mt-2 text-gray-600 line-clamp-2">{teacher.bio}</p>
        
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>60 min</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Star className="h-4 w-4 mr-1 text-yellow-400" />
            <span>4.9 (128)</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Book className="h-4 w-4 mr-1" />
            <span>{teacher.subjects?.join(', ')}</span>
          </div>
        </div>

        <button className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
          Book a Session
        </button>
      </div>
    </div>
  );
}