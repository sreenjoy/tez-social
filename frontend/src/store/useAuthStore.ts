import { create } from 'zustand';
import { AuthState, LoginCredentials, RegisterCredentials, User } from '@/types/auth';

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  // Mock login function for now
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    
    try {
      // In a real app, this would call the API
      // For now, we'll just simulate a successful login
      const user: User = {
        id: '1',
        name: 'Demo User',
        email: credentials.email,
        isLoggedIn: true
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, isLoading: false });
    } catch (error) {
      set({ 
        error: 'Login failed. Please check your credentials and try again.',
        isLoading: false
      });
      throw error;
    }
  },
  
  // Mock register function for now
  register: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });
    
    try {
      // In a real app, this would call the API
      // For now, we'll just simulate a successful registration
      const user: User = {
        id: '1',
        name: credentials.name,
        email: credentials.email,
        isLoggedIn: true
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, isLoading: false });
    } catch (error) {
      set({
        error: 'Registration failed. Please try again.',
        isLoading: false
      });
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  },
  
  checkAuth: async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        return false;
      }
      
      const user = JSON.parse(storedUser) as User;
      set({ user });
      return true;
    } catch (error) {
      console.error('Failed to parse stored user data', error);
      return false;
    }
  }
}));

export default useAuthStore; 