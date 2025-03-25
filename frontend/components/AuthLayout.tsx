import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, Typography, Container, Paper, Tabs, Tab, Button } from '@mui/material';
import ThemeToggle from './ThemeToggle';
import useAuthStore from '../store/authStore';
import Image from 'next/image';

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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>{activeTab === 'signin' ? 'Sign In' : 'Sign Up'} | Tez Social</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      
      <Box sx={{ 
        position: 'absolute', 
        top: 10, 
        right: 10,
        zIndex: 10
      }}>
        <ThemeToggle />
      </Box>

      <Container component="main" maxWidth="xs" className="flex flex-col flex-grow justify-center py-12">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '50%', 
              bgcolor: 'primary.main', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Typography variant="h5" color="white">T</Typography>
            </Box>
            <Typography component="h1" variant="h5" color="primary.main" fontWeight="bold">
              tez.social
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Web3's Telegram CRM Solution
          </Typography>

          <Paper 
            elevation={2}
            sx={{ 
              width: '100%', 
              overflow: 'hidden',
              borderRadius: 2,
              bgcolor: 'background.paper',
              transition: 'all 0.3s ease'
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, value) => handleTabChange(value)}
              variant="fullWidth"
              aria-label="auth tabs"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab 
                label="Sign In" 
                value="signin" 
                id="auth-tab-signin"
                aria-controls="auth-tabpanel-signin"
              />
              <Tab 
                label="Sign Up" 
                value="signup"
                id="auth-tab-signup"
                aria-controls="auth-tabpanel-signup" 
              />
            </Tabs>
            
            <Box sx={{ p: 3 }}>
              {children}
            </Box>
          </Paper>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 5 }}>
            <Link href="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline">
              Privacy Policy
            </Link>
            {' • '}
            <Link href="/terms-of-service" className="text-blue-600 dark:text-blue-400 hover:underline">
              Terms of Service
            </Link>
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default AuthLayout; 