import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import ProtectedRoute from '../../components/ProtectedRoute';
import { pipelineApi } from '../../services/api';

export default function CreatePipelinePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isDefault: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Pipeline name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!validate()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await pipelineApi.createPipeline(formData);
      
      // Redirect to pipeline view
      router.push(`/pipeline/${response._id}`);
    } catch (error: any) {
      console.error('Failed to create pipeline:', error);
      setErrorMessage(
        error.response?.data?.message || 
        'Failed to create pipeline. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Create Pipeline | Tez Social</title>
        <meta name="description" content="Create a new sales pipeline" />
      </Head>
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create New Pipeline
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Set up a new sales pipeline to organize your deals
          </Typography>
        </Box>
        
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}
        
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Pipeline Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name || 'Enter a name for your pipeline (e.g., "Sales Process")'}
                  disabled={isLoading}
                  required
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  helperText="Optional: Add a description for your pipeline"
                  disabled={isLoading}
                  multiline
                  rows={3}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  }
                  label="Set as default pipeline"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  The default pipeline will be shown first in your dashboard
                </Typography>
              </Box>
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  {isLoading ? 'Creating...' : 'Create Pipeline'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            After creating the pipeline, you'll be able to add and customize stages.
          </Typography>
        </Box>
      </Container>
    </ProtectedRoute>
  );
} 