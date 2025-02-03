import { useRef, useState } from 'react';

interface UseImageUploadProps {
  onFileSelect: (file: File) => Promise<void>;
  accept?: string;
}

export function useImageUpload({ onFileSelect, accept = 'image/jpeg,image/png' }: UseImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<Error | null>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await onFileSelect(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to upload file'));
    }
  };

  return {
    fileInputRef,
    error,
    handleClick,
    handleChange,
    accept
  };
}