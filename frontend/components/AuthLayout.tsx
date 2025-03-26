import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, useMediaQuery } from '@mui/material';
import { useRouter } from 'next/router';
import useThemeStore from '../store/themeStore';
import ThemeToggle from './ThemeToggle';

interface AuthLayoutProps {
  children: React.ReactNode;
  initialTab?: 'signin' | 'signup';
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, initialTab = 'signin' }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);
  const { resolvedTheme, updateResolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';
  const isMobile = useMediaQuery('(max-width:900px)');

  // Update resolved theme on mount
  useEffect(() => {
    updateResolvedTheme();
  }, [updateResolvedTheme]);

  // Handle tab change
  const handleTabChange = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    router.push(tab === 'signin' ? '/auth/login' : '/auth/register');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        backgroundImage: isDark 
          ? 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)'
          : 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)',
        padding: { xs: 3, sm: 4 },
        pt: { xs: 8, sm: 10 },
        pb: { xs: 8, sm: 10 }
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16,
          zIndex: 10
        }}
      >
        <ThemeToggle />
      </Box>
      
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          mb: 4
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            mb: 2, 
            fontWeight: 700,
            color: isDark ? 'white' : '#1a2b42',
            fontSize: { xs: '1.875rem', sm: '2rem' },
            textAlign: 'center',
            letterSpacing: '-0.02em'
          }}
        >
          Welcome to tez.social
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 5,
            color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
            fontWeight: 400,
            fontSize: '1rem',
            textAlign: 'center'
          }}
        >
          Your all-in-one solution for managing customer relationships
        </Typography>

        {/* Auth tabs */}
        <Box 
          sx={{ 
            display: 'flex',
            borderRadius: '12px',
            overflow: 'hidden',
            width: '100%',
            mx: 'auto',
            mb: 4,
            boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
          }}
        >
          <Button
            fullWidth
            variant={activeTab === 'signin' ? 'contained' : 'text'}
            color="primary"
            onClick={() => handleTabChange('signin')}
            sx={{ 
              py: 1.5,
              borderRadius: 0,
              fontWeight: 500,
              color: activeTab === 'signin' 
                ? '#fff' 
                : isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
              bgcolor: activeTab === 'signin' ? '#3b82f6' : 'transparent',
              '&:hover': {
                bgcolor: activeTab === 'signin' 
                  ? '#2563eb' 
                  : isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
              },
              borderBottom: activeTab === 'signin' 
                ? '3px solid #3b82f6' 
                : isDark 
                  ? '3px solid transparent' 
                  : '3px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </Button>
          <Button
            fullWidth
            variant={activeTab === 'signup' ? 'contained' : 'text'}
            color="primary"
            onClick={() => handleTabChange('signup')}
            sx={{ 
              py: 1.5,
              borderRadius: 0,
              fontWeight: 500,
              color: activeTab === 'signup' 
                ? '#fff' 
                : isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
              bgcolor: activeTab === 'signup' ? '#3b82f6' : 'transparent',
              '&:hover': {
                bgcolor: activeTab === 'signup' 
                  ? '#2563eb' 
                  : isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
              },
              borderBottom: activeTab === 'signup' 
                ? '3px solid #3b82f6' 
                : isDark 
                  ? '3px solid transparent' 
                  : '3px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            Sign Up
          </Button>
        </Box>

        {/* Form description */}
        <Typography
          variant="body2"
          sx={{
            mb: 4,
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
            fontWeight: 400,
            fontSize: '0.875rem',
            textAlign: 'center'
          }}
        >
          {activeTab === 'signin' 
            ? 'Enter your email and password to sign in' 
            : 'Create your account to get started'}
        </Typography>
      </Box>

      {/* Auth form content */}
      <Box sx={{ width: '100%', maxWidth: 400, mb: 6 }}>
        {children}
      </Box>

      {/* Skip Login Button - Only shown on signup page */}
      {activeTab === 'signup' && (
        <Button
          variant="text"
          color="primary"
          onClick={() => router.push('/dashboard')}
          sx={{
            mb: 4,
            color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
            '&:hover': {
              bgcolor: 'transparent',
              color: isDark ? 'white' : '#1a2b42',
            },
            fontWeight: 500,
            fontSize: '0.9rem',
          }}
        >
          Skip Login
        </Button>
      )}

      {/* Copyright */}
      <Box 
        sx={{ 
          position: 'absolute',
          bottom: 16,
          textAlign: 'center',
          color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
          fontSize: '0.75rem'
        }}
      >
        © {new Date().getFullYear()} Tez Social. All rights reserved.
      </Box>
    </Box>
  );
};

export default AuthLayout;