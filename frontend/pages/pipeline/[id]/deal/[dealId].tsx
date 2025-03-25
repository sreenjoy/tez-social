import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  CircularProgress, 
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import DashboardLayout from '../../../../components/DashboardLayout';
import { dealApi, pipelineApi } from '../../../../services/api';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import CreateDealForm from '../../../../components/CreateDealForm';

const DealDetailPage = () => {
  const router = useRouter();
  const { id: pipelineId, dealId } = router.query;
  
  const [deal, setDeal] = useState<any>(null);
  const [pipeline, setPipeline] = useState<any>(null);
  const [stages, setStages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [changeStageDialogOpen, setChangeStageDialogOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch deal, pipeline, and stages data
  useEffect(() => {
    const fetchData = async () => {
      if (!pipelineId || !dealId) return;
      
      setIsLoading(true);
      try {
        const [dealData, pipelineData, stagesData] = await Promise.all([
          dealApi.getDealById(dealId as string),
          pipelineApi.getPipelineById(pipelineId as string),
          pipelineApi.getPipelineStages(pipelineId as string)
        ]);
        
        setDeal(dealData);
        setPipeline(pipelineData);
        setStages(stagesData);
        setSelectedStageId(dealData.stageId);
      } catch (error) {
        console.error('Error fetching deal data:', error);
        setError('Failed to load deal data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [pipelineId, dealId]);
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  
  const handleDealUpdate = (updatedDeal: any) => {
    setDeal(updatedDeal);
    setIsEditing(false);
  };
  
  const handleChangeStage = async () => {
    if (!selectedStageId || selectedStageId === deal.stageId) {
      setChangeStageDialogOpen(false);
      return;
    }
    
    setIsSaving(true);
    try {
      const updatedDeal = await dealApi.moveDealToStage(dealId as string, selectedStageId);
      setDeal(updatedDeal);
      setChangeStageDialogOpen(false);
    } catch (error) {
      console.error('Error moving deal:', error);
      setError('Failed to change deal stage. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteDeal = async () => {
    setIsSaving(true);
    try {
      await dealApi.deleteDeal(dealId as string);
      router.push(`/pipeline/${pipelineId}`);
    } catch (error) {
      console.error('Error deleting deal:', error);
      setError('Failed to delete deal. Please try again.');
      setIsSaving(false);
      setDeleteDialogOpen(false);
    }
  };
  
  const getStageNameById = (stageId: string) => {
    const stage = stages.find(s => s._id === stageId);
    return stage ? stage.name : 'Unknown Stage';
  };
  
  if (!pipelineId || !dealId) {
    return null; // Wait for router to be ready
  }
  
  if (isLoading) {
    return (
      <ProtectedRoute>
        <Head>
          <title>Deal Details | Tez Social</title>
        </Head>
        <DashboardLayout title="Deal Details">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
            <CircularProgress />
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }
  
  if (error) {
    return (
      <ProtectedRoute>
        <Head>
          <title>Deal Details | Tez Social</title>
        </Head>
        <DashboardLayout title="Deal Details">
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!deal || !pipeline) {
    return (
      <ProtectedRoute>
        <Head>
          <title>Deal Details | Tez Social</title>
        </Head>
        <DashboardLayout title="Deal Details">
          <Alert severity="info" sx={{ mt: 3 }}>
            Deal not found or you don't have access to it.
          </Alert>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>{deal.name} | Tez Social</title>
      </Head>
      <DashboardLayout title={isEditing ? 'Edit Deal' : deal.name}>
        <Paper sx={{ p: 4 }}>
          {isEditing ? (
            <CreateDealForm 
              pipelineId={pipelineId as string}
              dealId={dealId as string}
              initialData={deal}
              editMode={true}
              onCancel={() => setIsEditing(false)}
              onSuccess={handleDealUpdate}
            />
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Pipeline: {pipeline.name} | Stage: {getStageNameById(deal.stageId)}
                </Typography>
                <Box>
                  <Button 
                    variant="outlined" 
                    color="secondary"
                    onClick={() => setChangeStageDialogOpen(true)}
                    sx={{ mr: 1 }}
                  >
                    Change Stage
                  </Button>
                  <IconButton 
                    color="primary" 
                    onClick={handleEditToggle}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 4 }} />
              
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" gutterBottom>
                    Deal Information
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Deal Value
                    </Typography>
                    <Typography variant="body1">
                      {deal.value ? `$${deal.value.toLocaleString()}` : 'Not specified'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {deal.description || 'No description provided'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Contact Name
                    </Typography>
                    <Typography variant="body1">
                      {deal.contactName || 'Not specified'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Contact Email
                    </Typography>
                    <Typography variant="body1">
                      {deal.contactEmail || 'Not specified'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Contact Phone
                    </Typography>
                    <Typography variant="body1">
                      {deal.contactPhone || 'Not specified'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </>
          )}
        </Paper>
        
        {/* Change Stage Dialog */}
        <Dialog open={changeStageDialogOpen} onClose={() => setChangeStageDialogOpen(false)}>
          <DialogTitle>Change Deal Stage</DialogTitle>
          <DialogContent>
            <Box sx={{ minWidth: 300, mt: 2 }}>
              {stages.map((stage) => (
                <Button
                  key={stage._id}
                  variant={selectedStageId === stage._id ? "contained" : "outlined"}
                  sx={{ 
                    m: 0.5, 
                    bgcolor: selectedStageId === stage._id ? 'primary.main' : 'transparent',
                    borderColor: stage.color || 'primary.main',
                    color: selectedStageId === stage._id ? 'white' : (stage.color || 'primary.main'),
                    '&:hover': {
                      bgcolor: selectedStageId === stage._id ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                  onClick={() => setSelectedStageId(stage._id)}
                >
                  {stage.name}
                </Button>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setChangeStageDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleChangeStage} 
              variant="contained" 
              color="primary"
              disabled={isSaving || selectedStageId === deal.stageId}
            >
              {isSaving ? <CircularProgress size={24} /> : 'Move Deal'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Deal</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{deal.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteDeal} 
              variant="contained" 
              color="error"
              disabled={isSaving}
            >
              {isSaving ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DealDetailPage; 