import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  InputAdornment, 
  IconButton,
  FormHelperText,
  CircularProgress,
  Typography
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useRouter } from 'next/router';
import useThemeStore from '../store/themeStore';

const RegisterForm = () => {
  const router = useRouter();
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user types
    setFormErrors({
      ...formErrors,
      [name]: '',
    });
    setError('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    let isValid = true;
    const newFormErrors = { ...formErrors };
    
    if (!formData.username.trim()) {
      newFormErrors.username = 'Username is required';
      isValid = false;
    }
    
    if (!formData.email.trim()) {
      newFormErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newFormErrors.email = 'Email is invalid';
      isValid = false;
    }
    
    if (!formData.password) {
      newFormErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newFormErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      newFormErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setFormErrors(newFormErrors);
    
    if (!isValid) return;
    
    setLoading(true);
    setError('');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      await axios.post(`${apiUrl}/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      router.push('/auth/login');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
      borderRadius: '12px',
    },
    mb: 3
  };

  const labelStyle = {
    display: 'block',
    color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
    fontWeight: 500, 
    fontSize: '0.9rem',
    mb: 1
  };
  
  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      sx={{ width: '100%' }}
    >
      {error && (
        <FormHelperText 
          error 
          sx={{ 
            textAlign: 'center', 
            mb: 3,
            fontSize: '0.875rem' 
          }}
        >
          {error}
        </FormHelperText>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Typography sx={labelStyle}>Username</Typography>
        <TextField
          fullWidth
          id="username"
          name="username"
          variant="outlined"
          value={formData.username}
          onChange={handleChange}
          error={!!formErrors.username}
          helperText={formErrors.username}
          placeholder="Username"
          sx={inputStyles}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            sx: { height: 56 }
          }}
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography sx={labelStyle}>Email</Typography>
        <TextField
          fullWidth
          id="email"
          name="email"
          type="email"
          variant="outlined"
          value={formData.email}
          onChange={handleChange}
          error={!!formErrors.email}
          helperText={formErrors.email}
          placeholder="your.email@example.com"
          sx={inputStyles}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            sx: { height: 56 }
          }}
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography sx={labelStyle}>Password</Typography>
        <TextField
          fullWidth
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          value={formData.password}
          onChange={handleChange}
          error={!!formErrors.password}
          helperText={formErrors.password || "Must be at least 6 characters"}
          sx={inputStyles}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            sx: { height: 56 },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  sx={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : undefined }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography sx={labelStyle}>Confirm Password</Typography>
        <TextField
          fullWidth
          id="confirmPassword"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          variant="outlined"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={!!formErrors.confirmPassword}
          helperText={formErrors.confirmPassword}
          sx={inputStyles}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            sx: { height: 56 },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  sx={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : undefined }}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{
          py: 1.8,
          borderRadius: '12px',
          boxShadow: '0 4px 10px rgba(59, 130, 246, 0.25)',
          bgcolor: '#3b82f6',
          '&:hover': {
            bgcolor: '#2563eb',
          },
          transition: 'all 0.2s ease',
          fontWeight: 500,
          fontSize: '1rem',
          height: 56
        }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Sign Up'
        )}
      </Button>
    </Box>
  );
};

export default RegisterForm; 