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
  setAuthState: (state: { isAuthenticated: boolean; user: any; token: string }) => void;
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
      
      // Extract token from the response based on the actual API response format
      // For the Railway backend, the format is: { statusCode, message, data: { access_token, user } }
      const token = response.data.data?.access_token || 
                   (response.data.token) || 
                   null;
      
      if (!token) {
        throw new Error('No authentication token received from server');
      }
      
      console.log('Token received:', !!token);
      logToStorage('token_received', { token: !!token });
      
      // Extract user data from the response based on the actual API response format
      let userData = response.data.data?.user ||
                   (response.data.user) || 
                   null;
      
      if (!userData) {
        // Minimal user object for session if backend doesn't provide user details
        userData = {
          email,
          firstName: email.split('@')[0]
        };
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
      let errorMessage = 'Failed to login. Please try again.';
      
      // Extract error message from the response if possible
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      logToStorage('login_error', { message: errorMessage, error });
      
      // Make sure we're not authenticated if login fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      
      set({ 
        error: errorMessage,
        user: null,
        isAuthenticated: false,
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
      
      // Extract token from the response based on the actual API response format
      // For the Railway backend, the format is: { statusCode, message, data: { access_token, user } }
      const token = response.data.data?.access_token || 
                   (response.data.token) || 
                   null;
      
      if (!token) {
        throw new Error('No authentication token received from server');
      }
      
      console.log('Token received:', !!token);
      logToStorage('token_received', { token: !!token });
      
      // Extract user data from the response based on the actual API response format
      let userData = response.data.data?.user ||
                    (response.data.user) || 
                    null;
      
      if (!userData) {
        // Create minimal user data if not provided by the API
        userData = {
          email,
          firstName: name
        };
      }
      
      // Store token and user data in localStorage
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
      let errorMessage = 'Registration failed. Please try again.';
      
      // Extract error message from the response if possible
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
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
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
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
      
      // If we get a successful response from the protected endpoint,
      // it means our token is valid, but the endpoint doesn't return user data
      if (response.data.statusCode === 200 && response.data.message === "This is a protected route") {
        // Get the user data from localStorage since the API doesn't return it
        const storedUser = safeParseJSON(localStorage.getItem('user'));
        
        if (storedUser && storedUser.email) {
          console.log('Using stored user data since protected endpoint only confirms auth:', storedUser);
          set({ 
            user: storedUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return;
        }
      }
      
      // For other endpoints that might return user data
      const userData = response.data.user || 
                      (response.data.data && response.data.data.user) || 
                      response.data.data || 
                      response.data;
      
      if (!userData || typeof userData !== 'object') {
        // Fallback to stored user if API didn't return user data in expected format
        const storedUser = safeParseJSON(localStorage.getItem('user'));
        if (storedUser && storedUser.email) {
          console.log('Using stored user data since API response format is unexpected:', storedUser);
          set({ 
            user: storedUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return;
        }
        throw new Error('Invalid user data returned from server');
      }
      
      // Ensure we have at least email in the user data
      if (!userData.email && token) {
        // Try to get stored user data as a fallback
        const storedUser = safeParseJSON(localStorage.getItem('user'));
        if (storedUser && storedUser.email) {
          console.log('Using stored user data since API response lacks email:', storedUser);
          
          // Still authenticated since the token is valid, but using stored user data
          set({ 
            user: storedUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return;
        }
        
        // If we can't even get stored user data, this is a problem
        throw new Error('User data missing critical information');
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
  
  setAuthState: (state: { isAuthenticated: boolean; user: any; token: string }) => {
    console.log('Setting auth state:', state);
    set({
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      isLoading: false,
      error: null,
    });
  },
  
  clearError: () => set({ error: null })
}));

export default useAuthStore; 