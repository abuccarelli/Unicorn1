import { supabase } from '../lib/supabase';
import type { Profile, ProfileUpdateData } from '../types/profile';

export class ProfileService {
  static async updateProfile(userId: string, data: ProfileUpdateData) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return profile;
  }

  static async getProfile(userId: string) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return profile;
  }
}