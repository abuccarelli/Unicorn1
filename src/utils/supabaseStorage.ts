import { supabase } from '../lib/supabase';

export const getPublicUrl = (path: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  const { data: { publicUrl } } = supabase.storage
    .from('profilepics')
    .getPublicUrl(path);
  
  // Add cache-busting parameter to prevent stale images
  return `${publicUrl}?t=${Date.now()}`;
};

export const uploadFile = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const filePath = `${userId}/profile.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('profilepics')
    .upload(filePath, file, {
      upsert: true,
      cacheControl: '3600'
    });

  if (uploadError) throw uploadError;
  return filePath;
};