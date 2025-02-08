export type JobStatus = 'open' | 'closed';

export interface JobTag {
  id: string;
  name: string;
  created_by: string;
}

export interface JobPost {
  id: string;
  title: string;
  description: string;
  subjects: string[];
  languages: string[];
  tags: JobTag[];
  created_by: string;
  created_by_profile: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  status: JobStatus;
  created_at: string;
  updated_at: string;
  comment_count: number;
  view_count: number;
}

export interface JobComment {
  id: string;
  job_id: string;
  content: string;
  created_by: string;
  created_at: string;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface JobFormData {
  title: string;
  description: string;
  subjects: string[];
  languages: string[];
  tags: string[];
}