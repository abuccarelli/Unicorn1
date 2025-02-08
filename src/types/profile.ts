export interface Profile {
  id: string;
  email: string;
  role: 'teacher' | 'student';
  firstName: string;
  lastName: string;
  bio?: string;
  subjects?: string[];
  languages?: string[];
  profile_image?: string | null;
  created_at: string;
  updated_at: string;
  street?: string;
  street_number?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  utc_offset?: number | null;
  hourly_rate?: number;
  currency?: string;
  date_of_birth?: string;
  guardian_first_name?: string;
  guardian_last_name?: string;
  guardian_email?: string;
  guardian_phone?: string;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  subjects?: string[];
  languages?: string[];
  profile_image?: string | null;
  street?: string;
  street_number?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  hourly_rate?: number;
  currency?: string;
  date_of_birth?: string;
  guardian_first_name?: string;
  guardian_last_name?: string;
  guardian_email?: string;
  guardian_phone?: string;
}