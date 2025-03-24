import { create } from 'zustand';
import { authApi, userApi } from '../services/api';

interface User {
  id?: string;
  name?: string;
  email: string;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authApi.login({ email, password });
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to login. Please try again.';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },
  
  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authApi.register({ name, email, password });
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },
  
  logout: () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    
    // Reset state
    set({ 
      user: null, 
      isAuthenticated: false 
    });
    
    // Redirect to homepage
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  },
  
  checkAuth: async () => {
    set({ isLoading: true });
    
    // First check if we have a token in localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    
    try {
      // Try to get the current user (this will use the token from localStorage via interceptor)
      const response = await userApi.getCurrentUser();
      const user = response.data;
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
    } catch (error) {
      // If there's an error (invalid token, etc.), clear auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },
  
  clearError: () => set({ error: null })
}));

export default useAuthStore; 