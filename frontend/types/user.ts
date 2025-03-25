export interface User {
  _id: string;
  id?: string; // For compatibility with both backend and mock API
  username: string;
  email: string;
  fullName?: string;
  role: string;
  isEmailVerified: boolean;
  isVerified?: boolean; // For compatibility with mock API
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
  hasCompletedOnboarding?: boolean;
  lastActive?: string;
  createdAt?: string;
  updatedAt?: string;
} 