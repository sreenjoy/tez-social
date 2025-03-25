import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';

interface User {
  id?: string;
  email?: string;
  username?: string;
  role?: string;
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
            isInitialized: true
          });
          
          return;
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
          isInitialized: true
        });
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
            isInitialized: true
          });
          
          return;
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
            set({ isAuthenticated: false, isInitialized: true });
            return false;
          }
          
          // Verify token with backend
          await authApi.getCurrentUser();
          
          // If we get here, token is valid
          set({ isAuthenticated: true, isInitialized: true });
          return true;
        } catch (error) {
          // Token invalid or expired
          set({ isAuthenticated: false, isInitialized: true });
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