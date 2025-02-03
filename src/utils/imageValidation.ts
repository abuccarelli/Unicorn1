export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateImage(file: File): ImageValidationResult {
  // Check file type
  if (!file.type.match(/^image\/(jpeg|png)$/)) {
    return {
      isValid: false,
      error: 'Only JPEG and PNG files are allowed'
    };
  }

  // Check file size (max 2MB)
  const maxSize = 2 * 1024 * 1024; // 2MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must not exceed 2MB'
    };
  }

  return { isValid: true };
}