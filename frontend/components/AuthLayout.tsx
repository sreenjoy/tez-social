import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, Typography, Container, Button } from '@mui/material';
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
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#111827]">
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

      {/* Left side - Product info */}
      <Box 
        sx={{ 
          width: '40%', 
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          p: 4,
          pt: 6,
          position: 'relative'
        }}
        className="dark:bg-[#111827]"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mr: 1,
            backgroundColor: 'transparent',
            border: '2px solid #3b82f6'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="#3b82f6"/>
            </svg>
          </Box>
          <Typography component="h1" variant="h5" color="#3b82f6" fontWeight="bold">
            tez.social
          </Typography>
        </Box>

        <Box sx={{ mt: 12, mb: 4 }}>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>
            Streamline your Telegram business communication
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(59, 130, 246, 0.1)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15 8H9V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8Z" fill="#3b82f6"/>
              </svg>
            </Box>
            <Typography variant="h6" component="h3" sx={{ color: 'white' }}>
              Privacy-First: No message storage
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(59, 130, 246, 0.1)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.05 13.05C2.76 12.76 2.76 12.24 3.05 11.95L11.16 3.84C11.45 3.55 11.97 3.55 12.26 3.84L20.37 11.95C20.66 12.24 20.66 12.76 20.37 13.05L12.26 21.16C11.97 21.45 11.45 21.45 11.16 21.16L3.05 13.05ZM12 8C10.9 8 10 8.9 10 10C10 11.1 10.9 12 12 12C13.1 12 14 11.1 14 10C14 8.9 13.1 8 12 8Z" fill="#3b82f6"/>
              </svg>
            </Box>
            <Typography variant="h6" component="h3" sx={{ color: 'white' }}>
              Never miss a lead in your groups
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(59, 130, 246, 0.1)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="#3b82f6"/>
              </svg>
            </Box>
            <Typography variant="h6" component="h3" sx={{ color: 'white' }}>
              Complete visibility of your deal flow
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 'auto', pt: 4 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Built for Web3 teams - secure, efficient, and privacy-focused.
          </Typography>
        </Box>
      </Box>

      {/* Right side - Auth form */}
      <Box 
        sx={{ 
          width: { xs: '100%', md: '60%' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 }
        }}
        className="dark:bg-[#1f2937]"
      >
        <Box 
          sx={{ 
            maxWidth: 480,
            width: '100%',
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', mb: 4 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mr: 1,
              backgroundColor: 'transparent',
              border: '2px solid #3b82f6'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="#3b82f6"/>
              </svg>
            </Box>
            <Typography component="h1" variant="h5" color="#3b82f6" fontWeight="bold">
              tez.social
            </Typography>
          </Box>

          <Typography variant="h4" component="h1" sx={{ color: 'white', mb: 1, fontWeight: 700 }}>
            Welcome to tez.social
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
            Your all-in-one solution for managing customer relationships
          </Typography>

          <Box sx={{ display: 'flex', mb: 3 }}>
            <Button
              variant={activeTab === 'signin' ? 'contained' : 'outlined'}
              sx={{ 
                flex: 1, 
                py: 1.5,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0
              }}
              onClick={() => handleTabChange('signin')}
            >
              Sign In
            </Button>
            <Button
              variant={activeTab === 'signup' ? 'contained' : 'outlined'}
              sx={{ 
                flex: 1,
                py: 1.5, 
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0
              }}
              onClick={() => handleTabChange('signup')}
            >
              Sign Up
            </Button>
          </Box>

          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
            Create your account to get started
          </Typography>

          {children}
          
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 2, textAlign: 'center' }}>
            <Link href="/privacy-policy" className="text-blue-400 hover:underline">
              Privacy Policy
            </Link>
            {' • '}
            <Link href="/terms-of-service" className="text-blue-400 hover:underline">
              Terms of Service
            </Link>
          </Typography>
        </Box>
      </Box>
    </div>
  );
};

export default AuthLayout; 