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
  Alert,
  CircularProgress,
  Container,
  InputLabel,
  FormControl,
  Input,
} from '@mui/material';
import { ChromePicker } from 'react-color';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { pipelineApi } from '../../../../services/api';

export default function CreateStagePage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [pipeline, setPipeline] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3498db',
    order: 0, // Will be calculated based on existing stages
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPipeline, setIsLoadingPipeline] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  
  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchPipelineData(id);
    }
  }, [id]);
  
  const fetchPipelineData = async (pipelineId: string) => {
    try {
      setIsLoadingPipeline(true);
      
      // Get pipeline and stages
      const [pipelineData, stagesData] = await Promise.all([
        pipelineApi.getPipelineById(pipelineId),
        pipelineApi.getPipelineStages(pipelineId),
      ]);
      
      setPipeline(pipelineData);
      
      // Set the order to be after the last stage
      if (stagesData && stagesData.length > 0) {
        const maxOrder = Math.max(...stagesData.map((stage: any) => stage.order || 0));
        setFormData(prev => ({
          ...prev,
          order: maxOrder + 1,
        }));
      }
    } catch (error: any) {
      console.error('Failed to fetch pipeline data:', error);
      setErrorMessage(
        error.response?.data?.message || 
        'Failed to load pipeline data. Please try again.'
      );
    } finally {
      setIsLoadingPipeline(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  const handleColorChange = (color: any) => {
    setFormData({
      ...formData,
      color: color.hex,
    });
  };
  
  const toggleColorPicker = () => {
    setColorPickerOpen(!colorPickerOpen);
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Stage name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!validate() || !id || typeof id !== 'string') {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await pipelineApi.createStage(id, formData);
      
      // Redirect back to pipeline view
      router.push(`/pipeline/${id}`);
    } catch (error: any) {
      console.error('Failed to create stage:', error);
      setErrorMessage(
        error.response?.data?.message || 
        'Failed to create stage. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <Head>
        <title>Add Pipeline Stage | Tez Social</title>
        <meta name="description" content="Add a new stage to your sales pipeline" />
      </Head>
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Add New Stage
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isLoadingPipeline 
              ? 'Loading pipeline...' 
              : `Pipeline: ${pipeline?.name || 'Unknown'}`}
          </Typography>
        </Box>
        
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}
        
        {isLoadingPipeline ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Stage Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name || 'Enter a name for this stage (e.g., "Lead", "Proposal")'}
                    disabled={isLoading}
                    required
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <InputLabel>Stage Color</InputLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1,
                        backgroundColor: formData.color,
                        cursor: 'pointer',
                        border: '1px solid #e0e0e0',
                        mr: 2,
                      }}
                      onClick={toggleColorPicker}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={toggleColorPicker}
                      disabled={isLoading}
                    >
                      {colorPickerOpen ? 'Close' : 'Change Color'}
                    </Button>
                  </Box>
                  
                  {colorPickerOpen && (
                    <Box sx={{ mt: 2, position: 'relative', zIndex: 1 }}>
                      <Box
                        sx={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: colorPickerOpen ? 'block' : 'none',
                        }}
                        onClick={toggleColorPicker}
                      />
                      <Box sx={{ position: 'relative' }}>
                        <ChromePicker
                          color={formData.color}
                          onChange={handleColorChange}
                          disableAlpha
                        />
                      </Box>
                    </Box>
                  )}
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
                    {isLoading ? 'Creating...' : 'Add Stage'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        )}
      </Container>
    </ProtectedRoute>
  );
} 