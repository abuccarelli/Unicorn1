import { Profile } from './profile';

export interface Teacher extends Profile {
  role: 'teacher';
  hourly_rate?: number;
  currency?: string;
  subjects?: string[];
  languages?: string[];
  timezone?: string | null;
}