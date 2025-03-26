import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';
import { useTheme } from 'next-themes';

// Define props interface
interface AuthLayoutProps {
  children: React.ReactNode;
  initialTab?: 'signin' | 'signup';
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, initialTab = 'signin' }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [tab, setTab] = useState(initialTab);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);
  
  const openThemeMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setThemeMenuAnchor(event.currentTarget);
  };
  
  const closeThemeMenu = () => {
    setThemeMenuAnchor(null);
  };
  
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    closeThemeMenu();
  };

  // Change URL when tab changes
  useEffect(() => {
    if (tab === 'signin') {
      router.push('/auth/login', undefined, { shallow: true });
    } else {
      router.push('/auth/register', undefined, { shallow: true });
    }
  }, [tab, router]);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // After mounting, we can show the theme UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine current theme for UI components
  const currentTheme = theme === 'system' ? 'auto' : theme;
  
  // Get theme icon based on current theme
  const getThemeIcon = () => {
    if (!mounted) return null;
    
    if (currentTheme === 'dark') {
      return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
    } else if (currentTheme === 'light') {
      return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
    } else {
      return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#111827]">
      {/* Theme Toggle */}
      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
        <Tooltip title="Change theme">
          <IconButton 
            color="inherit" 
            size="small"
            onClick={openThemeMenu}
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.15)',
              }
            }}
          >
            {getThemeIcon()}
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={themeMenuAnchor}
          open={Boolean(themeMenuAnchor)}
          onClose={closeThemeMenu}
        >
          <MenuItem onClick={() => handleThemeChange('light')} selected={theme === 'light'}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              Light
            </Box>
          </MenuItem>
          <MenuItem onClick={() => handleThemeChange('dark')} selected={theme === 'dark'}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              Dark
            </Box>
          </MenuItem>
          <MenuItem onClick={() => handleThemeChange('system')} selected={theme === 'system'}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              System
            </Box>
          </MenuItem>
        </Menu>
      </Box>
      
      {/* Left Section - Product Info */}
      <Box 
        sx={{ 
          width: '50%', 
          display: { xs: 'none', md: 'flex' }, 
          flexDirection: 'column',
          padding: 4,
          paddingTop: 6,
          position: 'relative',
          background: 'linear-gradient(135deg, #0f172a 0%, #111827 100%)',
          overflow: 'hidden'
        }}
        className="dark:bg-[#111827]"
      >
        {/* Animated background patterns */}
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          opacity: 0.04,
          background: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffffff" fill-opacity="1" fill-rule="evenodd"/%3E%3C/svg%3E")',
          backgroundSize: '24px 24px',
          animation: 'moveBackground 60s linear infinite',
          '@keyframes moveBackground': {
            '0%': { backgroundPosition: '0 0' },
            '100%': { backgroundPosition: '100% 100%' }
          }
        }} />
        
        {/* Logo and Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, zIndex: 1 }}>
          <Box sx={{ 
            width: 44, 
            height: 44, 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mr: 1,
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1.5px solid #3b82f6'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="#3b82f6"/>
            </svg>
          </Box>
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#3b82f6',
              fontWeight: 700,
              fontSize: '1.75rem',
              background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            tez.social
          </Typography>
        </Box>
        
        {/* Hero Title */}
        <Box sx={{ mt: 10, mb: 6, zIndex: 1 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              color: 'white', 
              fontWeight: 700, 
              mb: 2,
              fontSize: { xs: '2.25rem', lg: '3rem' },
              lineHeight: 1.2,
            }}
          >
            Streamline your Telegram business communication
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', mb: 4 }}>
            Organize leads, manage conversations, and never miss an opportunity.
          </Typography>
        </Box>
        
        {/* Feature List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 42, 
              height: 42, 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'rgba(59, 130, 246, 0.12)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15 8H9V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8Z" fill="#3b82f6"/>
              </svg>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 0.5, fontSize: '1rem' }}>
                Privacy-First: No message storage
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                Your messages stay on Telegram, we only track the business context.
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 42, 
              height: 42, 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'rgba(59, 130, 246, 0.12)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.05 13.05C2.76 12.76 2.76 12.24 3.05 11.95L11.16 3.84C11.45 3.55 11.97 3.55 12.26 3.84L20.37 11.95C20.66 12.24 20.66 12.76 20.37 13.05L12.26 21.16C11.97 21.45 11.45 21.45 11.16 21.16L3.05 13.05ZM12 8C10.9 8 10 8.9 10 10C10 11.1 10.9 12 12 12C13.1 12 14 11.1 14 10C14 8.9 13.1 8 12 8Z" fill="#3b82f6"/>
              </svg>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 0.5, fontSize: '1rem' }}>
                Never miss a lead in your groups
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                Automatically track inquiries and leads from all your channels.
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 42, 
              height: 42, 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'rgba(59, 130, 246, 0.12)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="#3b82f6"/>
              </svg>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 0.5, fontSize: '1rem' }}>
                Complete visibility of your deal flow
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                Track your entire sales pipeline and monitor conversion rates.
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Footer */}
        <Box sx={{ mt: 'auto', pt: 4, zIndex: 1 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem' }}>
            Built for Web3 teams - secure, efficient, and privacy-focused.
          </Typography>
        </Box>
      </Box>
      
      {/* Right Section - Auth Form */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          width: { xs: '100%', md: '50%' },
          padding: { xs: 2, sm: 4 },
          background: 'linear-gradient(135deg, #0f172a 0%, #111827 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="dark:bg-[#1f2937]"
      >
        {/* Blurred gradient spheres for design */}
        <Box sx={{
          position: 'absolute',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0) 70%)',
          top: '-50px',
          right: '-100px',
          zIndex: 0,
          filter: 'blur(45px)'
        }} />
        
        <Box sx={{
          position: 'absolute',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.09) 0%, rgba(59,130,246,0) 70%)',
          bottom: '-150px',
          left: '-150px',
          zIndex: 0,
          filter: 'blur(65px)'
        }} />
        
        {/* Auth form container */}
        <Box sx={{ 
          maxWidth: 480, 
          width: '100%', 
          margin: '0 auto',
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Mobile Logo (visible on small screens) */}
          <Box 
            sx={{ 
              display: { xs: 'flex', md: 'none' }, 
              alignItems: 'center', 
              mb: 4 
            }}
          >
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mr: 1,
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1.5px solid #3b82f6'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="#3b82f6"/>
              </svg>
            </Box>
            <Typography variant="h5" sx={{ 
              color: '#3b82f6', 
              fontWeight: 700,
              background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              tez.social
            </Typography>
          </Box>
          
          <Typography 
            variant="h4" 
            sx={{ 
              color: 'white', 
              mb: 1, 
              fontWeight: 700,
              background: 'linear-gradient(90deg, #ffffff, #e5e7eb)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome to tez.social
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
            Your all-in-one solution for managing customer relationships
          </Typography>
          
          {/* Tab Buttons */}
          <Box sx={{ display: 'flex', mb: 3 }}>
            <Button
              variant={tab === 'signin' ? 'contained' : 'outlined'}
              color="primary"
              sx={{ 
                flex: 1, 
                py: 1.5, 
                borderRadius: 2, 
                borderTopRightRadius: 0, 
                borderBottomRightRadius: 0,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                backgroundColor: tab === 'signin' ? '#3b82f6' : 'transparent',
                borderColor: '#3b82f6',
                '&:hover': {
                  backgroundColor: tab === 'signin' ? '#2563eb' : 'rgba(59, 130, 246, 0.08)'
                }
              }}
              onClick={() => setTab('signin')}
            >
              Sign In
            </Button>
            <Button
              variant={tab === 'signup' ? 'contained' : 'outlined'}
              color="primary"
              sx={{ 
                flex: 1, 
                py: 1.5, 
                borderRadius: 2, 
                borderTopLeftRadius: 0, 
                borderBottomLeftRadius: 0,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                backgroundColor: tab === 'signup' ? '#3b82f6' : 'transparent',
                borderColor: '#3b82f6',
                '&:hover': {
                  backgroundColor: tab === 'signup' ? '#2563eb' : 'rgba(59, 130, 246, 0.08)'
                }
              }}
              onClick={() => setTab('signup')}
            >
              Sign Up
            </Button>
          </Box>
          
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
            {tab === 'signin' ? 'Sign in to your account to continue' : 'Create your account to get started'}
          </Typography>
          
          {/* Auth form */}
          {children}
          
          {/* Footer */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem' }}>
              <a className="text-blue-400 hover:underline" href="/privacy-policy">Privacy Policy</a> • <a className="text-blue-400 hover:underline" href="/terms-of-service">Terms of Service</a>
            </Typography>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default AuthLayout; 