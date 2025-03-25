import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Typography,
  Button,
  Container,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import ProtectedRoute from '../../components/ProtectedRoute';
import { pipelineApi } from '../../services/api';

export default function PipelineDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [pipeline, setPipeline] = useState<any>(null);
  const [stages, setStages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // For stage menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  
  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchPipelineData(id);
    }
  }, [id]);
  
  const fetchPipelineData = async (pipelineId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch pipeline details and stages in parallel
      const [pipelineResponse, stagesResponse] = await Promise.all([
        pipelineApi.getPipelineById(pipelineId),
        pipelineApi.getPipelineStages(pipelineId),
      ]);
      
      setPipeline(pipelineResponse);
      setStages(stagesResponse);
    } catch (err: any) {
      console.error('Failed to fetch pipeline data:', err);
      setError(err.response?.data?.message || 'Failed to load pipeline data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStageMenuOpen = (event: React.MouseEvent<HTMLElement>, stageId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedStageId(stageId);
  };
  
  const handleStageMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedStageId(null);
  };
  
  const handleEditStage = () => {
    handleStageMenuClose();
    // Implement edit stage functionality
  };
  
  const handleDeleteStage = () => {
    handleStageMenuClose();
    // Implement delete stage functionality
  };
  
  const handleAddStage = () => {
    // Implement add stage functionality
    router.push(`/pipeline/${id}/stage/create`);
  };
  
  if (isLoading) {
    return (
      <ProtectedRoute>
        <Container maxWidth="xl" sx={{ py: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </ProtectedRoute>
    );
  }
  
  return (
    <ProtectedRoute>
      <Head>
        <title>{pipeline?.name || 'Pipeline'} | Tez Social</title>
        <meta name="description" content="View and manage your sales pipeline" />
      </Head>
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : (
          <>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {pipeline?.name || 'Pipeline'}
                </Typography>
                {pipeline?.description && (
                  <Typography variant="body1" color="text.secondary">
                    {pipeline.description}
                  </Typography>
                )}
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddStage}
              >
                Add Stage
              </Button>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Pipeline Stages
              </Typography>
              
              {stages.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No stages found in this pipeline. Add your first stage to get started.
                </Alert>
              ) : (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {stages.map((stage) => (
                    <Grid item xs={12} sm={6} md={4} lg={2} key={stage._id}>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          height: '100%',
                          minHeight: 200,
                          display: 'flex',
                          flexDirection: 'column',
                          borderTop: `4px solid ${stage.color || '#6C7A89'}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {stage.name}
                          </Typography>
                          
                          <IconButton 
                            size="small" 
                            onClick={(e: React.MouseEvent<HTMLElement>) => handleStageMenuOpen(e, stage._id)}
                            aria-label="stage options"
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body2" color="text.secondary" align="center">
                            No deals yet
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
              
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleStageMenuClose}
              >
                <MenuItem onClick={handleEditStage}>
                  <EditIcon fontSize="small" sx={{ mr: 1 }} />
                  Edit Stage
                </MenuItem>
                <MenuItem onClick={handleDeleteStage}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  Delete Stage
                </MenuItem>
              </Menu>
            </Box>
          </>
        )}
      </Container>
    </ProtectedRoute>
  );
} 