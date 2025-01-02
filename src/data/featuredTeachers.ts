import { User } from '../types';

export const featuredTeachers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: 'teacher',
    bio: 'Mathematics expert with 8 years of teaching experience. Specializing in calculus and algebra.',
    subjects: ['Mathematics', 'Calculus'],
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    role: 'teacher',
    bio: 'Physics professor with a passion for making complex concepts simple and engaging.',
    subjects: ['Physics', 'Science'],
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    role: 'teacher',
    bio: 'Language expert specializing in Spanish and English. Certified language instructor.',
    subjects: ['Spanish', 'English'],
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80'
  }
];