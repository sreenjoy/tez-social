import React, { useState } from 'react';
import { TextField, Button, Box, CircularProgress, Alert, InputAdornment, IconButton } from '@mui/material';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { register, isLoading, error: authError, clearError } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {(error || authError) && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2, 
            py: 0.75, 
            fontSize: 13,
            borderRadius: 2,
            backgroundColor: 'rgba(211, 47, 47, 0.15)',
            color: '#f5f5f5',
            '.MuiAlert-icon': {
              color: '#ef5350'
            }
          }}
        >
          {error || authError}
        </Alert>
      )}
      
      <Box sx={{ mb: 2 }}>
        <label htmlFor="username" className="block text-white text-sm mb-1.5 font-medium">Username</label>
        <TextField
          fullWidth
          id="username"
          name="username"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading || redirecting}
          size="small"
          variant="outlined"
          placeholder="username"
          inputProps={{
            className: 'bg-[#111827]/20 text-white'
          }}
          sx={{ 
            '.MuiOutlinedInput-root': { 
              borderRadius: 2,
              backgroundColor: '#111827',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
                borderWidth: '2px'
              }
            },
            '.MuiOutlinedInput-input': {
              padding: '12px 16px',
              '&::placeholder': {
                color: 'rgba(255,255,255,0.4)',
                opacity: 1
              }
            }
          }}
        />
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <label htmlFor="email" className="block text-white text-sm mb-1.5 font-medium">Email</label>
        <TextField
          fullWidth
          id="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading || redirecting}
          size="small"
          variant="outlined"
          placeholder="your@email.com"
          inputProps={{
            className: 'bg-[#111827]/20 text-white'
          }}
          sx={{ 
            '.MuiOutlinedInput-root': { 
              borderRadius: 2,
              backgroundColor: '#111827',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
                borderWidth: '2px'
              }
            },
            '.MuiOutlinedInput-input': {
              padding: '12px 16px',
              '&::placeholder': {
                color: 'rgba(255,255,255,0.4)',
                opacity: 1
              }
            }
          }}
        />
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <label htmlFor="password" className="block text-white text-sm mb-1.5 font-medium">Password</label>
        <TextField
          fullWidth
          name="password"
          type={showPassword ? "text" : "password"}
          id="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading || redirecting}
          size="small"
          variant="outlined"
          placeholder="••••••••"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={togglePasswordVisibility}
                  edge="end"
                  size="small"
                  sx={{ color: 'rgba(255,255,255,0.5)', mr: -0.5 }}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </IconButton>
              </InputAdornment>
            ),
            className: 'bg-[#111827]/20 text-white'
          }}
          sx={{ 
            '.MuiOutlinedInput-root': { 
              borderRadius: 2,
              backgroundColor: '#111827',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
                borderWidth: '2px'
              }
            },
            '.MuiOutlinedInput-input': {
              padding: '12px 16px',
              '&::placeholder': {
                color: 'rgba(255,255,255,0.4)',
                opacity: 1
              }
            }
          }}
        />
        <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters</p>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <label htmlFor="confirmPassword" className="block text-white text-sm mb-1.5 font-medium">Confirm Password</label>
        <TextField
          fullWidth
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          id="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading || redirecting}
          size="small"
          variant="outlined"
          placeholder="••••••••"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={toggleConfirmPasswordVisibility}
                  edge="end"
                  size="small"
                  sx={{ color: 'rgba(255,255,255,0.5)', mr: -0.5 }}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </IconButton>
              </InputAdornment>
            ),
            className: 'bg-[#111827]/20 text-white'
          }}
          sx={{ 
            '.MuiOutlinedInput-root': { 
              borderRadius: 2,
              backgroundColor: '#111827',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
                borderWidth: '2px'
              }
            },
            '.MuiOutlinedInput-input': {
              padding: '12px 16px',
              '&::placeholder': {
                color: 'rgba(255,255,255,0.4)',
                opacity: 1
              }
            }
          }}
        />
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading || redirecting}
        sx={{ 
          py: 1.5, 
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 'bold',
          fontSize: '1rem',
          background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
          boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
          '&:hover': {
            background: 'linear-gradient(90deg, #2563eb, #4f96ff)',
            boxShadow: '0 6px 20px rgba(59, 130, 246, 0.6)'
          },
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'all 0.6s',
          },
          '&:hover::after': {
            left: '100%',
          }
        }}
      >
        {isLoading ? (
          <CircularProgress size={24} sx={{ color: 'white' }} />
        ) : redirecting ? (
          'Redirecting...'
        ) : (
          'Create Account'
        )}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 2.5 }}>
        <Box 
          sx={{ 
            fontSize: '0.875rem', 
            color: 'rgba(255,255,255,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 0.75
          }}
        >
          Already have an account?
          <Button 
            variant="text" 
            color="primary"
            onClick={() => router.push('/auth/login')}
            sx={{ 
              textTransform: 'none', 
              fontSize: '0.875rem', 
              p: 0,
              minWidth: 'unset',
              fontWeight: 600,
              color: '#60a5fa',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline'
              }
            }}
          >
            Sign in
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterForm; 