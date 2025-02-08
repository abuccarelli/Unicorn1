import React from 'react';
import { Book, Globe, Clock, Hash } from 'lucide-react';
import { DateTime } from 'luxon';
import { ProfileImage } from '../profile/ProfileImage';
import { StatusIndicator } from '../presence/StatusIndicator';
import { usePresence } from '../../hooks/usePresence';
import type { Teacher } from '../../types/teacher';

interface TeacherProfileHeaderProps {
  teacher: Teacher;
}

export function TeacherProfileHeader({ teacher }: TeacherProfileHeaderProps) {
  const { status } = usePresence(teacher.id);
  const shortId = teacher.id.split('-')[0]; // Take just the first part of UUID

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
          <div className="w-48 h-48 flex-shrink-0">
            <ProfileImage
              src={teacher.profile_image}
              alt={`${teacher.firstName} ${teacher.lastName.charAt(0)}.`}
              onError={() => {}}
              className="w-full h-full rounded-full"
            />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {teacher.firstName} {teacher.lastName.charAt(0)}.
              </h1>
              <div className="flex flex-col items-center md:items-end space-y-2 mt-2 md:mt-0">
                <div className="flex items-center text-sm text-gray-600">
                  <Hash className="h-4 w-4 mr-2" />
                  <span>ID: {shortId}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Last seen: {
                    status === 'online' 
                      ? 'Online now'
                      : DateTime.now().toFormat('dd.MM.yyyy')
                  }</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
              {teacher.subjects && teacher.subjects.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-gray-500 mb-1">Subjects</h3>
                  <div className="flex flex-wrap gap-2">
                    {teacher.subjects.map(subject => (
                      <span
                        key={subject}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {teacher.languages && teacher.languages.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-gray-500 mb-1">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {teacher.languages.map(language => (
                      <span
                        key={language}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
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