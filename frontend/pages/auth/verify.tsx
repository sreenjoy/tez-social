import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Card, CardContent, Typography, Box, CircularProgress, Button, Alert } from '@mui/material';
import { authApi } from '../../services/api';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { token } = router.query;
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only verify when token is available in the URL
    if (token && typeof token === 'string') {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setIsVerifying(true);
      setError(null);

      const response = await authApi.verifyEmail(verificationToken);
      
      if (response && response.data) {
        setVerificationSuccess(true);
        // We'll redirect to the onboarding page after a short delay
        setTimeout(() => {
          router.push('/auth/onboarding');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Verification failed:', error);
      setError(error.response?.data?.message || 'Email verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <Head>
        <title>Verify Email | Tez Social</title>
        <meta name="description" content="Verify your email address" />
      </Head>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: 2,
          bgcolor: 'background.default',
        }}
      >
        <Card sx={{ maxWidth: 500, width: '100%', boxShadow: 3 }}>
          <CardContent sx={{ padding: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Email Verification
              </Typography>
            </Box>

            {isVerifying ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CircularProgress size={60} thickness={5} />
                <Typography variant="body1" sx={{ mt: 3 }}>
                  Verifying your email address...
                </Typography>
              </Box>
            ) : verificationSuccess ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Alert severity="success" sx={{ mb: 3 }}>
                  Email verification successful! You will be redirected to complete your profile.
                </Alert>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  If you are not redirected automatically, please click the button below.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3 }}
                  onClick={() => router.push('/auth/onboarding')}
                >
                  Continue to Profile Setup
                </Button>
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Please try the verification link again or request a new verification email.
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    component={Link}
                    href="/auth/login"
                  >
                    Back to Login
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    component={Link}
                    href="/auth/resend-verification"
                  >
                    Resend Verification
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body1">
                  Waiting for verification token...
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  );
} 