import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { pipelineApi, companyApi } from '../../services/api';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function PipelineListPage() {
  const router = useRouter();
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [newPipelineDescription, setNewPipelineDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch company information
        const companyData = await companyApi.getCurrentCompany();
        setCompany(companyData);
        
        // Fetch pipelines
        const pipelinesData = await pipelineApi.getPipelines();
        setPipelines(pipelinesData);
      } catch (error) {
        console.error('Error fetching pipeline data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleCreatePipeline = async () => {
    if (!newPipelineName.trim()) {
      return;
    }
    
    setIsCreating(true);
    
    try {
      const newPipeline = await pipelineApi.createPipeline({
        name: newPipelineName.trim(),
        description: newPipelineDescription.trim() || undefined
      });
      
      setPipelines([...pipelines, newPipeline]);
      setIsCreateDialogOpen(false);
      setNewPipelineName('');
      setNewPipelineDescription('');
      
      // Redirect to the new pipeline
      router.push(`/pipeline/${newPipeline._id}`);
    } catch (error) {
      console.error('Error creating pipeline:', error);
      setError('Failed to create pipeline. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePipelineClick = (pipelineId: string) => {
    router.push(`/pipeline/${pipelineId}`);
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Pipelines | Tez Social</title>
      </Head>
      <DashboardLayout title="Pipelines">
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h5">
                {company?.name ? `${company.name} Pipelines` : 'Your Pipelines'}
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Create Pipeline
              </Button>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {pipelines.length === 0 ? (
              <Card variant="outlined" sx={{ mt: 2, p: 3, textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="body1" color="text.secondary">
                    You don't have any pipelines yet. Create your first pipeline to get started.
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    Create Pipeline
                  </Button>
                </CardActions>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {pipelines.map(pipeline => (
                  <Grid item xs={12} sm={6} md={4} key={pipeline._id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': { boxShadow: 2 }
                      }}
                      onClick={() => handlePipelineClick(pipeline._id)}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {pipeline.name}
                        </Typography>
                        {pipeline.description && (
                          <Typography variant="body2" color="text.secondary">
                            {pipeline.description}
                          </Typography>
                        )}
                        {pipeline.isDefault && (
                          <Box 
                            sx={{ 
                              display: 'inline-block',
                              px: 1,
                              py: 0.5,
                              mt: 1,
                              bgcolor: 'primary.main',
                              color: 'white',
                              borderRadius: 1,
                              fontSize: '0.75rem',
                            }}
                          >
                            Default
                          </Box>
                        )}
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end' }}>
                        <Button size="small" color="primary">
                          View Pipeline
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            
            {/* Create Pipeline Dialog */}
            <Dialog 
              open={isCreateDialogOpen} 
              onClose={() => !isCreating && setIsCreateDialogOpen(false)}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>Create New Pipeline</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Pipeline Name"
                  fullWidth
                  variant="outlined"
                  value={newPipelineName}
                  onChange={(e) => setNewPipelineName(e.target.value)}
                  required
                  sx={{ mb: 2, mt: 1 }}
                />
                <TextField
                  margin="dense"
                  label="Description (Optional)"
                  fullWidth
                  variant="outlined"
                  value={newPipelineDescription}
                  onChange={(e) => setNewPipelineDescription(e.target.value)}
                  multiline
                  rows={3}
                />
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={() => setIsCreateDialogOpen(false)} 
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePipeline} 
                  variant="contained" 
                  disabled={!newPipelineName.trim() || isCreating}
                >
                  {isCreating ? <CircularProgress size={24} /> : 'Create'}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
} 