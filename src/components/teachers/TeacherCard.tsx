import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Book, Globe } from 'lucide-react';
import { ProfileImage } from '../profile/ProfileImage';
import { StatusIndicator } from '../presence/StatusIndicator';
import { usePresence } from '../../hooks/usePresence';
import type { Teacher } from '../../types/teacher';

interface TeacherCardProps {
  teacher: Teacher;
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  const { status } = usePresence(teacher.id);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <ProfileImage
          src={teacher.profile_image}
          alt={`${teacher.firstName} ${teacher.lastName}`}
          onError={() => {}}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <StatusIndicator 
            status={status} 
            className="h-4 w-4"
          />
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-900">
            {teacher.firstName} {teacher.lastName}
          </h3>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${
              status === 'online' ? 'text-green-600' :
              status === 'busy' ? 'text-red-600' :
              status === 'away' ? 'text-yellow-600' :
              'text-gray-600'
            }`}>
              {status === 'online' ? 'Available' :
               status === 'busy' ? 'In a call' :
               status === 'away' ? 'Away' :
               'Offline'}
            </span>
          </div>
        </div>
        
        <p className="mt-2 text-gray-600 line-clamp-2">{teacher.bio}</p>
        
        <div className="mt-4 space-y-3">
          {teacher.subjects && teacher.subjects.length > 0 && (
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Book className="h-4 w-4 mr-2" />
                <span className="font-medium">Subjects</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {teacher.subjects.map(subject => (
                  <span
                    key={subject}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {teacher.languages && teacher.languages.length > 0 && (
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Globe className="h-4 w-4 mr-2" />
                <span className="font-medium">Languages</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {teacher.languages.map(language => (
                  <span
                    key={language}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}

          {teacher.hourly_rate && teacher.currency && (
            <div className="flex items-center text-sm font-medium mt-4">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-indigo-600">
                {teacher.currency} {teacher.hourly_rate}/hour
              </span>
            </div>
          )}
        </div>

        <Link 
          to={`/teachers/${teacher.id}`}
          className="mt-6 block w-full text-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}