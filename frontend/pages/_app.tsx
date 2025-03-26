import React, { useEffect, useState } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '../utils/createEmotionCache';
import '../styles/globals.css';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { ThemeProvider } from 'next-themes';
import CustomThemeProvider from '../components/ThemeProvider';
import CssBaseline from '@mui/material/CssBaseline';

// Client-side cache for MUI styles
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const { checkAuth } = useAuthStore();
  const { updateResolvedTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Detect system color scheme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        updateResolvedTheme();
      };
      
      // Set initial value
      updateResolvedTheme();
      
      // Add listener for theme changes
      mediaQuery.addEventListener('change', handleChange);
      
      // Clean up
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [updateResolvedTheme]);

  // After mounting, we have access to the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Tez Social</title>
      </Head>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <CustomThemeProvider>
          <CssBaseline />
          {mounted && <Component {...pageProps} />}
        </CustomThemeProvider>
      </ThemeProvider>
    </CacheProvider>
  );
} 