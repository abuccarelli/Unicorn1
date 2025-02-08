import React, { useState } from 'react';
import { Tag, X, Plus } from 'lucide-react';
import { SubjectSelector } from '../profile/SubjectSelector';
import { LanguageSelector } from '../profile/LanguageSelector';
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
  const [tagInput, setTagInput] = useState('');
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const truncateLength = 300;
  const needsTruncation = post.description.length > truncateLength;

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onEditChange || !editData || !tagInput.trim()) return;

    // Format tag - capitalize first letter
    const formattedTag = tagInput.trim().charAt(0).toUpperCase() + tagInput.trim().slice(1).toLowerCase();
    
    if (editingTagIndex !== null) {
      // Modify existing tag
      const newTags = [...editData.tags];
      newTags[editingTagIndex] = formattedTag;
      onEditChange({ tags: newTags });
      setEditingTagIndex(null);
    } else {
      // Add new tag
      onEditChange({ tags: [...editData.tags, formattedTag] });
    }
    setTagInput('');
  };

  const handleTagEdit = (index: number) => {
    if (!editData) return;
    setTagInput(editData.tags[index]);
    setEditingTagIndex(index);
  };

  const handleTagDelete = (index: number) => {
    if (!onEditChange || !editData) return;
    const newTags = editData.tags.filter((_, i) => i !== index);
    onEditChange({ tags: newTags });
    if (editingTagIndex === index) {
      setEditingTagIndex(null);
      setTagInput('');
    }
  };

  if (isEditing && editData && onEditChange) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={editData.title}
                onChange={e => onEditChange({ title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={editData.description}
                onChange={e => onEditChange({ description: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <form onSubmit={handleTagSubmit} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder={editingTagIndex !== null ? "Edit tag..." : "Add a tag..."}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!tagInput.trim()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {editingTagIndex !== null ? 'Update' : <Plus className="h-5 w-5" />}
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                {editData.tags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm bg-gray-100 text-gray-800"
                  >
                    <Tag className="h-3.5 w-3.5" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagEdit(index)}
                      className="hover:text-indigo-600 p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTagDelete(index)}
                      className="hover:text-red-600 p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4">
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
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  <Tag className="h-3.5 w-3.5 mr-1" />
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