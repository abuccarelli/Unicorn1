import React, { useState } from 'react';
import { DateTime } from 'luxon';
import { useAuthContext } from '../../context/AuthContext';
import type { JobComment } from '../../types/job';

interface JobCommentsProps {
  comments: JobComment[];
  onAddComment: (content: string) => Promise<void>;
}

export function JobComments({ comments, onAddComment }: JobCommentsProps) {
  const { user } = useAuthContext();
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onAddComment(comment.trim());
      setComment('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Comments</h2>
        
        <div className="space-y-6">
          {comments.map(comment => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {comment.profile.firstName} {comment.profile.lastName.charAt(0)}.
                    </div>
                    <p className="text-xs text-gray-500">
                      {DateTime.fromISO(comment.created_at).toRelative()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                {comment.content}
              </div>
            </div>
          ))}

          {user && (
            <form onSubmit={handleSubmit} className="mt-6">
              <div>
                <label htmlFor="comment" className="sr-only">Comment</label>
                <textarea
                  id="comment"
                  rows={3}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Add a comment..."
                  required
                />
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !comment.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}