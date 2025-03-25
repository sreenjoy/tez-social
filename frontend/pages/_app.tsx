import React, { useEffect } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '../utils/createEmotionCache';
import '../styles/globals.css';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import ThemeProvider from '../components/ThemeProvider';

// Client-side cache for MUI styles
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const { checkAuth } = useAuthStore();
  const { updateResolvedTheme } = useThemeStore();

  useEffect(() => {
    // Check if the user is authenticated when the app loads
    checkAuth();
    
    // Update the resolved theme
    updateResolvedTheme();
    
    // Add listener for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      updateResolvedTheme();
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [checkAuth, updateResolvedTheme]);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Tez Social</title>
      </Head>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  );
} 