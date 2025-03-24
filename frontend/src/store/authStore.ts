import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, handleApiError } from '@/lib/utils';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post('/auth/login', {
            email,
            password,
          });
          
          const { accessToken, user } = response.data;
          
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Store token in localStorage for API requests
          localStorage.setItem('token', accessToken);
          
        } catch (error) {
          set({
            isLoading: false,
            error: handleApiError(error),
          });
          throw error;
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post('/auth/register', {
            name,
            email,
            password,
          });
          
          const { accessToken, user } = response.data;
          
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Store token in localStorage for API requests
          localStorage.setItem('token', accessToken);
          
        } catch (error) {
          set({
            isLoading: false,
            error: handleApiError(error),
          });
          throw error;
        }
      },
      
      logout: () => {
        // Remove token from localStorage
        localStorage.removeItem('token');
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 