/**
 * Features Step Component
 * Second step in the AI-Enhanced Product Wizard
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle,
  Star as StarIcon,
} from '@mui/icons-material';
import AIFormHelper from '@components/AIFormHelper/AIFormHelper';

const FeaturesStep = ({ data, setData, classes }) => {
  const [newFeature, setNewFeature] = useState('');

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const updatedFeatures = [...(data.features || []), newFeature.trim()];
      setData(prev => ({
        ...prev,
        features: updatedFeatures,
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index) => {
    const updatedFeatures = data.features.filter((_, i) => i !== index);
    setData(prev => ({
      ...prev,
      features: updatedFeatures,
    }));
  };

  const handleAddSuggestedFeature = (feature) => {
    if (!data.features?.includes(feature)) {
      const updatedFeatures = [...(data.features || []), feature];
      setData(prev => ({
        ...prev,
        features: updatedFeatures,
      }));
    }
  };

  // Common features based on product type
  const getFeatureSuggestions = (productType) => {
    const suggestions = {
      'E-commerce Platform': [
        'Product Catalog',
        'Shopping Cart',
        'Payment Processing',
        'Order Management',
        'Inventory Tracking',
        'Customer Reviews',
        'Wishlist',
        'Search & Filters',
        'Mobile App',
        'Admin Dashboard',
      ],
      'SaaS Dashboard': [
        'User Authentication',
        'Data Visualization',
        'API Integration',
        'Reporting System',
        'User Management',
        'Analytics',
        'Real-time Updates',
        'Export Features',
        'Multi-tenant Support',
        'Notification System',
      ],
      'Mobile App Backend': [
        'REST API',
        'User Authentication',
        'Push Notifications',
        'Data Storage',
        'File Upload',
        'Real-time Messaging',
        'Geolocation',
        'Payment Integration',
        'Social Login',
        'Analytics Tracking',
      ],
    };

    return suggestions[productType] || [
      'User Authentication',
      'Dashboard',
      'API Integration',
      'Data Management',
      'Notifications',
      'Search Functionality',
      'User Profiles',
      'Settings',
      'Analytics',
      'Mobile Support',
    ];
  };

  const suggestedFeatures = getFeatureSuggestions(data.type);

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="primary" textAlign="center">
        What features do you need?
      </Typography>
      
      <Typography variant="body1" textAlign="center" color="textSecondary" mb={4}>
        Define the core functionality of your {data.type || 'product'}. 
        Click on suggestions or add your own custom features.
      </Typography>

      <Grid container spacing={3}>
        {/* AI Feature Suggestions */}
        <Grid item xs={12}>
          <Card sx={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white', mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <StarIcon />
                <Typography variant="h6" ml={1}>
                  Recommended Features for {data.type}
                </Typography>
              </Box>
              
              <Typography variant="body2" mb={2} style={{ opacity: 0.9 }}>
                Based on your product type, here are the most essential features:
              </Typography>
              
              <Box display="flex" flexWrap="wrap" gap={1}>
                {suggestedFeatures.map(feature => (
                  <Chip
                    key={feature}
                    label={feature}
                    onClick={() => handleAddSuggestedFeature(feature)}
                    style={{ 
                      color: 'white', 
                      borderColor: 'rgba(255,255,255,0.5)',
                      backgroundColor: data.features?.includes(feature) 
                        ? 'rgba(255,255,255,0.3)' 
                        : 'transparent',
                    }}
                    variant="outlined"
                    icon={data.features?.includes(feature) ? <CheckCircle /> : <AddIcon />}
                    disabled={data.features?.includes(feature)}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Add Custom Feature */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Add Custom Features
          </Typography>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              fullWidth
              label="Custom Feature"
              variant="outlined"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="e.g., Advanced Analytics, Custom Integrations"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
            />
            <AIFormHelper
              fieldType="feature-suggestion"
              onSuggestion={(suggestion) => setNewFeature(suggestion)}
              size="small"
              context={{ 
                productType: data.type,
                existingFeatures: data.features,
                productName: data.name,
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddFeature}
              disabled={!newFeature.trim()}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Box>
        </Grid>

        {/* Selected Features List */}
        {data.features && data.features.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Selected Features ({data.features.length})
            </Typography>
            <Card>
              <List>
                {data.features.map((feature, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={feature}
                      secondary={`Feature ${index + 1}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveFeature(index)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>
        )}

        {/* Feature Categories */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Feature Categories
          </Typography>
          <Grid container spacing={2}>
            {[
              { name: 'Core Features', icon: '🔧', color: '#3b82f6' },
              { name: 'User Experience', icon: '👤', color: '#10b981' },
              { name: 'Integration', icon: '🔌', color: '#f59e0b' },
              { name: 'Analytics', icon: '📊', color: '#8b5cf6' },
              { name: 'Security', icon: '🔒', color: '#ef4444' },
              { name: 'Performance', icon: '⚡', color: '#06b6d4' },
            ].map(category => (
              <Grid item xs={6} sm={4} md={2} key={category.name}>
                <Card 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    '&:hover': { 
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Typography variant="h4" mb={1}>
                    {category.icon}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {category.name}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Progress Summary */}
      {data.features && data.features.length > 0 && (
        <Card sx={{ mt: 3, background: 'linear-gradient(45deg, #f3f4f6, #e5e7eb)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              🎯 Feature Summary
            </Typography>
            <Typography variant="body2" color="textSecondary">
              You've selected {data.features.length} features for your {data.type}
            </Typography>
            <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
              {data.features.slice(0, 5).map((feature, index) => (
                <Chip key={index} label={feature} size="small" />
              ))}
              {data.features.length > 5 && (
                <Chip label={`+${data.features.length - 5} more`} size="small" variant="outlined" />
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default FeaturesStep;
