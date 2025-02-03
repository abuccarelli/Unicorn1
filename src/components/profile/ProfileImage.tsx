import React from 'react';
import { UserCircle } from 'lucide-react';
import { getPublicUrl } from '../../utils/supabaseStorage';

interface ProfileImageProps {
  src: string | null;
  alt: string;
  onError: () => void;
  className?: string;
}

export function ProfileImage({ src, alt, onError, className = '' }: ProfileImageProps) {
  const imageUrl = getPublicUrl(src);

  if (!imageUrl) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <UserCircle className="w-20 h-20 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={imageUrl}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        onError={onError}
        loading="eager"
        crossOrigin="anonymous"
      />
    </div>
  );
}