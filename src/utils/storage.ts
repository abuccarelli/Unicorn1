import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

export function generateStorageFileName(userId: string, originalFileName: string): string {
  const fileExtension = originalFileName.split('.').pop()?.toLowerCase() || '';
  const uniqueId = uuidv4();
  return `${userId}/${uniqueId}.${fileExtension}`;
}

export function getPublicUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  // Get the public URL from Supabase storage
  const { data } = supabase.storage
    .from('profilepics')
    .getPublicUrl(path);
    
  return data?.publicUrl || null;
}