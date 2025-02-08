import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useJobPost } from '../hooks/useJobPost';
import { JobPostHeader } from '../components/jobs/JobPostHeader';
import { JobPostContent } from '../components/jobs/JobPostContent';
import { JobComments } from '../components/jobs/JobComments';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function JobPost() {
  const { post, comments, loading, error, addComment, updatePost } = useJobPost();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    subjects: [] as string[],
    languages: [] as string[],
    tags: [] as string[]
  });

  const handleEdit = () => {
    if (!post) return;
    setEditData({
      title: post.title,
      description: post.description,
      subjects: post.subjects || [],
      languages: post.languages || [],
      tags: post.tags.map(tag => tag.name)
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!post) return;
    try {
      await updatePost(post.id, editData);
      setIsEditing(false);
      toast.success('Job post updated successfully');
    } catch (error) {
      toast.error('Failed to update job post');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      title: '',
      description: '',
      subjects: [],
      languages: [],
      tags: []
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error || !post) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-red-600">{error || 'Job post not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JobPostHeader 
        post={post}
        isEditing={isEditing}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      <JobPostContent 
        post={post}
        isEditing={isEditing}
        editData={editData}
        onEditChange={changes => setEditData(prev => ({ ...prev, ...changes }))}
      />
      <JobComments comments={comments} onAddComment={addComment} />
    </div>
  );
}