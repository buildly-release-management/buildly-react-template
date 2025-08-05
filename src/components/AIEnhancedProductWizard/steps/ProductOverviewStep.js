/**
 * Product Overview Step Component
 * First step in the AI-Enhanced Product Wizard
 */

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, CheckCircle } from '@mui/icons-material';
import AIFormHelper from '@components/AIFormHelper/AIFormHelper';

const ProductOverviewStep = ({ data, setData, classes }) => {
  const handleChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const productTypes = [
    'E-commerce Platform',
    'SaaS Dashboard',
    'Mobile App Backend',
    'Content Management System',
    'Analytics Platform',
    'Social Network',
    'Education Platform',
    'Healthcare System',
    'Financial Services',
    'IoT Platform',
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="primary" textAlign="center">
        Tell us about your product idea
      </Typography>
      
      <Typography variant="body1" textAlign="center" color="textSecondary" mb={4}>
        Let's start with the basics. Our AI will suggest improvements as you go.
      </Typography>

      <Grid container spacing={3}>
        {/* Product Name */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              fullWidth
              label="Product Name"
              variant="outlined"
              value={data.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., My Awesome SaaS Platform"
              size="large"
            />
            <AIFormHelper
              fieldType="product-name"
              onSuggestion={(suggestion) => handleChange('name', suggestion)}
              size="small"
            />
          </Box>
        </Grid>

        {/* Product Type Selection */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            What type of product are you building?
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            {productTypes.map(type => (
              <Chip
                key={type}
                label={type}
                onClick={() => handleChange('type', type)}
                color={data.type === type ? 'primary' : 'default'}
                variant={data.type === type ? 'filled' : 'outlined'}
                clickable
                icon={data.type === type ? <CheckCircle /> : undefined}
              />
            ))}
          </Box>
        </Grid>

        {/* Product Description */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="flex-start" gap={2}>
            <TextField
              fullWidth
              label="Product Description"
              variant="outlined"
              multiline
              rows={4}
              value={data.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what your product does and who it's for..."
            />
            <AIFormHelper
              fieldType="product-description"
              onSuggestion={(suggestion) => handleChange('description', suggestion)}
              size="small"
              context={{ productType: data.type, productName: data.name }}
            />
          </Box>
        </Grid>

        {/* Target Users */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Target Users"
            variant="outlined"
            value={data.targetUsers || ''}
            onChange={(e) => handleChange('targetUsers', e.target.value)}
            placeholder="e.g., Small business owners, Enterprise teams"
          />
        </Grid>

        {/* Industry */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Industry"
            variant="outlined"
            value={data.industry || ''}
            onChange={(e) => handleChange('industry', e.target.value)}
            placeholder="e.g., Healthcare, E-commerce, Education"
          />
        </Grid>
      </Grid>

      {/* Progress Summary */}
      {(data.name || data.type || data.description) && (
        <Card sx={{ mt: 3, background: 'linear-gradient(45deg, #f3f4f6, #e5e7eb)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              📝 Progress Summary
            </Typography>
            <Grid container spacing={2}>
              {data.name && (
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="textSecondary">Product Name</Typography>
                  <Typography variant="body1">{data.name}</Typography>
                </Grid>
              )}
              {data.type && (
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="textSecondary">Type</Typography>
                  <Typography variant="body1">{data.type}</Typography>
                </Grid>
              )}
              {data.targetUsers && (
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="textSecondary">Target Users</Typography>
                  <Typography variant="body1">{data.targetUsers}</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ProductOverviewStep;
