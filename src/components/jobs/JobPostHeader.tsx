import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MessageSquare, Eye, Edit, X, Check } from 'lucide-react';
import { DateTime } from 'luxon';
import { useAuthContext } from '../../context/AuthContext';
import type { JobPost } from '../../types/job';

interface JobPostHeaderProps {
  post: JobPost;
  onEdit?: () => void;
  isEditing?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
}

export function JobPostHeader({ post, onEdit, isEditing, onSave, onCancel }: JobPostHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const isOwner = user?.id === post.created_by;

  return (
    <>
      <button
        onClick={() => navigate(-1)} 
        className="mb-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </button>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
              <div className="mt-1 text-sm text-gray-500">
                Posted by{' '}
                {post.created_by_profile.firstName} {post.created_by_profile.lastName.charAt(0)}.
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isOwner && !isEditing && (
                <button
                  onClick={onEdit}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
              )}
              {isEditing && (
                <>
                  <button
                    onClick={onSave}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={onCancel}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </>
              )}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                post.status === 'open' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {post.status === 'open' ? 'Open' : 'Closed'}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center text-sm text-gray-500 space-x-4">
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {DateTime.fromISO(post.created_at).toRelative()}
            </span>
            <span className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              {post.comment_count || 0} {post.comment_count === 1 ? 'comment' : 'comments'}
            </span>
            <span className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {post.view_count || 0} {post.view_count === 1 ? 'view' : 'views'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}