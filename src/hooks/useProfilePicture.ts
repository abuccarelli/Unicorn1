import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { validateImage } from '../utils/imageValidation';
import { uploadFile } from '../utils/supabaseStorage';

export function useProfilePicture(profileId: string, onUpdate: () => void) {
  const [isUploading, setIsUploading] = useState(false);

  const uploadPicture = async (file: File) => {
    const validation = validateImage(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid image file');
      return;
    }

    setIsUploading(true);
    try {
      // Upload file and get path
      const filePath = await uploadFile(profileId, file);

      // Update profile with file path (not URL)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image: filePath })
        .eq('id', profileId);

      if (updateError) throw updateError;

      toast.success('Profile picture updated successfully');
      onUpdate();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadPicture
  };
}