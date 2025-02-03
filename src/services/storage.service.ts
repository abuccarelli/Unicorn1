import { supabase } from '../lib/supabase';

export class StorageService {
  private static readonly BUCKET = 'profilepics';

  static async uploadProfilePicture(userId: string, file: File): Promise<string> {
    try {
      // Clean up existing files first
      const { data: existingFiles } = await supabase.storage
        .from(this.BUCKET)
        .list(userId);

      if (existingFiles?.length) {
        await supabase.storage
          .from(this.BUCKET)
          .remove(existingFiles.map(f => `${userId}/${f.name}`));
      }

      // Upload new file
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const filePath = `${userId}/profile.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET)
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Storage error:', error);
      throw error;
    }
  }

  static getPublicUrl(path: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET)
      .getPublicUrl(path);

    return publicUrl;
  }
}