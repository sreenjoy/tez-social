import { create } from 'zustand';
import { api, handleApiError } from '@/lib/utils';

export interface TelegramConnection {
  id: string;
  userId: string;
  phoneNumber: string;
  connected: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TelegramState {
  connection: TelegramConnection | null;
  isConnecting: boolean;
  codeRequested: boolean;
  error: string | null;
  
  // Actions
  getTelegramConnection: () => Promise<void>;
  requestCode: (phoneNumber: string) => Promise<void>;
  confirmCode: (code: string, phoneNumber: string) => Promise<void>;
  disconnectTelegram: () => Promise<void>;
  clearError: () => void;
}

export const useTelegramStore = create<TelegramState>((set, get) => ({
  connection: null,
  isConnecting: false,
  codeRequested: false,
  error: null,
  
  getTelegramConnection: async () => {
    try {
      const response = await api.get('/telegram/connection');
      
      if (response.data && response.data.connected) {
        set({ connection: response.data });
      } else {
        set({ connection: null });
      }
    } catch (error: any) {
      // If 404, it means no connection exists
      if (error.response && error.response.status === 404) {
        set({ connection: null });
      } else {
        set({ error: handleApiError(error) });
      }
    }
  },
  
  requestCode: async (phoneNumber: string) => {
    try {
      set({ isConnecting: true, error: null });
      
      await api.post('/telegram/connect', { phoneNumber });
      
      set({
        isConnecting: false,
        codeRequested: true,
      });
    } catch (error: any) {
      set({
        isConnecting: false,
        error: handleApiError(error),
      });
    }
  },
  
  confirmCode: async (code: string, phoneNumber: string) => {
    try {
      set({ isConnecting: true, error: null });
      
      const response = await api.post('/telegram/verify', { phoneCode: code, phoneNumber });
      
      // If response includes connection data, we're connected
      if (response.data.status === 'connected') {
        set({
          connection: response.data.connection,
          isConnecting: false,
          codeRequested: false,
        });
      }
      // If 2FA is required, set error with instructions
      else if (response.data.status === '2fa_required') {
        set({
          isConnecting: false,
          error: 'Two-factor authentication is required. Please enter your password.',
        });
      }
    } catch (error: any) {
      set({
        isConnecting: false,
        error: handleApiError(error),
      });
    }
  },
  
  disconnectTelegram: async () => {
    try {
      set({ isConnecting: true, error: null });
      
      await api.post('/telegram/disconnect');
      
      set({
        connection: null,
        isConnecting: false,
        codeRequested: false,
      });
    } catch (error: any) {
      set({
        isConnecting: false,
        error: handleApiError(error),
      });
    }
  },
  
  clearError: () => {
    set({ error: null, codeRequested: false });
  },
})); 