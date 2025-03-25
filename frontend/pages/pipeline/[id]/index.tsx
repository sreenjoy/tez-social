import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress, 
  Alert,
  Paper,
  Chip,
  Divider,
  IconButton,
  Stack
} from '@mui/material';
import { Add as AddIcon, More as MoreIcon } from '@mui/icons-material';
import DashboardLayout from '../../../components/DashboardLayout';
import { pipelineApi, dealApi } from '../../../services/api';
import { Stage } from '../../../types/stage';

interface Pipeline {
  _id: string;
  name: string;
  description?: string;
}

interface Deal {
  _id: string;
  name: string;
  value: number;
  contactName?: string;
}

const PipelineDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [deals, setDeals] = useState<Record<string, Deal[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch pipeline data and stages
  useEffect(() => {
    const fetchPipelineData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Fetch pipeline and stages in parallel
        const [pipelineData, stagesData]: [Pipeline, Stage[]] = await Promise.all([
          pipelineApi.getPipelineById(id as string),
          pipelineApi.getPipelineStages(id as string)
        ]);
        
        setPipeline(pipelineData);
        setStages(stagesData);
        
        // Fetch deals for each stage
        const dealsPromises: Promise<{ stageId: string; deals: Deal[] }>[] = stagesData.map(stage => 
          dealApi.getDealsByStage(stage._id)
            .then((stageDeals: Deal[]) => ({ stageId: stage._id, deals: stageDeals }))
        );
        
        const allDealsData = await Promise.all(dealsPromises);
        
        // Organize deals by stage ID
        const dealsMap: Record<string, Deal[]> = {};
        allDealsData.forEach(({ stageId, deals }) => {
          dealsMap[stageId] = deals;
        });
        
        setDeals(dealsMap);
      } catch (error) {
        console.error('Error loading pipeline data:', error);
        setError('Failed to load pipeline data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPipelineData();
  }, [id]);
  
  const handleCreateDeal = () => {
    router.push(`/pipeline/${id}/deal/create`);
  };
  
  const handleDealClick = (dealId: string) => {
    router.push(`/pipeline/${id}/deal/${dealId}`);
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout>
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </DashboardLayout>
    );
  }

  if (!pipeline) {
    return (
      <DashboardLayout>
        <Alert severity="info" sx={{ mt: 3 }}>
          Pipeline not found or you don't have access to it.
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {pipeline.name}
            </Typography>
            {pipeline.description && (
              <Typography variant="body1" color="text.secondary">
                {pipeline.description}
              </Typography>
            )}
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateDeal}
          >
            Add Deal
          </Button>
        </Box>

        <Grid container spacing={3}>
          {stages.map(stage => (
            <Grid item xs={12} md={6} lg={4} key={stage._id}>
              <Paper 
                elevation={1} 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: stage.color || '#f5f5f5'
                  }}
                >
                  <Typography variant="h6">
                    {stage.name}
                  </Typography>
                  <Chip 
                    label={deals[stage._id]?.length || 0} 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.7)', 
                      fontWeight: 'bold' 
                    }} 
                  />
                </Box>
                <Divider />
                <Box sx={{ p: 1, flexGrow: 1, overflowY: 'auto', maxHeight: '400px' }}>
                  {!deals[stage._id] || deals[stage._id].length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No deals in this stage
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1} sx={{ p: 1 }}>
                      {deals[stage._id].map(deal => (
                        <Card 
                          key={deal._id} 
                          variant="outlined"
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { boxShadow: 1 }
                          }}
                          onClick={() => handleDealClick(deal._id)}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="subtitle1" noWrap sx={{ maxWidth: '180px' }}>
                                  {deal.name}
                                </Typography>
                                {deal.value > 0 && (
                                  <Typography variant="body2" color="text.secondary">
                                    ${deal.value.toLocaleString()}
                                  </Typography>
                                )}
                              </Box>
                              <IconButton size="small">
                                <MoreIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            {deal.contactName && (
                              <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 1 }}>
                                {deal.contactName}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default PipelineDetailPage; 