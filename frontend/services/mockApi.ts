import { User } from '../types/user';

// Mock user data
const mockUsers = [
  {
    _id: '1',
    id: '1',
    username: 'demo',
    email: 'demo@example.com',
    password: 'password123', // In a real app, never store plain text passwords
    fullName: 'Demo User',
    role: 'user',
    isEmailVerified: true,
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hasCompletedOnboarding: true
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock authentication API
export const mockAuthApi = {
  // Register a new user
  register: async (userData: any) => {
    await delay(1000); // Simulate network delay
    
    // Check if email already exists
    if (mockUsers.some(user => user.email === userData.email)) {
      throw new Error('Email already in use');
    }
    
    // Check if username already exists
    if (mockUsers.some(user => user.username === userData.username)) {
      throw new Error('Username already taken');
    }
    
    const newUser = {
      _id: (mockUsers.length + 1).toString(),
      id: (mockUsers.length + 1).toString(),
      username: userData.username,
      email: userData.email,
      password: userData.password, // In real app, would be hashed
      fullName: userData.fullName || userData.username,
      role: 'user',
      isEmailVerified: true,
      isVerified: true,
      hasCompletedOnboarding: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    return {
      user: {
        _id: newUser._id,
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        isEmailVerified: newUser.isEmailVerified,
        isVerified: newUser.isVerified,
        hasCompletedOnboarding: newUser.hasCompletedOnboarding
      },
      accessToken: `mock-token-${Date.now()}`
    };
  },
  
  // Login with email and password
  login: async (email: string, password: string) => {
    await delay(800); // Simulate network delay
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    return {
      user: {
        _id: user._id,
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isVerified: user.isVerified,
        hasCompletedOnboarding: user.hasCompletedOnboarding
      },
      accessToken: `mock-token-${Date.now()}`
    };
  },
  
  // Logout
  logout: async () => {
    await delay(300);
    return { success: true };
  },
  
  // Get current user info
  getCurrentUser: async () => {
    await delay(500);
    
    // In a real app, we would decode the JWT token to get the user ID
    const user = mockUsers[0];
    
    return {
      _id: user._id,
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isVerified: user.isVerified,
      hasCompletedOnboarding: user.hasCompletedOnboarding
    };
  },
  
  // Verify email
  verifyEmail: async (token: string) => {
    await delay(700);
    
    if (token !== 'valid-verification-token') {
      throw new Error('Invalid or expired verification token');
    }
    
    return { success: true };
  },
  
  // Resend verification email
  resendVerification: async (email: string) => {
    await delay(600);
    
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Email not found');
    }
    
    return { success: true };
  },
  
  // Get onboarding status
  getOnboardingStatus: async () => {
    await delay(400);
    
    return {
      isOnboarded: false,
      steps: {
        profileCompleted: false,
        telegramConnected: false,
        companyCreated: false
      }
    };
  }
}; 