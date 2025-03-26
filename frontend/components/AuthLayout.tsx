import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, Typography, Container, Button } from '@mui/material';
import ThemeToggle from './ThemeToggle';
import useAuthStore from '../store/authStore';

interface AuthLayoutProps {
  children: React.ReactNode;
  initialTab?: 'signin' | 'signup';
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, initialTab = 'signin' }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);
  const { isAuthenticated } = useAuthStore();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Handle tab change
  const handleTabChange = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    router.push(tab === 'signin' ? '/auth/login' : '/auth/register');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0e1620] text-white">
      <Head>
        <title>{activeTab === 'signin' ? 'Sign In' : 'Sign Up'} | Tez Social</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      
      <Box sx={{ 
        position: 'absolute', 
        top: 16, 
        right: 16,
        zIndex: 10
      }}>
        <ThemeToggle />
      </Box>

      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* Left section with logo and tagline */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 4
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '2px solid white'
            }}>
              <Typography variant="body1" color="white">T</Typography>
            </Box>
            <Typography variant="h6" color="white">
              tez.social
            </Typography>
          </Box>

          <Box sx={{ mb: 10 }}>
            <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Streamline your Telegram business communication
            </Typography>
            
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(59, 130, 246, 0.2)',
                    mr: 2
                  }}
                >
                  <Box component="span" sx={{ fontSize: '1.25rem', color: '#3b82f6' }}>⚙️</Box>
                </Box>
                <Typography>Privacy-First: No message storage</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(59, 130, 246, 0.2)',
                    mr: 2
                  }}
                >
                  <Box component="span" sx={{ fontSize: '1.25rem', color: '#3b82f6' }}>⚡</Box>
                </Box>
                <Typography>Never miss a lead in your groups</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(59, 130, 246, 0.2)',
                    mr: 2
                  }}
                >
                  <Box component="span" sx={{ fontSize: '1.25rem', color: '#3b82f6' }}>📊</Box>
                </Box>
                <Typography>Complete visibility of your deal flow</Typography>
              </Box>
            </Box>
          </Box>

          <Typography variant="body2" color="gray">
            Built for Web3 teams - secure, efficient, and privacy-focused.
          </Typography>
        </Box>

        {/* Right section with form */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          p: 4,
          maxWidth: '500px'
        }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h2" sx={{ mb: 1 }}>
              Welcome to tez.social
            </Typography>
            <Typography variant="body1" color="gray">
              Your all-in-one solution for managing customer relationships
            </Typography>
          </Box>

          <Box sx={{ 
            mb: 4,
            display: 'flex',
            borderRadius: 1,
            overflow: 'hidden',
            width: '100%',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <Button
              fullWidth
              variant={activeTab === 'signin' ? 'contained' : 'text'}
              color="primary"
              onClick={() => handleTabChange('signin')}
              sx={{ 
                py: 1,
                borderRadius: 0,
                color: activeTab === 'signin' ? 'white' : 'gray',
                bgcolor: activeTab === 'signin' ? 'primary.main' : 'transparent',
                '&:hover': {
                  bgcolor: activeTab === 'signin' ? 'primary.dark' : 'rgba(255, 255, 255, 0.05)'
                }
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
                py: 1,
                borderRadius: 0,
                color: activeTab === 'signup' ? 'white' : 'gray',
                bgcolor: activeTab === 'signup' ? 'primary.main' : 'transparent',
                '&:hover': {
                  bgcolor: activeTab === 'signup' ? 'primary.dark' : 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              Sign Up
            </Button>
          </Box>

          <Typography variant="body2" color="gray" sx={{ mb: 2 }}>
            {activeTab === 'signin' 
              ? 'Enter your email and password to sign in' 
              : 'Create your account to get started'}
          </Typography>

          <Box>
            {children}
          </Box>

          <Box sx={{ mt: 'auto', textAlign: 'center' }}>
            <Button 
              variant="text" 
              color="inherit" 
              sx={{ color: 'gray' }}
              onClick={() => router.push('/auth/skip')}
            >
              Skip Login
            </Button>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default AuthLayout; 