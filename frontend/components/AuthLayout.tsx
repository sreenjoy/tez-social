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

// Feature point component
const FeaturePoint: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, zIndex: 1 }}>
    <Box sx={{ 
      width: 48, 
      height: 48, 
      borderRadius: '50%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      mr: 2.5,
      background: 'rgba(59, 130, 246, 0.12)',
      border: '1.5px solid rgba(59, 130, 246, 0.3)'
    }}>
      {icon}
    </Box>
    <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
      {title}
    </Typography>
  </Box>
);

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

  // Safety check - if theme is not loaded yet, don't render theme-dependent elements
  if (!mounted) return null;

  const isDarkTheme = theme === 'dark';
  
  // Get theme icon based on current theme
  const getThemeIcon = () => {
    if (isDarkTheme) {
      return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
    } else if (theme === 'light') {
      return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
    } else {
      return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
    }
  };

  return (
    <div className={`min-h-screen flex ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Theme Toggle */}
      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
        <Tooltip title="Change theme">
          <IconButton 
            color="inherit" 
            size="small"
            onClick={openThemeMenu}
            sx={{
              color: isDarkTheme ? 'white' : '#1A2235',
              backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              '&:hover': {
                backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
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
          background: isDarkTheme ? '#1A2235' : '#1f4287',
          backgroundImage: isDarkTheme 
            ? 'linear-gradient(135deg, #1A2235 0%, #0f172a 100%)' 
            : 'linear-gradient(135deg, #1f4287 0%, #071e56 100%)',
          overflow: 'hidden'
        }}
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, zIndex: 1 }}>
          <Box sx={{ 
            width: 36, 
            height: 36, 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mr: 1,
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1.5px solid #3b82f6'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="#3b82f6"/>
            </svg>
          </Box>
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#3b82f6',
              fontWeight: 700,
              fontSize: '1.35rem',
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
        <Box sx={{ mt: 8, mb: 6, zIndex: 1 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              color: 'white', 
              fontWeight: 700, 
              mb: 2,
              fontSize: { xs: '1.75rem', lg: '2.1rem' },
              lineHeight: 1.2,
            }}
          >
            Streamline your Telegram business communication
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', mb: 4 }}>
            Organize leads, manage conversations, and never miss an opportunity.
          </Typography>
        </Box>
        
        {/* Feature Points */}
        <Box sx={{ mb: 6, zIndex: 1 }}>
          <FeaturePoint 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            } 
            title="Privacy-First: No message storage" 
          />
          
          <FeaturePoint 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            } 
            title="Never miss a lead in your groups" 
          />
          
          <FeaturePoint 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                <line x1="6" y1="6" x2="6.01" y2="6"></line>
                <line x1="6" y1="18" x2="6.01" y2="18"></line>
              </svg>
            } 
            title="Complete visibility of your deal flow" 
          />
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
          background: isDarkTheme ? '#111827' : '#f8f9fa',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center'
        }}
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
          maxWidth: '400px', 
          margin: '0 auto', 
          width: '100%',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Tabs for switching between sign in and sign up */}
          <Box sx={{ mb: 4, display: 'flex', border: '1px solid', borderColor: isDarkTheme ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
            <Button 
              variant={tab === 'signin' ? 'contained' : 'text'}
              onClick={() => setTab('signin')}
              sx={{ 
                flexGrow: 1, 
                py: 1,
                bgcolor: tab === 'signin' ? 'primary.main' : 'transparent',
                color: tab === 'signin' ? 'white' : (isDarkTheme ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
                '&:hover': {
                  bgcolor: tab === 'signin' ? 'primary.dark' : (isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                },
                borderRadius: '10px 0 0 10px',
                textTransform: 'none',
              }}
            >
              Sign In
            </Button>
            <Button 
              variant={tab === 'signup' ? 'contained' : 'text'}
              onClick={() => setTab('signup')}
              sx={{ 
                flexGrow: 1, 
                py: 1,
                bgcolor: tab === 'signup' ? 'primary.main' : 'transparent',
                color: tab === 'signup' ? 'white' : (isDarkTheme ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
                '&:hover': {
                  bgcolor: tab === 'signup' ? 'primary.dark' : (isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                },
                borderRadius: '0 10px 10px 0',
                textTransform: 'none',
              }}
            >
              Sign Up
            </Button>
          </Box>
          
          {/* Auth form */}
          {children}
        </Box>
      </Box>
    </div>
  );
};

export default AuthLayout; 