export interface User {
  _id: string;
  id?: string;
  username: string;
  email: string;
  fullName?: string;
  role: string;
  isEmailVerified: boolean;
  isVerified?: boolean;
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