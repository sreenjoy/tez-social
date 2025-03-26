import React, { useState } from 'react';
import { TextField, Button, Box, CircularProgress, Alert, Typography, InputAdornment, Link } from '@mui/material';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';
import GoogleIcon from '@mui/icons-material/Google';

const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, isLoading, error: authError, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearError();
    
    try {
      await login(email, password);
      setRedirecting(true);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    }
  };

  const handleGoogleLogin = () => {
    // Google login functionality would be implemented here
    alert('Google login not implemented yet');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {(error || authError) && (
        <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#f44336' }}>
          {error || authError}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 1, color: 'white' }}>
          Email
        </Typography>
        <TextField
          fullWidth
          id="email"
          name="email"
          placeholder="your.email@example.com"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading || redirecting}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              '&:hover fieldset': {
                borderColor: 'rgba(59, 130, 246, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#3b82f6',
              },
            },
            '& .MuiOutlinedInput-input': {
              color: 'white',
            },
          }}
        />
      </Box>
      
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="body2" sx={{ mb: 1, color: 'white' }}>
          Password
        </Typography>
        <TextField
          fullWidth
          name="password"
          type="password"
          id="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading || redirecting}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              '&:hover fieldset': {
                borderColor: 'rgba(59, 130, 246, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#3b82f6',
              },
            },
            '& .MuiOutlinedInput-input': {
              color: 'white',
            },
          }}
        />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Link
          component="button"
          type="button"
          variant="body2"
          sx={{ color: '#3b82f6', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => router.push('/auth/forgot-password')}
        >
          Forgot password?
        </Link>
      </Box>
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={isLoading || redirecting}
        sx={{ 
          py: 1.5,
          bgcolor: '#3b82f6',
          '&:hover': {
            bgcolor: '#2563eb',
          },
          mb: 2
        }}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : redirecting ? (
          'Redirecting...'
        ) : (
          'Sign In'
        )}
      </Button>
      
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="body2" color="gray">
          OR CONTINUE WITH
        </Typography>
      </Box>
      
      <Button
        fullWidth
        variant="outlined"
        startIcon={<GoogleIcon />}
        onClick={handleGoogleLogin}
        sx={{ 
          py: 1.5,
          color: 'white',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
            bgcolor: 'rgba(255, 255, 255, 0.05)'
          }
        }}
      >
        Google
      </Button>
    </Box>
  );
};

export default LoginForm; 