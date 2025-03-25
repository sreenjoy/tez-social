import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import useAuthStore from '../../store/authStore';
import { companyApi } from '../../services/api';
import { SelectChangeEvent } from '@mui/material/Select';

// Define the enum values matching the backend
const teamSizes = [
  { value: 'Solo entrepreneur', label: 'Solo entrepreneur' },
  { value: '2-10 employees', label: '2-10 employees' },
  { value: '11-50 employees', label: '11-50 employees' },
  { value: '51-200 employees', label: '51-200 employees' },
  { value: '201+ employees', label: '201+ employees' },
];

const userRoles = [
  { value: 'Owner/Founder', label: 'Owner/Founder' },
  { value: 'Executive/C-level', label: 'Executive/C-level' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Sales representative', label: 'Sales representative' },
  { value: 'Marketing professional', label: 'Marketing professional' },
  { value: 'Support specialist', label: 'Support specialist' },
  { value: 'Developer', label: 'Developer' },
  { value: 'Other', label: 'Other' },
];

const purposes = [
  { value: 'Lead management', label: 'Lead management' },
  { value: 'Customer support', label: 'Customer support' },
  { value: 'Sales process', label: 'Sales process' },
  { value: 'Community management', label: 'Community management' },
  { value: 'Product feedback', label: 'Product feedback' },
  { value: 'Other', label: 'Other' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  const [formData, setFormData] = useState({
    ownerFullName: user ? `${user.firstName} ${user.lastName}` : '',
    name: '',
    url: '',
    teamSize: '',
    ownerRole: '',
    ownerRoleCustom: '',
    purpose: '',
    purposeCustom: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Check authentication status
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when field is updated
    if (errors[name as string]) {
      setErrors({
        ...errors,
        [name as string]: '',
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.ownerFullName) newErrors.ownerFullName = 'Full name is required';
    if (!formData.name) newErrors.name = 'Company name is required';
    if (!formData.teamSize) newErrors.teamSize = 'Team size is required';
    if (!formData.ownerRole) newErrors.ownerRole = 'Your role is required';
    if (formData.ownerRole === 'Other' && !formData.ownerRoleCustom) {
      newErrors.ownerRoleCustom = 'Please specify your role';
    }
    if (!formData.purpose) newErrors.purpose = 'Purpose is required';
    if (formData.purpose === 'Other' && !formData.purposeCustom) {
      newErrors.purposeCustom = 'Please specify your purpose';
    }
    
    // URL format validation (if provided)
    if (
      formData.url &&
      !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.url)
    ) {
      newErrors.url = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    
    if (!validate()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Make API call to create company
      const response = await companyApi.createCompany(formData);
      
      setSuccessMessage('Profile setup complete! Redirecting to your dashboard...');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Onboarding failed:', error);
      setErrorMessage(
        error.response?.data?.message || 
        'Failed to complete your profile setup. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Complete Your Profile | Tez Social</title>
        <meta name="description" content="Complete your profile setup to get started with Tez Social" />
      </Head>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: 3,
          bgcolor: 'background.default',
        }}
      >
        <Card sx={{ maxWidth: 700, width: '100%', boxShadow: 3 }}>
          <CardContent sx={{ padding: 4 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Complete Your Profile
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Tell us a bit about yourself and how you'll be using Tez Social
              </Typography>
            </Box>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMessage}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {successMessage}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="ownerFullName"
                  value={formData.ownerFullName}
                  onChange={handleChange}
                  error={!!errors.ownerFullName}
                  helperText={errors.ownerFullName}
                  disabled={isLoading}
                  required
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  disabled={isLoading}
                  required
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Company Website URL"
                  name="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={handleChange}
                  error={!!errors.url}
                  helperText={errors.url || 'Optional'}
                  disabled={isLoading}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth error={!!errors.teamSize} required>
                  <InputLabel>Team Size</InputLabel>
                  <Select
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleChange}
                    label="Team Size"
                    disabled={isLoading}
                  >
                    {teamSizes.map((size) => (
                      <MenuItem key={size.value} value={size.value}>
                        {size.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.teamSize && <FormHelperText>{errors.teamSize}</FormHelperText>}
                </FormControl>
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth error={!!errors.ownerRole} required>
                  <InputLabel>Your Role</InputLabel>
                  <Select
                    name="ownerRole"
                    value={formData.ownerRole}
                    onChange={handleChange}
                    label="Your Role"
                    disabled={isLoading}
                  >
                    {userRoles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.ownerRole && <FormHelperText>{errors.ownerRole}</FormHelperText>}
                </FormControl>
              </Box>

              {formData.ownerRole === 'Other' && (
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Specify Your Role"
                    name="ownerRoleCustom"
                    value={formData.ownerRoleCustom}
                    onChange={handleChange}
                    error={!!errors.ownerRoleCustom}
                    helperText={errors.ownerRoleCustom}
                    disabled={isLoading}
                    required
                  />
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth error={!!errors.purpose} required>
                  <InputLabel>Primary Purpose</InputLabel>
                  <Select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    label="Primary Purpose"
                    disabled={isLoading}
                  >
                    {purposes.map((purpose) => (
                      <MenuItem key={purpose.value} value={purpose.value}>
                        {purpose.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.purpose && <FormHelperText>{errors.purpose}</FormHelperText>}
                </FormControl>
              </Box>

              {formData.purpose === 'Other' && (
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Specify Your Purpose"
                    name="purposeCustom"
                    value={formData.purposeCustom}
                    onChange={handleChange}
                    error={!!errors.purposeCustom}
                    helperText={errors.purposeCustom}
                    disabled={isLoading}
                    required
                  />
                </Box>
              )}

              <Box sx={{ mt: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={isLoading}
                  sx={{ py: 1.5 }}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Complete Setup'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </>
  );
} 