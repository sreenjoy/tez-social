import React from 'react';
import { Box, Typography, Link as MuiLink, useMediaQuery } from '@mui/material';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import RegisterForm from '../../components/RegisterForm';
import AuthLayout from '../../components/AuthLayout';
import useThemeStore from '../../store/themeStore';

const Register: NextPage = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';

  return (
    <>
      <Head>
        <title>Create Account | Tez Social</title>
        <meta name="description" content="Create your Tez Social account" />
      </Head>
      <AuthLayout>
        <Box 
          sx={{ 
            width: '100%', 
            maxWidth: 450,
            p: isMobile ? 3 : 6,
            borderRadius: 3,
            bgcolor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            boxShadow: isDark 
              ? '0 4px 30px rgba(0, 0, 0, 0.3)' 
              : '0 4px 30px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
          }}
        >
          <Typography 
            variant={isMobile ? "h4" : "h3"} 
            component="h1" 
            sx={{ 
              mb: 1,
              fontWeight: 700,
              textAlign: 'center',
              color: isDark ? 'white' : '#1a2b42',
              letterSpacing: '-0.02em'
            }}
          >
            Join Tez Social
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4, 
              textAlign: 'center',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
              fontWeight: 400,
              maxWidth: '85%',
              mx: 'auto'
            }}
          >
            Create an account to get started
          </Typography>
          
          <RegisterForm />
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                display: 'inline',
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
              }}
            >
              Already have an account?{' '}
            </Typography>
            <Link href="/auth/login" passHref>
              <MuiLink 
                sx={{ 
                  color: '#3b82f6',
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign In
              </MuiLink>
            </Link>
          </Box>
        </Box>
      </AuthLayout>
    </>
  );
};

export default Register; 