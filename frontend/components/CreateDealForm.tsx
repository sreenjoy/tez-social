import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Grid,
  Typography,
  SelectChangeEvent
} from '@mui/material';
import { dealApi, pipelineApi } from '../services/api';

interface FormData {
  name: string;
  value: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  stageId: string;
  tags: string[];
}

interface Stage {
  _id: string;
  name: string;
  color?: string;
}

interface Tag {
  _id: string;
  name: string;
  color?: string;
}

interface CreateDealFormProps {
  pipelineId: string;
  onSuccess?: (createdDeal: any) => void;
  onCancel?: () => void;
  initialData?: Partial<FormData>;
  editMode?: boolean;
  dealId?: string;
}

const CreateDealForm: React.FC<CreateDealFormProps> = ({
  pipelineId,
  onSuccess,
  onCancel,
  initialData,
  editMode = false,
  dealId
}) => {
  const router = useRouter();
  
  const [stages, setStages] = useState<Stage[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    value: initialData?.value || '',
    contactName: initialData?.contactName || '',
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
    description: initialData?.description || '',
    stageId: initialData?.stageId || '',
    tags: initialData?.tags || []
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch stages and tags data
  useEffect(() => {
    const fetchData = async () => {
      if (!pipelineId) return;
      
      setIsLoadingData(true);
      try {
        const [stagesData, tagsData] = await Promise.all([
          pipelineApi.getPipelineStages(pipelineId),
          dealApi.getTags()
        ]);
        
        setStages(stagesData);
        setTags(tagsData);
        
        // Set default stage if available and not already set
        if (stagesData && stagesData.length > 0 && !formData.stageId) {
          setFormData(prev => ({ ...prev, stageId: stagesData[0]._id }));
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        setErrorMessage('Failed to load necessary data. Please try again later.');
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchData();
  }, [pipelineId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value
    });
    
    // Clear error when field is edited
    if (errors[name as keyof FormData]) {
      setErrors({
        ...errors,
        [name as string]: undefined
      });
    }
  };

  const handleTagChange = (event: SelectChangeEvent<string[]>) => {
    setFormData({
      ...formData,
      tags: event.target.value as string[]
    });
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Deal name is required';
    }
    
    if (!formData.stageId) {
      newErrors.stageId = 'Please select a stage';
    }
    
    if (formData.value && isNaN(Number(formData.value))) {
      newErrors.value = 'Value must be a number';
    }
    
    if (formData.contactEmail && !/^\S+@\S+\.\S+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Format data for API
      const dealData = {
        ...formData,
        pipelineId,
        value: formData.value ? Number(formData.value) : 0
      };
      
      let result;
      
      if (editMode && dealId) {
        // Update existing deal
        result = await dealApi.updateDeal(dealId, dealData);
      } else {
        // Create new deal
        result = await dealApi.createDeal(dealData);
      }
      
      // Call success handler if provided
      if (onSuccess) {
        onSuccess(result);
      } else {
        // Otherwise redirect to pipeline view
        router.push(`/pipeline/${pipelineId}`);
      }
    } catch (error) {
      console.error('Error saving deal:', error);
      setErrorMessage('Failed to save deal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && (
        <Box sx={{ mb: 3 }}>
          <Typography color="error">{errorMessage}</Typography>
        </Box>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Deal Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Deal Value"
            name="value"
            type="number"
            value={formData.value}
            onChange={handleInputChange}
            error={!!errors.value}
            helperText={errors.value}
            InputProps={{ startAdornment: '$' }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={!!errors.stageId}>
            <InputLabel>Stage</InputLabel>
            <Select
              name="stageId"
              value={formData.stageId}
              onChange={handleInputChange}
              label="Stage"
            >
              {stages.map((stage) => (
                <MenuItem key={stage._id} value={stage._id}>
                  {stage.name}
                </MenuItem>
              ))}
            </Select>
            {errors.stageId && <FormHelperText>{errors.stageId}</FormHelperText>}
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Contact Name"
            name="contactName"
            value={formData.contactName}
            onChange={handleInputChange}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Contact Email"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleInputChange}
            error={!!errors.contactEmail}
            helperText={errors.contactEmail}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Contact Phone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleInputChange}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Additional Information
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={4}
          />
        </Grid>
        
        {tags.length > 0 && (
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Tags</InputLabel>
              <Select
                multiple
                name="tags"
                value={formData.tags}
                onChange={handleTagChange}
                label="Tags"
                renderValue={(selected) => {
                  const selectedTags = tags.filter(tag => 
                    (selected as string[]).includes(tag._id)
                  );
                  return selectedTags.map(tag => tag.name).join(', ');
                }}
              >
                {tags.map((tag) => (
                  <MenuItem key={tag._id} value={tag._id}>
                    {tag.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        
        <Grid item xs={12} mt={2}>
          <Box display="flex" justifyContent="space-between">
            <Button 
              variant="outlined" 
              onClick={onCancel || (() => router.push(`/pipeline/${pipelineId}`))}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : (editMode ? 'Update Deal' : 'Create Deal')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default CreateDealForm; 