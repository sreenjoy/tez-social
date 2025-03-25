import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import DashboardLayout from '../../../../components/DashboardLayout';
import CreateDealForm from '../../../../components/CreateDealForm';
import { pipelineApi } from '../../../../services/api';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { useState, useEffect } from 'react';

const CreateDealPage = () => {
  const router = useRouter();
  const { id: pipelineId } = router.query;
  
  const [pipeline, setPipeline] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch pipeline data
  useEffect(() => {
    const fetchPipeline = async () => {
      if (!pipelineId) return;
      
      setIsLoading(true);
      try {
        const pipelineData = await pipelineApi.getPipelineById(pipelineId as string);
        setPipeline(pipelineData);
      } catch (error) {
        console.error('Error fetching pipeline:', error);
        setError('Failed to load pipeline data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPipeline();
  }, [pipelineId]);
  
  if (!pipelineId) {
    return null; // Wait for router to be ready
  }
  
  return (
    <ProtectedRoute>
      <Head>
        <title>Create Deal | Tez Social</title>
      </Head>
      <DashboardLayout title="Create Deal">
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        ) : (
          <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 3 }}>
            <Typography variant="h4" gutterBottom>
              Create New Deal
            </Typography>
            
            {pipeline && (
              <Typography variant="subtitle1" color="text.secondary" mb={4}>
                Pipeline: {pipeline.name}
              </Typography>
            )}
            
            <CreateDealForm pipelineId={pipelineId as string} />
          </Paper>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default CreateDealPage; 