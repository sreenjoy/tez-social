import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface User {
  _id: string;
  email: string;
  username?: string;
  role: 'user' | 'admin';
  companyId?: string; // Added company association
  isEmailVerified?: boolean;
  picture?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  
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
      isInitialized: false,
      
      // Login with email and password
      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authApi.login(email, password);
          const { data } = response;
          
          if (!data || !data.accessToken) {
            throw new Error('Invalid response from server');
          }
          
          // Store token in localStorage
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('isLoggedIn', 'true');
          
          // Store user data
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          
          set({ 
            isAuthenticated: true,
            user: data.user,
            token: data.accessToken,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          console.error('Login error:', error);
          set({ 
            isLoading: false, 
            error: error.response?.data?.message || 'Failed to login. Please try again.',
            isAuthenticated: false,
            user: null,
            token: null
          });
          throw error;
        }
      },
      
      // Logout
      logout: async () => {
        try {
          // Call logout API to invalidate token on server
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear token from localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('user');
          set({ 
            isAuthenticated: false, 
            user: null, 
            token: null
          });
        }
      },
      
      // Register a new user
      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authApi.register(userData);
          const { data } = response;
          
          if (!data || !data.userId) {
            throw new Error('Invalid response from server');
          }
          
          set({ 
            isLoading: false,
            error: null
          });
          
          // After successful registration, try to login
          await get().login(userData.email, userData.password);
        } catch (error: any) {
          console.error('Registration error:', error);
          set({ 
            isLoading: false, 
            error: error.response?.data?.message || 'Registration failed. Please try again.',
            isAuthenticated: false,
            user: null,
            token: null
          });
          throw error;
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
          set({ isLoading: true });
          const storedToken = localStorage.getItem('token');
          
          if (!storedToken) {
            set({ isAuthenticated: false, isLoading: false });
            return false;
          }
          
          // Verify token is valid by fetching current user
          const userData = await authApi.getCurrentUser();
          
          set({ 
            isAuthenticated: true,
            user: userData,
            token: storedToken,
            isLoading: false
          });
          return true;
        } catch (error) {
          console.error('Auth check error:', error);
          // If token is invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('user');
          set({ 
            isAuthenticated: false, 
            user: null, 
            token: null,
            isLoading: false
          });
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
        isInitialized: true
      });
      
      // Verify token in background
      useAuthStore.getState().checkAuth().then((isValid) => {
        if (!isValid) {
          useAuthStore.getState().logout();
        }
      });
    } catch (error) {
      // Clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      
      useAuthStore.getState().setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isInitialized: true
      });
    }
  } else {
    useAuthStore.getState().setAuthState({
      isInitialized: true
    });
  }
}

export default useAuthStore; 