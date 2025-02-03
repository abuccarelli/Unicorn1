export interface SubjectCategory {
  name: string;
  subjects: string[];
}

export const subjectCategories: SubjectCategory[] = [
  {
    name: 'Mathematics',
    subjects: [
      'General Mathematics',
      'Algebra',
      'Geometry',
      'Calculus',
      'Statistics',
      'Trigonometry'
    ]
  },
  {
    name: 'Sciences',
    subjects: [
      'General Science',
      'Physics',
      'Chemistry',
      'Biology',
      'Environmental Science',
      'Astronomy'
    ]
  },
  {
    name: 'Languages & Literature',
    subjects: [
      'English Language & Literature',
      'French',
      'Spanish',
      'German',
      'Italian',
      'Chinese',
      'Creative Writing',
      'Academic Writing'
    ]
  },
  {
    name: 'Business & Economics',
    subjects: [
      'Business Administration',
      'Economics',
      'Marketing',
      'Accounting',
      'Finance',
      'Management'
    ]
  },
  {
    name: 'Social Sciences',
    subjects: [
      'History',
      'Geography',
      'Psychology',
      'Sociology',
      'Political Science',
      'Philosophy'
    ]
  },
  {
    name: 'Computer Science & Technology',
    subjects: [
      'Programming',
      'Web Development',
      'Database Management',
      'Information Technology',
      'Cybersecurity',
      'Data Science'
    ]
  },
  {
    name: 'Arts & Music',
    subjects: [
      'Fine Arts',
      'Music Theory',
      'Art History',
      'Drawing & Painting',
      'Digital Art',
      'Photography'
    ]
  },
  {
    name: 'Test Preparation',
    subjects: [
      'SAT',
      'ACT',
      'GRE',
      'GMAT',
      'TOEFL',
      'IELTS',
      'International Baccalaureate (IB)'
    ]
  },
  {
    name: 'Primary Education',
    subjects: [
      'Elementary Mathematics',
      'Basic Reading',
      'Basic Writing',
      'Early Science',
      'Social Studies'
    ]
  },
  {
    name: 'Special Education',
    subjects: [
      'Learning Disabilities',
      'ADHD Support',
      'Autism Spectrum',
      'Gifted Education'
    ]
  },
  {
    name: 'Professional Skills',
    subjects: [
      'Public Speaking',
      'Project Management',
      'Research Methods',
      'Critical Thinking',
      'Study Skills',
      'Time Management'
    ]
  }
];