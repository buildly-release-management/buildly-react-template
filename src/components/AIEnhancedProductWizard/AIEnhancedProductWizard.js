/**
 * AI-Enhanced Product Wizard
 * Similar to labs-onboarding.buildly.io but for product creation
 * Features intelligent suggestions, guided experience, and easy editing
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Fade,
  IconButton,
  Chip,
  LinearProgress,
  Avatar,
  // DialogTitle,
  // DialogContent,
  // DialogActions,
  // Dialog,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  AutoAwesome as AIIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  Lightbulb as SuggestionIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateProductMutation } from '@react-query/mutations/product/createProductMutation';
import { useUpdateProductMutation } from '@react-query/mutations/product/updateProductMutation';
import { useHistory } from 'react-router-dom';
import useAlert from '@hooks/useAlert';
import { useContext } from 'react';
import { UserContext } from '@context/User.context';

// Import existing AI helper
import AIFormHelper from '@components/AIFormHelper/AIFormHelper';

// Import wizard steps
import ProductOverviewStep from './steps/ProductOverviewStep';
import FeaturesStep from './steps/FeaturesStep';
import TechnicalStep from './steps/TechnicalStep';
import TeamTimelineStep from './steps/TeamTimelineStep';
import BudgetDeploymentStep from './steps/BudgetDeploymentStep';

const useStyles = makeStyles((theme) => ({
  wizardContainer: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: theme.spacing(2),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
  },
  wizardCard: {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    background: '#fff',
    color: '#111',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  },
  stepContent: {
    minHeight: 400,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background: '#f5f6fa',
    color: '#111',
    borderRadius: theme.spacing(1),
  },
  aiSuggestionCard: {
    background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
    color: '#fff',
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1.5),
    '&, & *': {
      color: '#fff !important',
      textShadow: '0 1px 2px rgba(0,0,0,0.25)',
    },
  },
  suggestionChip: {
    margin: theme.spacing(0.5),
    cursor: 'pointer',
    '&:hover': {
      background: theme.palette.primary.light,
    },
  },
  editSection: {
    background: '#f5f6fa',
    color: '#111',
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      background: theme.palette.primary.light + '20',
      color: '#111',
    },
  },
  completedStep: {
    background: theme.palette.success.light + '20',
    borderColor: theme.palette.success.main,
  },
  aiAvatar: {
    background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
    width: 40,
    height: 40,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: theme.spacing(2),
  },
}));

const AI_SUGGESTIONS = {
  productType: {
    'E-commerce Platform': {
      description: 'Online marketplace for buying and selling products',
      features: ['Product catalog', 'Shopping cart', 'Payment processing', 'Order management'],
      techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      budget: '$50-100k',
      timeline: '4-6 months',
    },
    'SaaS Dashboard': {
      description: 'Business intelligence and analytics platform',
      features: ['Data visualization', 'User management', 'API integration', 'Reporting'],
      techStack: ['React', 'Python', 'PostgreSQL', 'Chart.js'],
      budget: '$75-150k',
      timeline: '6-8 months',
    },
    'Mobile App Backend': {
      description: 'API and backend services for mobile applications',
      features: ['REST API', 'Push notifications', 'User authentication', 'Data storage'],
      techStack: ['Node.js', 'MongoDB', 'AWS', 'Firebase'],
      budget: '$40-80k',
      timeline: '3-5 months',
    },
  },
};

const WIZARD_STEPS = [
  {
    id: 'overview',
    title: 'Product Overview',
    description: 'Tell us about your product idea',
    aiPrompt: 'Let me help you define your product...',
  },
  {
    id: 'features',
    title: 'Features & Functionality',
    description: 'What should your product do?',
    aiPrompt: 'Based on your product type, here are some suggested features...',
  },
  {
    id: 'technical',
    title: 'Technical Details',
    description: 'Technology stack and integrations',
    aiPrompt: 'I recommend these technologies for your project...',
  },
  {
    id: 'team',
    title: 'Team & Timeline',
    description: 'Resources and project timeline',
    aiPrompt: 'Let me suggest an optimal team structure...',
  },
  {
    id: 'budget',
    title: 'Budget & Deployment',
    description: 'Budget estimates and hosting preferences',
    aiPrompt: 'Here\'s a realistic budget breakdown...',
  },
];

const AIEnhancedProductWizard = ({ open, onClose, editData = null, onSave }) => {
  const classes = useStyles();
  const history = useHistory();
  const { displayAlert } = useAlert();
  const { organization } = useContext(UserContext);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    type: '',
    features: [],
    techStack: [],
    team: {},
    budget: '',
    timeline: '',
    integrations: [],
  });
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Product creation mutation
  const createProductMutation = useCreateProductMutation(
    organization?.organization_uuid,
    history,
    '/dashboard',
    () => {}, // clearProductFormData callback
    displayAlert
  );

  // Product update mutation
  const updateProductMutation = useUpdateProductMutation(
    organization?.organization_uuid,
    history,
    '/dashboard',
    () => {}, // clearProductFormData callback
    displayAlert
  );

  // Initialize with edit data if provided
  useEffect(() => {
    if (editData) {
      setProductData(editData);
      setEditMode(true);
    }
  }, [editData]);

  // Generate AI suggestions based on current data
  const generateAISuggestions = async (step, currentData) => {
    setIsGeneratingAI(true);
    try {
      // Simulate AI API call - replace with actual AI service
      await new Promise((resolve, reject) => {
        // Simulate 10% chance of failure
        setTimeout(() => (Math.random() < 0.1 ? reject(new Error('AI service unavailable')) : resolve()), 1500);
      });
      let suggestions = [];
      switch (step) {
      case 0: // Overview
        suggestions = Object.keys(AI_SUGGESTIONS.productType).map(type => ({
          type: 'productType',
          value: type,
          description: AI_SUGGESTIONS.productType[type].description,
          confidence: 0.85,
        }));
        break;
        
      case 1: // Features
        if (currentData.type && AI_SUGGESTIONS.productType[currentData.type]) {
          suggestions = AI_SUGGESTIONS.productType[currentData.type].features.map(feature => ({
            type: 'feature',
            value: feature,
            description: `Essential ${feature.toLowerCase()} functionality`,
            confidence: 0.9,
          }));
        }
        break;
        
      case 2: // Technical
        if (currentData.type && AI_SUGGESTIONS.productType[currentData.type]) {
          suggestions = AI_SUGGESTIONS.productType[currentData.type].techStack.map(tech => ({
            type: 'technology',
            value: tech,
            description: `Recommended for ${currentData.type.toLowerCase()}`,
            confidence: 0.88,
          }));
        }
        break;
        
      case 3: // Team
        suggestions = [
          { type: 'timeline', value: '4-6 months', description: 'Realistic timeline for MVP', confidence: 0.85 },
          { type: 'team', value: 'Agile team of 4-6', description: '2 developers, 1 designer, 1 PM', confidence: 0.9 },
        ];
        break;
        
      case 4: // Budget
        if (currentData.type && AI_SUGGESTIONS.productType[currentData.type]) {
          suggestions = [
            {
              type: 'budget',
              value: AI_SUGGESTIONS.productType[currentData.type].budget,
              description: 'Estimated development cost',
              confidence: 0.82,
            },
          ];
        }
        break;
    }
    
      setAiSuggestions(suggestions);
      setIsGeneratingAI(false);
    } catch (err) {
      setIsGeneratingAI(false);
      displayAlert('error', 'Failed to fetch AI suggestions. Please try again.');
    }
  };

  // Apply AI suggestion
  const applySuggestion = (suggestion) => {
    const newData = { ...productData };
    
    switch (suggestion.type) {
      case 'productType':
        newData.type = suggestion.value;
        newData.description = suggestion.description;
        break;
      case 'feature':
        if (!newData.features.includes(suggestion.value)) {
          newData.features.push(suggestion.value);
        }
        break;
      case 'technology':
        if (!newData.techStack.includes(suggestion.value)) {
          newData.techStack.push(suggestion.value);
        }
        break;
      case 'budget':
        newData.budget = suggestion.value;
        break;
      case 'timeline':
        newData.timeline = suggestion.value;
        break;
    }
    
    setProductData(newData);
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      generateAISuggestions(currentStep + 1, productData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex) => {
    setCurrentStep(stepIndex);
    generateAISuggestions(stepIndex, productData);
  };

  const handleSave = () => {
    onSave(productData);
    onClose();
  };

  const handleWizardComplete = async (data) => {
    try {
      // Validate required fields
      if (!data.productName && !data.name) {
        displayAlert('error', 'Product name is required');
        return;
      }

      if (!organization?.organization_uuid) {
        displayAlert('error', 'Organization information is missing. Please refresh and try again.');
        return;
      }

      // Transform wizard data to API format
      const productPayload = {
        name: data.productName || data.name,
        description: data.description || '',
        product_type: data.productType || data.type,
        target_users: data.targetUsers,
        features: data.features?.join(', ') || '',
        tech_stack: data.techStack?.join(', ') || '',
        integrations: data.integrations?.join(', ') || '',
        team_size: Object.values(data.team || {}).reduce((sum, count) => sum + (parseInt(count) || 0), 0),
        estimated_timeline: data.estimatedDuration,
        development_methodology: data.methodology,
        team_location: data.teamLocation,
        budget_range: data.budgetRange ? `${data.budgetRange[0]}-${data.budgetRange[1]}` : '',
        deployment_type: data.deploymentType,
        hosting_provider: data.hostingProvider,
        domain_name: data.domainName,
        analytics_platform: data.analyticsPllatform,
        error_monitoring: data.errorMonitoring,
        performance_monitoring: data.performanceMonitoring,
        // Add organization_uuid as required by the API
        organization_uuid: organization.organization_uuid,
      };

      // Add product_uuid for updates
      if (editMode && editData?.product_uuid) {
        productPayload.product_uuid = editData.product_uuid;
      }

      console.log('AIEnhancedProductWizard: Processing product with payload:', productPayload);
      
      if (editMode) {
        await updateProductMutation.mutateAsync(productPayload);
      } else {
        await createProductMutation.mutateAsync(productPayload);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save product:', error);
      // Error will be handled by the mutation's onError callback
    }
  };

  // Generate initial suggestions
  useEffect(() => {
    if (open) {
      generateAISuggestions(currentStep, productData);
    }
  }, [open, currentStep]);

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  // Helper function to render step content (moved above return for scope)
  const renderStepContent = (step, data, setData, classes) => {
    switch (step) {
      case 0:
        return <ProductOverviewStep data={data} setData={setData} classes={classes} />;
      case 1:
        return <FeaturesStep data={data} setData={setData} classes={classes} />;
      case 2:
        return <TechnicalStep data={data} setData={setData} classes={classes} />;
      case 3:
        return <TeamTimelineStep data={data} setData={setData} classes={classes} />;
      case 4:
        return (
          <BudgetDeploymentStep 
            data={data} 
            setData={setData} 
            classes={classes} 
            onComplete={handleWizardComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box className={classes.wizardContainer}>
      {/* Header */}
      <Card className={classes.wizardCard}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              <Avatar className={classes.aiAvatar}>
                <AIIcon />
                </Avatar>
                <Box ml={2}>
                  <Typography variant="h5" fontWeight="bold">
                    {editMode ? 'Edit Product' : 'AI-Guided Product Wizard'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Let AI help you create the perfect product setup
                  </Typography>
                </Box>
              </Box>
              <Box textAlign="right">
                <Typography variant="body2" color="textSecondary">
                  Step {currentStep + 1} of {WIZARD_STEPS.length}
                </Typography>
                <Typography variant="h6" color="primary">
                  {Math.round(progress)}% Complete
                </Typography>
              </Box>
            </Box>
            
            <LinearProgress
              variant="determinate"
              value={progress}
              className={classes.progressBar}
            />
            
            {/* Stepper */}
            <Stepper activeStep={currentStep} alternativeLabel>
              {WIZARD_STEPS.map((step, index) => (
                <Step key={step.id} completed={index < currentStep}>
                  <StepLabel
                    onClick={() => handleStepClick(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    {step.title}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* AI Suggestions Panel */}
        {aiSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={classes.aiSuggestionCard}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <SuggestionIcon />
                  <Typography variant="h6" ml={1}>
                    AI Suggestions
                  </Typography>
                  {isGeneratingAI && (
                    <Box ml={2}>
                      <LinearProgress size={20} />
                    </Box>
                  )}
                </Box>
                
                <Typography variant="body2" mb={2} style={{ opacity: 0.9 }}>
                  {WIZARD_STEPS[currentStep].aiPrompt}
                </Typography>
                
                <Box>
                  {aiSuggestions.map((suggestion, index) => (
                    <Chip
                      key={index}
                      label={suggestion.value}
                      className={classes.suggestionChip}
                      onClick={() => applySuggestion(suggestion)}
                      icon={<AIIcon />}
                      variant="outlined"
                      style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step Content */}
        <Card className={classes.wizardCard}>
          <CardContent className={classes.stepContent}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent(currentStep, productData, setProductData, classes)}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className={classes.wizardCard}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button
                startIcon={<BackIcon />}
                onClick={handleBack}
                disabled={currentStep === 0}
                variant="outlined"
                style={{ minWidth: 120, fontWeight: 600 }}
              >
                Previous
              </Button>
              <Box>
                {currentStep === WIZARD_STEPS.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleWizardComplete(productData)}
                    size="large"
                    startIcon={<CheckIcon />}
                    style={{ minWidth: 180, fontWeight: 700, fontSize: '1.1rem' }}
                    disabled={createProductMutation.isLoading || updateProductMutation.isLoading}
                  >
                    {(createProductMutation.isLoading || updateProductMutation.isLoading)
                      ? 'Saving...' 
                      : (editMode ? 'Update Product' : 'Create Product')
                    }
                  </Button>
                ) : (
                  <Button
                    endIcon={<NextIcon />}
                    onClick={handleNext}
                    variant="contained"
                    color="primary"
                    size="large"
                    style={{ minWidth: 180, fontWeight: 700, fontSize: '1.1rem' }}
                  >
                    Continue
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
  );
};


  // Helper function to render step content (moved inside component for scope)
  const renderStepContent = (step, data, setData, classes) => {
    switch (step) {
      case 0:
        return <ProductOverviewStep data={data} setData={setData} classes={classes} />;
      case 1:
        return <FeaturesStep data={data} setData={setData} classes={classes} />;
      case 2:
        return <TechnicalStep data={data} setData={setData} classes={classes} />;
      case 3:
        return <TeamTimelineStep data={data} setData={setData} classes={classes} />;
      case 4:
        return (
          <BudgetDeploymentStep 
            data={data} 
            setData={setData} 
            classes={classes} 
            onComplete={handleWizardComplete}
          />
        );
      default:
        return null;
    }
  };

export default AIEnhancedProductWizard;
