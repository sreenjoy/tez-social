import { create } from 'zustand';
import { authApi, userApi } from '../services/api';

interface User {
  id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  createdAt?: string;
  role?: string;
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

const safeParseJSON = (str: string | null): any => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error('Error parsing JSON from localStorage', e);
    return null;
  }
};

// Helper function to log debug information to localStorage
const logToStorage = (action: string, data: any) => {
  try {
    const logs = safeParseJSON(localStorage.getItem('auth_debug_logs')) || [];
    logs.push({
      timestamp: new Date().toISOString(),
      action,
      data
    });
    // Keep only last 20 logs
    if (logs.length > 20) logs.shift();
    localStorage.setItem('auth_debug_logs', JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to log to storage', e);
  }
};

const useAuthStore = create<AuthState>((set, get) => ({
  user: typeof window !== 'undefined' ? safeParseJSON(localStorage.getItem('user')) : null,
  isAuthenticated: typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') === 'true' : false,
  isLoading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    logToStorage('login_attempt', { email });
    
    try {
      const response = await authApi.login({ email, password });
      console.log('Login response:', response.data);
      logToStorage('login_response', response.data);
      
      // Extract token and user data from the response
      const responseData = response.data.data || response.data;
      const token = responseData.access_token || responseData.token;
      const userData = responseData.user || responseData;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      
      console.log('Auth state updated:', { user: userData, isAuthenticated: true });
      logToStorage('login_success', { user: userData });
      
      set({ 
        user: userData, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to login. Please try again.';
      logToStorage('login_error', { message: errorMessage, error });
      
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },
  
  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    logToStorage('register_attempt', { name, email });
    
    try {
      const response = await authApi.register({ name, email, password });
      console.log('Register response:', response.data);
      logToStorage('register_response', response.data);
      
      // Extract token and user data from the response
      const responseData = response.data.data || response.data;
      const token = responseData.access_token || responseData.token;
      const userData = responseData.user || responseData;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      
      console.log('Auth state updated after registration:', { user: userData, isAuthenticated: true });
      logToStorage('register_success', { user: userData });
      
      set({ 
        user: userData, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      logToStorage('register_error', { message: errorMessage, error });
      
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
    console.log('Checking auth...');
    
    // First check if we have a token in localStorage
    const token = localStorage.getItem('token');
    
    console.log('Local storage:', { token: !!token });
    logToStorage('check_auth', { hasToken: !!token });
    
    if (!token) {
      console.log('No token found, not authenticated');
      logToStorage('check_auth_no_token', {});
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    
    try {
      // Try to get the current user from the API using the token
      const response = await userApi.getCurrentUser();
      console.log('getCurrentUser response:', response.data);
      logToStorage('get_current_user_response', response.data);
      
      // Extract user data from the response
      const userData = response.data.data || response.data;
      
      if (!userData) {
        throw new Error('Invalid user data');
      }
      
      console.log('User authenticated:', userData);
      logToStorage('check_auth_success', { user: userData });
      
      // Update localStorage with user data
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      
      set({ 
        user: userData, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
    } catch (error: any) {
      console.error('Error checking auth:', error);
      logToStorage('check_auth_error', { 
        message: error.message,
        response: error.response?.data 
      });
      
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