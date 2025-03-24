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
      // Handle both possible response formats
      const responseData = response.data.data || response.data;
      
      // For mock API or backend with standard format
      const access_token = responseData.access_token || responseData.token;
      const user = responseData.user || responseData;
      
      // Verify we have a token
      if (!access_token) {
        const error = 'Invalid response: No token found';
        logToStorage('login_error', { error, response: responseData });
        throw new Error(error);
      }
      
      // Verify we have user data
      if (!user || typeof user !== 'object') {
        const error = 'Invalid response: User data missing or invalid';
        logToStorage('login_error', { error, response: responseData });
        throw new Error(error);
      }
      
      // Store token and user data
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      
      console.log('Auth state updated:', { user, isAuthenticated: true });
      logToStorage('login_success', { user });
      
      set({ 
        user, 
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
      // Handle both possible response formats
      const responseData = response.data.data || response.data;
      
      // For mock API or backend with standard format
      const access_token = responseData.access_token || responseData.token;
      const user = responseData.user || responseData;
      
      // Verify we have a token
      if (!access_token) {
        const error = 'Invalid response: No token found';
        logToStorage('register_error', { error, response: responseData });
        throw new Error(error);
      }
      
      // Verify we have user data
      if (!user || typeof user !== 'object') {
        const error = 'Invalid response: User data missing or invalid';
        logToStorage('register_error', { error, response: responseData });
        throw new Error(error);
      }
      
      // Store token and user data
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      
      console.log('Auth state updated after registration:', { user, isAuthenticated: true });
      logToStorage('register_success', { user });
      
      set({ 
        user, 
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
    const storedUser = localStorage.getItem('user');
    
    console.log('Local storage:', { token: !!token, user: !!storedUser });
    logToStorage('check_auth', { hasToken: !!token, hasUser: !!storedUser });
    
    if (!token) {
      console.log('No token found, not authenticated');
      logToStorage('check_auth_no_token', {});
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    
    try {
      // Try to get the current user (this will use the token from localStorage via interceptor)
      // Based on the railway logs, there is no /users/me or /auth/me endpoint
      // For now, we'll just use the stored user data since we're in mock mode anyway
      // In production, this would need to be updated to match the actual API endpoint
      
      if (typeof window !== 'undefined') {
        const storedUserData = localStorage.getItem('user');
        if (storedUserData) {
          const user = JSON.parse(storedUserData);
          console.log('Using stored user data:', user);
          logToStorage('check_auth_success', { user, fromStorage: true });
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return;
        }
      }
      
      // If we don't have stored user data or we're not in a browser, 
      // try to get the current user from the API
      const response = await userApi.getCurrentUser();
      console.log('getCurrentUser response:', response.data);
      logToStorage('get_current_user_response', response.data);
      
      // Extract user data from the response data property
      const responseData = response.data.data || response.data;
      const user = responseData.user || responseData;
      
      if (!user || typeof user !== 'object') {
        const error = 'Invalid user data';
        logToStorage('check_auth_invalid_user', { responseData });
        throw new Error(error);
      }
      
      console.log('User authenticated:', user);
      logToStorage('check_auth_success', { user });
      
      // Make sure localStorage is updated with latest user data
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      
      set({ 
        user, 
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