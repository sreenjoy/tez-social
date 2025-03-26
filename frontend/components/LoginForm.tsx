import React, { useState } from 'react';
import { TextField, Button, Box, CircularProgress, Alert, InputAdornment, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';

const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, isLoading, error: authError, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearError();
    
    // Form validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      await login(email, password);
      setRedirecting(true);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
        <label htmlFor="email" className="block text-white text-sm mb-1.5 font-medium">Email</label>
        <TextField
          fullWidth
          id="email"
          name="email"
          autoComplete="email"
          autoFocus
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
      
      <Box sx={{ mb: 1 }}>
        <label htmlFor="password" className="block text-white text-sm mb-1.5 font-medium">Password</label>
        <TextField
          fullWidth
          name="password"
          type={showPassword ? "text" : "password"}
          id="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading || redirecting}
          size="small"
          variant="outlined"
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
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              size="small"
              sx={{
                color: 'rgba(255,255,255,0.5)',
                '&.Mui-checked': {
                  color: '#60a5fa',
                },
              }}
            />
          }
          label="Remember me"
          sx={{ 
            '.MuiFormControlLabel-label': { 
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.7)'
            }
          }}
        />
        <Button 
          variant="text" 
          color="primary" 
          size="small"
          onClick={() => router.push('/auth/forgot-password')}
          sx={{ 
            textTransform: 'none', 
            fontSize: '0.875rem',
            padding: 0,
            minWidth: 'unset',
            fontWeight: 500,
            color: '#60a5fa',
            '&:hover': {
              backgroundColor: 'transparent',
              textDecoration: 'underline',
            }
          }}
        >
          Forgot password?
        </Button>
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
          'Sign In'
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
          New to tez.social?
          <Button 
            variant="text" 
            color="primary"
            onClick={() => router.push('/auth/register')}
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
            Create an account
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginForm; 