import React from 'react';
import { Camera, Loader2 } from 'lucide-react';

interface ImageUploadButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export function ImageUploadButton({ onClick, isLoading }: ImageUploadButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-10"
      type="button"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
      ) : (
        <Camera className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
}