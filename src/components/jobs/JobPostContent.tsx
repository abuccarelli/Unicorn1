import React, { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { SubjectSelector } from '../profile/SubjectSelector';
import { LanguageSelector } from '../profile/LanguageSelector';
import { TagInput } from './TagInput';
import type { JobPost } from '../../types/job';

interface JobPostContentProps {
  post: JobPost;
  isEditing?: boolean;
  editData?: {
    title: string;
    description: string;
    subjects: string[];
    languages: string[];
    tags: string[];
  };
  onEditChange?: (data: Partial<JobPost>) => void;
}

export function JobPostContent({ post, isEditing, editData, onEditChange }: JobPostContentProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const truncateLength = 300;
  const needsTruncation = post.description.length > truncateLength;

  // Initialize editData.tags from post.tags if not already set
  useEffect(() => {
    if (isEditing && editData && onEditChange && (!editData.tags || editData.tags.length === 0) && post.tags?.length > 0) {
      onEditChange({
        tags: post.tags.map(tag => tag.name)
      });
    }
  }, [isEditing, post.tags, editData, onEditChange]);

  if (isEditing && editData && onEditChange) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={editData.title}
              onChange={e => onEditChange({ title: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={editData.description}
              onChange={e => onEditChange({ description: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subjects</label>
            <div className="mt-1">
              <SubjectSelector
                selectedSubjects={editData.subjects}
                onChange={subjects => onEditChange({ subjects })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Languages</label>
            <div className="mt-1">
              <LanguageSelector
                selectedLanguages={editData.languages}
                onChange={languages => onEditChange({ languages })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tags</label>
            <div className="mt-1">
              <TagInput
                tags={editData.tags}
                onChange={tags => onEditChange({ tags })}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="p-6">
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">
            {showFullDescription ? post.description : post.description.slice(0, truncateLength)}
            {needsTruncation && (
              <>
                {!showFullDescription && '...'}
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="ml-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium focus:outline-none focus:underline"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                </button>
              </>
            )}
          </p>
        </div>

        {post.subjects?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {post.subjects.map((subject, index) => (
                <span
                  key={`${subject}-${index}`}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>
        )}

        {post.languages?.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {post.languages.map((language, index) => (
                <span
                  key={`${language}-${index}`}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>
        )}

        {post.tags?.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={`${tag.id}-${index}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                >
                  <Tag className="h-3.5 w-3.5 text-gray-500" />
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}