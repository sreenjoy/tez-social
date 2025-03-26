import React, { useState } from 'react';
import { TextField, Button, Box, CircularProgress, Alert, Typography, Link } from '@mui/material';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, isLoading, error: authError, clearError } = useAuthStore();
  const { resolvedTheme } = useThemeStore();
  
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

  // Text field common styles
  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      bgcolor: resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
      borderRadius: '10px',
      '&:hover fieldset': {
        borderColor: resolvedTheme === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.3)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#3b82f6',
        borderWidth: '2px',
      },
    },
    '& .MuiOutlinedInput-input': {
      color: resolvedTheme === 'dark' ? 'white' : '#1a2b42',
      padding: '16px',
      '&::placeholder': {
        color: resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
        opacity: 1,
      },
    },
    '& .MuiFormHelperText-root': {
      marginLeft: '4px',
    },
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {(error || authError) && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            bgcolor: resolvedTheme === 'dark' ? 'rgba(211, 47, 47, 0.1)' : 'rgba(211, 47, 47, 0.05)', 
            color: '#f44336',
            border: '1px solid rgba(211, 47, 47, 0.2)',
            borderRadius: '10px',
            '& .MuiAlert-icon': {
              color: '#f44336',
            },
          }}
        >
          {error || authError}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 1, 
            color: resolvedTheme === 'dark' ? 'white' : '#1a2b42',
            fontWeight: 500,
            ml: 1
          }}
        >
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
          sx={textFieldStyles}
        />
      </Box>
      
      <Box sx={{ mb: 1.5 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 1, 
            color: resolvedTheme === 'dark' ? 'white' : '#1a2b42',
            fontWeight: 500,
            ml: 1
          }}
        >
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
          sx={textFieldStyles}
        />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Link
          component="button"
          type="button"
          variant="body2"
          sx={{ 
            color: '#3b82f6', 
            textDecoration: 'none', 
            '&:hover': { textDecoration: 'underline' },
            fontWeight: 500,
            mr: 1
          }}
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
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          borderRadius: '10px',
          boxShadow: resolvedTheme === 'dark' 
            ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
            : '0 4px 12px rgba(59, 130, 246, 0.2)',
          letterSpacing: '0.01em',
          height: '50px',
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
    </Box>
  );
};

export default LoginForm; 