import React, { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MessageSquare, Eye, Edit, X, Check, XCircle } from 'lucide-react';
import { DateTime } from 'luxon';
import { toast } from 'react-hot-toast';
import { useAuthContext } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
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

  const handleClose = async () => {
    try {
      const { error } = await supabase.rpc('close_job_post', { post_id: post.id });
      
      if (error) throw error;
      
      toast.success('Job post closed successfully');
      // Refresh the page to show updated status
      window.location.reload();
    } catch (err) {
      console.error('Error closing job post:', err);
      toast.error('Failed to close job post');
    }
  };

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
              {isOwner && !isEditing && post.status === 'open' && (
                <>
                  <button
                    onClick={onEdit}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={handleClose}
                    className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Close Post
                  </button>
                </>
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