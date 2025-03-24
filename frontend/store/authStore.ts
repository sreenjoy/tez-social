import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';

interface User {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  picture?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  setAuthState: (authState: Partial<AuthState>) => void;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
}

// Create auth store with persistence
const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
      
      // Login with email and password
      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authApi.login(email, password);
          const { access_token, user } = response.data;
          
          // Store auth data
          localStorage.setItem('token', access_token);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('isLoggedIn', 'true');
          
          set({
            isAuthenticated: true,
            user,
            token: access_token,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Login failed. Please try again.';
          set({ isLoading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },
      
      // Logout
      logout: () => {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        
        // Reset state
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        });
        
        // Redirect to login (if in browser)
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      },
      
      // Register a new user
      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authApi.register(userData);
          const { access_token, user } = response.data;
          
          // Store auth data
          localStorage.setItem('token', access_token);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('isLoggedIn', 'true');
          
          set({
            isAuthenticated: true,
            user,
            token: access_token,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Registration failed. Please try again.';
          set({ isLoading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },
      
      // Set auth state (used for initialization and updates)
      setAuthState: (authState) => {
        set({ ...authState });
      },
      
      // Clear error
      clearError: () => {
        set({ error: null });
      },
      
      // Check if token is valid
      checkAuth: async () => {
        try {
          // Get the current auth state
          const { token } = get();
          
          // If no token, we're not authenticated
          if (!token) {
            set({ isAuthenticated: false });
            return false;
          }
          
          // Verify token with backend
          await authApi.getCurrentUser();
          
          // If we get here, token is valid
          set({ isAuthenticated: true });
          return true;
        } catch (error) {
          // Token invalid or expired
          set({ isAuthenticated: false });
          return false;
        }
      }
    }),
    {
      name: 'auth-storage', // name for localStorage
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Initialize auth state from localStorage (client-side only)
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (token && isLoggedIn) {
    try {
      const user = userString ? JSON.parse(userString) : null;
      
      useAuthStore.getState().setAuthState({
        isAuthenticated: true,
        user,
        token,
      });
      
      // Verify token in background
      useAuthStore.getState().checkAuth().then((isValid) => {
        if (!isValid) {
          useAuthStore.getState().logout();
        }
      });
    } catch (error) {
      console.error('Failed to parse auth data from localStorage', error);
      // Clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
    }
  }
}

export default useAuthStore; 