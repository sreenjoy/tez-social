import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';

interface User {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  token: string | null;
  user: User | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
  setAuthState: (state: Partial<AuthState>) => void;
}

// Create auth store with persistence
const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
      token: null,
      user: null,
      
      // Login action
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Call the login API
          const response = await authApi.login(email, password);
          
          // Save token and user data
          const { token, user } = response;
          
          // Update localStorage manually for more reliable state persistence
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('isLoggedIn', 'true');
          
          // Update state
          set({ 
            isAuthenticated: true, 
            isLoading: false,
            token,
            user
          });
          
        } catch (error: any) {
          // Handle login error
          const errorMessage = error.response?.data?.message || error.message || 'Failed to login';
          
          // Update state with error
          set({ 
            isLoading: false, 
            error: errorMessage,
            isAuthenticated: false,
            token: null,
            user: null
          });
          
          throw new Error(errorMessage);
        }
      },
      
      // Logout action
      logout: () => {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        
        // Update state
        set({
          isAuthenticated: false,
          token: null,
          user: null,
          error: null
        });
      },
      
      // Check if user is authenticated
      checkAuth: async () => {
        try {
          set({ isLoading: true });
          
          // First check if we have a token in localStorage
          const token = localStorage.getItem('token');
          
          if (!token) {
            // No token found, user is not authenticated
            set({ 
              isAuthenticated: false, 
              isLoading: false,
              isInitialized: true,
              token: null,
              user: null
            });
            return false;
          }
          
          try {
            // Verify token by fetching current user from API
            const userData = await authApi.getCurrentUser();
            
            // If the request is successful, the user is authenticated
            set({
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
              user: userData,
              token: token // Use the token from localStorage
            });
            
            // Ensure localStorage is updated with latest user data
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('isLoggedIn', 'true');
            
            return true;
          } catch (apiError: any) {
            // If the API call fails, the token might be invalid
            
            // Only clear auth if it's an authentication error (401)
            if (apiError.response?.status === 401) {
              // Clear localStorage
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('isLoggedIn');
              
              set({
                isAuthenticated: false,
                isLoading: false,
                isInitialized: true,
                token: null,
                user: null
              });
            } else {
              // For other errors, we keep the current state but mark as initialized
              set({
                isLoading: false,
                isInitialized: true,
                error: "Unable to verify authentication status"
              });
            }
            
            return false;
          }
        } catch (error: any) {
          // Handle any other errors
          set({
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            error: error.message || 'Authentication check failed',
            token: null,
            user: null
          });
          
          return false;
        }
      },
      
      // Clear any error messages
      clearError: () => {
        set({ error: null });
      },
      
      // Set auth state (useful for external auth like Google OAuth)
      setAuthState: (state) => {
        set(state);
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

export default useAuthStore; 