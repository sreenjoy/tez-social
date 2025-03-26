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

  // Adjust spacing for signup to prevent scrolling
  const isSignup = activeTab === 'signup';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        position: 'relative',
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
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
      
      {/* Left side with product info */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: '1',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { xs: 4, md: 6 },
          backgroundColor: isDark ? '#1e293b' : '#3b82f6',
          color: 'white',
          minHeight: '100vh'
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box 
            component="div" 
            sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(5px)'
            }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
              <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
            </svg>
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              letterSpacing: '-0.01em',
              fontSize: '1.25rem'
            }}
          >
            tez.social
          </Typography>
        </Box>

        {/* Main content */}
        <Box sx={{ my: { xs: 6, md: 'auto' }, maxWidth: 480 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              mb: 4, 
              fontWeight: 700,
              fontSize: { xs: '1.875rem', sm: '2.25rem', md: '2.5rem' },
              lineHeight: 1.2,
              letterSpacing: '-0.02em'
            }}
          >
            Streamline your Telegram business communication
          </Typography>

          <Box sx={{ mt: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Box 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  mr: 3,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(5px)'
                }}
              >
                <Box component="span" sx={{ fontSize: '1.25rem' }}>🔒</Box>
              </Box>
              <Typography variant="body1" fontWeight={500} fontSize="1.125rem">
                Privacy-First: No message storage
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Box 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  mr: 3,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(5px)'
                }}
              >
                <Box component="span" sx={{ fontSize: '1.25rem' }}>⚡</Box>
              </Box>
              <Typography variant="body1" fontWeight={500} fontSize="1.125rem">
                Never miss a lead in your groups
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  mr: 3,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(5px)'
                }}
              >
                <Box component="span" sx={{ fontSize: '1.25rem' }}>📊</Box>
              </Box>
              <Typography variant="body1" fontWeight={500} fontSize="1.125rem">
                Complete visibility of your deal flow
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Footer text */}
        <Typography 
          variant="body2" 
          sx={{ 
            opacity: 0.8, 
            fontWeight: 'medium',
            fontSize: '0.875rem'
          }}
        >
          Built for Web3 teams — secure, efficient, and privacy-focused.
        </Typography>
      </Box>

      {/* Right side with auth forms */}
      <Box
        sx={{
          flex: { xs: '1', md: '1' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, md: isSignup ? '5vh' : 6 },
          backgroundColor: isDark ? '#0f172a' : '#f8fafc',
          minHeight: '100vh',
          backgroundImage: isDark 
            ? 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)'
            : 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)',
        }}
      >
        {/* Mobile logo */}
        <Box 
          sx={{ 
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            gap: 1.5,
            mb: 6,
          }}
        >
          <Box 
            component="div" 
            sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(5px)'
            }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
              <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
            </svg>
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              letterSpacing: '-0.01em',
              fontSize: '1.25rem',
              color: isDark ? 'white' : '#1a2b42'
            }}
          >
            tez.social
          </Typography>
        </Box>

        <Box 
          sx={{ 
            width: '100%',
            maxWidth: { xs: '100%', sm: isSignup ? '480px' : '450px' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box 
            sx={{ 
              mb: isSignup ? 3 : 5, 
              maxWidth: isSignup ? 480 : 360, 
              width: '100%', 
              textAlign: 'center' 
            }}
          >
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                mb: 1.5, 
                fontWeight: 700,
                color: isDark ? 'white' : '#1a2b42',
                fontSize: { xs: isSignup ? '1.75rem' : '2rem', sm: isSignup ? '1.875rem' : '2.25rem' },
                letterSpacing: '-0.02em'
              }}
            >
              Welcome to tez.social
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                fontWeight: 400,
                fontSize: '1rem'
              }}
            >
              Your all-in-one solution for managing customer relationships
            </Typography>
          </Box>

          {/* Auth tabs */}
          <Box 
            sx={{ 
              display: 'flex',
              borderRadius: '12px',
              overflow: 'hidden',
              width: '100%',
              maxWidth: isSignup ? 480 : 360,
              mx: 'auto',
              mb: isSignup ? 4 : 5,
              boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease',
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

          <Typography 
            variant="body2" 
            sx={{ 
              mb: isSignup ? 4 : 3, 
              textAlign: 'center',
              maxWidth: isSignup ? 480 : 360,
              mx: 'auto',
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'
            }}
          >
            {activeTab === 'signin' 
              ? 'Enter your email and password to sign in' 
              : 'Create your account to get started'}
          </Typography>

          {/* Auth form content */}
          <Box sx={{ width: '100%', maxWidth: isSignup ? 480 : 360, mx: 'auto' }}>
            {children}
          </Box>

          {/* Copyright */}
          <Box 
            sx={{ 
              mt: isSignup ? 4 : 5, 
              textAlign: 'center',
              color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
              fontSize: '0.75rem'
            }}
          >
            © {new Date().getFullYear()} Tez Social. All rights reserved.
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;