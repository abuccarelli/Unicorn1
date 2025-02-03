import React from 'react';
import { Book, Globe } from 'lucide-react';
import { ProfileImage } from '../profile/ProfileImage';
import type { Teacher } from '../../types/teacher';

interface TeacherProfileHeaderProps {
  teacher: Teacher;
}

export function TeacherProfileHeader({ teacher }: TeacherProfileHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
          <div className="w-48 h-48 flex-shrink-0">
            <ProfileImage
              src={teacher.profile_image}
              alt={`${teacher.firstName} ${teacher.lastName}`}
              onError={() => {}}
              className="w-full h-full rounded-full"
            />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">
              {teacher.firstName} {teacher.lastName}
            </h1>
            
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
              {teacher.subjects && teacher.subjects.length > 0 && (
                <div className="flex items-center text-gray-600">
                  <Book className="h-5 w-5 mr-2" />
                  <span>{teacher.subjects.join(', ')}</span>
                </div>
              )}
              
              {teacher.languages && teacher.languages.length > 0 && (
                <div className="flex items-center text-gray-600">
                  <Globe className="h-5 w-5 mr-2" />
                  <span>{teacher.languages.join(', ')}</span>
                </div>
              )}
            </div>

            {teacher.hourly_rate && teacher.currency && (
              <div className="mt-4">
                <span className="text-2xl font-bold text-indigo-600">
                  {teacher.currency} {teacher.hourly_rate}
                </span>
                <span className="text-gray-600">/hour</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}