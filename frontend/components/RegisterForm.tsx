import React, { useState } from 'react';
import { TextField, Button, Box, CircularProgress, Alert, Typography, InputAdornment } from '@mui/material';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';
import GoogleIcon from '@mui/icons-material/Google';

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { register, isLoading, error: authError, clearError } = useAuthStore();
  
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

  const handleGoogleLogin = () => {
    // Google login functionality would be implemented here
    alert('Google sign up not implemented yet');
  };

  const textFieldStyles = {
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
        <Typography variant="body2" sx={{ mb: 1, color: 'white' }}>
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
        <Typography variant="body2" sx={{ mb: 1, color: 'white' }}>
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
          sx={textFieldStyles}
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 1, color: 'white' }}>
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
          mb: 2
        }}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : redirecting ? (
          'Redirecting...'
        ) : (
          'Sign Up'
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

export default RegisterForm; 