import React, { useState } from 'react';
import { TextField, Button, Box, CircularProgress, Alert, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { register, isLoading, error: authError, clearError } = useAuthStore();
  const { resolvedTheme } = useThemeStore();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearError();

    // Form validation
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    // Username validation
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      setError('Username can only contain letters, numbers, dots, underscores, and hyphens');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register({
        username,
        email,
        password
      });
      setRedirecting(true);
      // Wait a bit before redirecting to show success state
      setTimeout(() => {
        router.push('/auth/onboarding');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      setRedirecting(false);
    }
  };

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
          Username
        </Typography>
        <TextField
          fullWidth
          id="username"
          name="username"
          placeholder="username"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading || redirecting}
          variant="outlined"
          sx={textFieldStyles}
        />
      </Box>
      
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading || redirecting}
          variant="outlined"
          sx={textFieldStyles}
        />
      </Box>
      
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
          Password
        </Typography>
        <TextField
          fullWidth
          name="password"
          type="password"
          id="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading || redirecting}
          variant="outlined"
          helperText={resolvedTheme === 'dark' 
            ? <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Must be at least 6 characters</span>
            : "Must be at least 6 characters"}
          sx={textFieldStyles}
        />
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 1, 
            color: resolvedTheme === 'dark' ? 'white' : '#1a2b42',
            fontWeight: 500,
            ml: 1
          }}
        >
          Confirm Password
        </Typography>
        <TextField
          fullWidth
          name="confirmPassword"
          type="password"
          id="confirmPassword"
          placeholder="••••••••"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading || redirecting}
          variant="outlined"
          sx={textFieldStyles}
        />
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
          'Account Created! Redirecting...'
        ) : (
          'Create Account'
        )}
      </Button>
    </Box>
  );
};

export default RegisterForm; 