export interface User {
  _id: string;
  email: string;
  username: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
  role?: string;
  hasCompletedOnboarding?: boolean;
  lastActive?: string;
} 