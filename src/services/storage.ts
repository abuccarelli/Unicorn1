import { supabase } from '../lib/supabase';

export class StorageService {
  private static readonly BUCKET_NAME = 'profilepics';

  static async uploadProfilePicture(userId: string, file: File): Promise<{ path: string | null; error: any }> {
    try {
      // Create a simple path: userId/profile.ext
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const filePath = `${userId}/profile.${fileExt}`;

      // Upload new file with upsert
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Get the public URL immediately after upload
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return { path: publicUrl, error: null };
    } catch (error) {
      console.error('Storage error:', error);
      return { path: null, error };
    }
  }

  static getPublicUrl(path: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(path);

    return publicUrl;
  }
}