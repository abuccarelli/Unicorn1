import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Tag, MessageSquare, Eye } from 'lucide-react';
import { DateTime } from 'luxon';
import type { JobPost } from '../../types/job';

interface JobCardProps {
  job: JobPost;
}

// Helper function to capitalize first letter
const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export function JobCard({ job }: JobCardProps) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
          <p className="text-sm text-gray-500">
            Posted by {job.created_by_profile.firstName} {job.created_by_profile.lastName.charAt(0)}.
          </p>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
          job.status === 'open' 
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {job.status === 'open' ? 'Open' : 'Closed'}
        </span>
      </div>

      <p className="mt-2 text-gray-600 line-clamp-2">{job.description}</p>

      <div className="mt-4 space-y-2">
        {job.subjects?.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-1">Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {job.subjects.slice(0, 3).map(subject => (
                <span
                  key={subject}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {subject}
                </span>
              ))}
              {job.subjects.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{job.subjects.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {job.languages?.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-1">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {job.languages.slice(0, 3).map(language => (
                <span
                  key={language}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                >
                  {language}
                </span>
              ))}
              {job.languages.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{job.languages.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {job.tags?.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-1">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {job.tags.slice(0, 3).map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {capitalizeFirstLetter(tag.name)}
                </span>
              ))}
              {job.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{job.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center text-sm text-gray-500 space-x-4">
        <span className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {DateTime.fromISO(job.created_at).toRelative()}
        </span>
        <span className="flex items-center">
          <MessageSquare className="h-4 w-4 mr-1" />
          {job.comment_count || 0} {job.comment_count === 1 ? 'reply' : 'replies'}
        </span>
        <span className="flex items-center">
          <Eye className="h-4 w-4 mr-1" />
          {job.view_count || 0} {job.view_count === 1 ? 'view' : 'views'}
        </span>
      </div>
    </Link>
  );
}