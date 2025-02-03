import React, { useState } from 'react';
import { useProfilePicture } from '../../hooks/useProfilePicture';
import { useImageUpload } from '../../hooks/useImageUpload';
import { ProfileImage } from './ProfileImage';
import { ImageUploadButton } from './ImageUploadButton';
import { CircularContainer } from './CircularContainer';
import type { Profile } from '../../types/profile';

interface ProfilePictureProps {
  profile: Profile;
  onUpdate: () => void;
}

export function ProfilePicture({ profile, onUpdate }: ProfilePictureProps) {
  const { uploadPicture, isUploading } = useProfilePicture(profile.id, onUpdate);
  const [imageError, setImageError] = useState(false);

  const { fileInputRef, handleClick, handleChange } = useImageUpload({
    onFileSelect: async (file) => {
      await uploadPicture(file);
      setImageError(false);
    }
  });

  return (
    <div className="flex flex-col items-center space-y-4">
      <CircularContainer>
        <ProfileImage
          src={!imageError ? profile.profile_image : null}
          alt={`${profile.firstName} ${profile.lastName}`}
          onError={() => setImageError(true)}
          className="w-full h-full"
        />
        <ImageUploadButton onClick={handleClick} isLoading={isUploading} />
      </CircularContainer>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}