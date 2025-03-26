import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';
import { User } from '../types/user';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  setAuthState: (authState: Partial<AuthState>) => void;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
  setUser: (user: User) => void;
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
      login: async (email, password, rememberMe = false) => {
        try {
          set({ isLoading: true, error: null });
          
          // Log the login attempt
          console.log(`Attempting login for ${email}...`);
          
          // Call the login API
          const response = await authApi.login(email, password);
          console.log('Login successful:', { user: response.user.email });
          
          // Store token and user data in localStorage
          localStorage.setItem('token', response.accessToken);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // If rememberMe is true, set a flag in localStorage
          if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
          } else {
            localStorage.removeItem('rememberMe');
          }
          
          // Update the store state
          set({ 
            isAuthenticated: true,
            user: response.user,
            token: response.accessToken,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          console.error('Login error:', error);
          
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to login. Please try again.',
            isAuthenticated: false,
            user: null,
            token: null
          });
          
          throw error;
        }
      },
      
      // Logout
      logout: () => {
        try {
          // Clear persistent state
          localStorage.removeItem('token');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('user');
          localStorage.removeItem('rememberMe');
          
          // Call logout API in the background
          authApi.logout().catch(err => {
            console.error('Error during logout:', err);
          });
          
          // Reset store state
          set({ 
            isAuthenticated: false, 
            user: null, 
            token: null,
            error: null
          });
        } catch (error) {
          console.error('Logout error:', error);
          // Even if there's an error, we'll still clear the local state
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
          
          // Call the register API
          await authApi.register(userData);
          
          // After successful registration, login automatically
          await get().login(userData.email, userData.password);
        } catch (error: any) {
          console.error('Registration error:', error);
          
          set({ 
            isLoading: false, 
            error: error.message || 'Registration failed. Please try again.',
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
          
          // Get token from localStorage
          const storedToken = localStorage.getItem('token');
          
          if (!storedToken) {
            set({ isAuthenticated: false, isLoading: false, isInitialized: true });
            return false;
          }
          
          // Verify token by fetching current user
          const userData = await authApi.getCurrentUser();
          
          // Update store state
          set({ 
            isAuthenticated: true,
            user: userData,
            token: storedToken,
            isLoading: false,
            isInitialized: true
          });
          
          return true;
        } catch (error) {
          console.error('Auth check error:', error);
          
          // If token is invalid, clear all auth data
          localStorage.removeItem('token');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('user');
          localStorage.removeItem('rememberMe');
          
          set({ 
            isAuthenticated: false, 
            user: null, 
            token: null,
            isLoading: false,
            isInitialized: true,
            error: null
          });
          
          return false;
        }
      },
      
      // Set user
      setUser: (user: User) => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        set({ user });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Initialize auth state on the client side only
if (typeof window !== 'undefined') {
  const initializeAuth = async () => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (token && isLoggedIn && userString) {
      try {
        const user = JSON.parse(userString);
        
        // Initialize auth state from localStorage
        useAuthStore.getState().setAuthState({
          isAuthenticated: true,
          user,
          token,
          isInitialized: true
        });
        
        // Verify token in background to ensure it's still valid
        useAuthStore.getState().checkAuth().catch(() => {
          // Token verification failed, will be handled by checkAuth
          console.log('Token verification failed during initialization');
        });
      } catch (error) {
        console.error('Error initializing auth state:', error);
        
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('rememberMe');
        
        useAuthStore.getState().setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          isInitialized: true
        });
      }
    } else {
      // No stored tokens or incomplete data
      useAuthStore.getState().setAuthState({
        isInitialized: true,
        isAuthenticated: false
      });
    }
  };

  // Initialize immediately
  initializeAuth();
}

export default useAuthStore; 