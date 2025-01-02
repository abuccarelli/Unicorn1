export interface Profile {
  id: string;
  email: string;
  role: 'teacher' | 'student';
  firstName: string;
  lastName: string;
  bio?: string;
  subjects?: string[];
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  price: number;
  duration: number; // in minutes
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface Booking {
  id: string;
  courseId: string;
  teacherId: string;
  studentId: string;
  startTime: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}