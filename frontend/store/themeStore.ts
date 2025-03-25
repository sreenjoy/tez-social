import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedTheme: 'light' | 'dark';
  updateResolvedTheme: () => void;
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system', // Default to system preference
      resolvedTheme: 'light', // Default resolved theme
      
      setMode: (mode) => set({ mode }),
      
      updateResolvedTheme: () => {
        const { mode } = get();
        
        if (mode === 'system') {
          // Check system preference
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          set({ resolvedTheme: systemPrefersDark ? 'dark' : 'light' });
        } else {
          set({ resolvedTheme: mode });
        }
      }
    }),
    {
      name: 'theme-storage', // localStorage key
      partialize: (state) => ({ mode: state.mode }), // Only persist mode
    }
  )
);

export default useThemeStore; 