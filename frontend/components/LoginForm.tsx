import React, { useState } from 'react';
import { TextField, Button, Box, CircularProgress, Alert, InputAdornment, IconButton } from '@mui/material';
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {(error || authError) && (
        <Alert severity="error" sx={{ mb: 1, py: 0.5, fontSize: 13 }}>
          {error || authError}
        </Alert>
      )}
      
      <Box sx={{ mb: 1 }}>
        <label htmlFor="email" className="block text-white text-sm mb-1">Email</label>
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
          inputProps={{
            className: 'bg-[#111827]/20 text-white'
          }}
          sx={{ 
            '.MuiOutlinedInput-root': { 
              borderRadius: 1.5,
              backgroundColor: '#111827',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6'
              }
            }
          }}
        />
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <label htmlFor="password" className="block text-white text-sm mb-1">Password</label>
        <TextField
          fullWidth
          name="password"
          type={showPassword ? "text" : "password"}
          id="password"
          autoComplete="current-password"
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
                  sx={{ color: 'gray' }}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </IconButton>
              </InputAdornment>
            ),
            className: 'bg-[#111827]/20 text-white'
          }}
          sx={{ 
            '.MuiOutlinedInput-root': { 
              borderRadius: 1.5,
              backgroundColor: '#111827',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6'
              }
            }
          }}
        />
      </Box>
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={isLoading || redirecting}
        sx={{ 
          py: 1, 
          borderRadius: 1.5,
          textTransform: 'none',
          fontWeight: 'bold',
          fontSize: '1rem'
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
      
      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Button 
          variant="text" 
          color="primary" 
          size="small"
          onClick={() => router.push('/auth/forgot-password')}
          sx={{ textTransform: 'none', fontSize: '0.9rem' }}
        >
          Forgot password?
        </Button>
      </Box>
    </Box>
  );
};

export default LoginForm; 