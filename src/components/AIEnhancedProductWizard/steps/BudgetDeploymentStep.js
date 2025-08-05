/**
 * Budget & Deployment Step Component
 * Final step in the AI-Enhanced Product Wizard
 */

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Avatar,
  Slider,
  Button,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  AttachMoney as BudgetIcon,
  Cloud as CloudIcon,
  Security as SecurityIcon,
  Speed as PerformanceIcon,
  Storage as DatabaseIcon,
  Public as DomainIcon,
  CheckCircle as CheckIcon,
  Timeline as AnalyticsIcon,
} from '@mui/icons-material';

const BudgetDeploymentStep = ({ data, setData, classes, onComplete }) => {
  const handleSimpleChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBudgetRangeChange = (event, newValue) => {
    setData(prev => ({
      ...prev,
      budgetRange: newValue,
    }));
  };

  const getBudgetLabel = (value) => {
    if (value < 10000) return `$${value.toLocaleString()}`;
    if (value < 1000000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${(value / 1000000).toFixed(1)}M`;
  };

  const getEstimatedMonthlyCost = () => {
    const teamSize = Object.values(data.team || {}).reduce((sum, count) => sum + (parseInt(count) || 0), 0);
    const avgSalary = 8000; // Monthly average
    const infrastructureCost = data.deploymentType === 'Cloud' ? 500 : data.deploymentType === 'Hybrid' ? 300 : 100;
    const toolsCost = 200;
    
    return (teamSize * avgSalary) + infrastructureCost + toolsCost;
  };

  const getRecommendedBudget = () => {
    const monthlyCost = getEstimatedMonthlyCost();
    const timelineMonths = data.estimatedDuration?.includes('3-6') ? 4.5 :
                          data.estimatedDuration?.includes('6-9') ? 7.5 :
                          data.estimatedDuration?.includes('9-12') ? 10.5 : 6;
    
    return monthlyCost * timelineMonths;
  };

  const deploymentOptions = [
    {
      type: 'Cloud',
      icon: <CloudIcon />,
      color: '#3b82f6',
      description: 'Scalable, managed infrastructure',
      pros: ['Auto-scaling', 'Managed services', 'Global CDN'],
      cost: 'Medium',
      recommended: true,
    },
    {
      type: 'On-Premise',
      icon: <SecurityIcon />,
      color: '#10b981',
      description: 'Full control over infrastructure',
      pros: ['Data control', 'Custom security', 'No ongoing costs'],
      cost: 'High initial',
      recommended: false,
    },
    {
      type: 'Hybrid',
      icon: <PerformanceIcon />,
      color: '#f59e0b',
      description: 'Best of both worlds',
      pros: ['Flexible', 'Cost optimization', 'Compliance friendly'],
      cost: 'Variable',
      recommended: false,
    },
  ];

  const budgetBreakdown = [
    {
      category: 'Development Team',
      percentage: 70,
      amount: getEstimatedMonthlyCost() * 0.7,
      icon: <BudgetIcon />,
    },
    {
      category: 'Infrastructure',
      percentage: 15,
      amount: getEstimatedMonthlyCost() * 0.15,
      icon: <CloudIcon />,
    },
    {
      category: 'Tools & Licenses',
      percentage: 10,
      amount: getEstimatedMonthlyCost() * 0.1,
      icon: <DatabaseIcon />,
    },
    {
      category: 'Contingency',
      percentage: 5,
      amount: getEstimatedMonthlyCost() * 0.05,
      icon: <SecurityIcon />,
    },
  ];

  const getProjectSummary = () => {
    return {
      productName: data.productName || 'Your Product',
      type: data.productType || 'Web Application',
      features: data.features?.length || 0,
      technologies: data.techStack?.length || 0,
      integrations: data.integrations?.length || 0,
      teamSize: Object.values(data.team || {}).reduce((sum, count) => sum + (parseInt(count) || 0), 0),
      timeline: data.estimatedDuration || '3-6 months',
      estimatedBudget: getBudgetLabel(getRecommendedBudget()),
    };
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="primary" textAlign="center">
        Budget & Deployment Planning
      </Typography>
      
      <Typography variant="body1" textAlign="center" color="textSecondary" mb={4}>
        Let's finalize your project with budget planning and deployment strategy. 
        We'll help you understand the investment required and deployment options.
      </Typography>

      <Grid container spacing={3}>
        {/* Budget Planning */}
        <Grid item xs={12}>
          <Card sx={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white', mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <BudgetIcon />
                <Typography variant="h6" ml={1}>
                  Budget Analysis
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" style={{ opacity: 0.9 }}>
                    Estimated Monthly Cost
                  </Typography>
                  <Typography variant="h5">
                    ${getEstimatedMonthlyCost().toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" style={{ opacity: 0.9 }}>
                    Recommended Total Budget
                  </Typography>
                  <Typography variant="h5">
                    {getBudgetLabel(getRecommendedBudget())}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Budget Range Selector */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Budget Range
              </Typography>
              
              <Box sx={{ px: 2, py: 3 }}>
                <Slider
                  value={data.budgetRange || [50000, 200000]}
                  onChange={handleBudgetRangeChange}
                  valueLabelDisplay="active"
                  valueLabelFormat={getBudgetLabel}
                  min={10000}
                  max={1000000}
                  step={10000}
                  marks={[
                    { value: 10000, label: '$10K' },
                    { value: 100000, label: '$100K' },
                    { value: 500000, label: '$500K' },
                    { value: 1000000, label: '$1M' },
                  ]}
                />
              </Box>
              
              <Typography variant="body2" color="textSecondary" textAlign="center">
                Budget Range: {getBudgetLabel(data.budgetRange?.[0] || 50000)} - {getBudgetLabel(data.budgetRange?.[1] || 200000)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Budget Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Budget Breakdown
              </Typography>
              
              {budgetBreakdown.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: '#f3f4f6', color: '#6b7280', mr: 2, width: 32, height: 32 }}>
                    {item.icon}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight="bold">
                      {item.category} ({item.percentage}%)
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      ${item.amount.toLocaleString()}/month
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Deployment Options */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Deployment Strategy
          </Typography>
          <Grid container spacing={2}>
            {deploymentOptions.map((option) => (
              <Grid item xs={12} md={4} key={option.type}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: data.deploymentType === option.type ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    ...(option.recommended && { borderColor: '#10b981', bgcolor: '#f0fdf4' })
                  }}
                  onClick={() => handleSimpleChange('deploymentType', option.type)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ bgcolor: option.color, mr: 2 }}>
                        {option.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {option.type}
                          {option.recommended && <Chip label="Recommended" size="small" color="success" sx={{ ml: 1 }} />}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Cost: {option.cost}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" mb={2}>
                      {option.description}
                    </Typography>
                    
                    <List dense>
                      {option.pros.map((pro, index) => (
                        <ListItem key={index} sx={{ py: 0, px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckIcon fontSize="small" color="success" />
                          </ListItemIcon>
                          <ListItemText primary={pro} primaryTypographyProps={{ variant: 'caption' }} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Additional Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hosting & Domain
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Hosting Provider</InputLabel>
                    <Select
                      value={data.hostingProvider || ''}
                      onChange={(e) => handleSimpleChange('hostingProvider', e.target.value)}
                      label="Hosting Provider"
                    >
                      <MenuItem value="AWS">Amazon Web Services</MenuItem>
                      <MenuItem value="Azure">Microsoft Azure</MenuItem>
                      <MenuItem value="GCP">Google Cloud Platform</MenuItem>
                      <MenuItem value="DigitalOcean">DigitalOcean</MenuItem>
                      <MenuItem value="Vercel">Vercel</MenuItem>
                      <MenuItem value="Netlify">Netlify</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Domain Name (optional)"
                    placeholder="myproduct.com"
                    value={data.domainName || ''}
                    onChange={(e) => handleSimpleChange('domainName', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>SSL Certificate</InputLabel>
                    <Select
                      value={data.sslCertificate || 'Free'}
                      onChange={(e) => handleSimpleChange('sslCertificate', e.target.value)}
                      label="SSL Certificate"
                    >
                      <MenuItem value="Free">Free (Let's Encrypt)</MenuItem>
                      <MenuItem value="Standard">Standard Certificate</MenuItem>
                      <MenuItem value="Wildcard">Wildcard Certificate</MenuItem>
                      <MenuItem value="EV">Extended Validation</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Analytics & Monitoring */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analytics & Monitoring
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Analytics Platform</InputLabel>
                    <Select
                      value={data.analyticsPllatform || ''}
                      onChange={(e) => handleSimpleChange('analyticsPllatform', e.target.value)}
                      label="Analytics Platform"
                    >
                      <MenuItem value="Google Analytics">Google Analytics</MenuItem>
                      <MenuItem value="Mixpanel">Mixpanel</MenuItem>
                      <MenuItem value="Amplitude">Amplitude</MenuItem>
                      <MenuItem value="Hotjar">Hotjar</MenuItem>
                      <MenuItem value="Custom">Custom Solution</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Error Monitoring</InputLabel>
                    <Select
                      value={data.errorMonitoring || ''}
                      onChange={(e) => handleSimpleChange('errorMonitoring', e.target.value)}
                      label="Error Monitoring"
                    >
                      <MenuItem value="Sentry">Sentry</MenuItem>
                      <MenuItem value="Rollbar">Rollbar</MenuItem>
                      <MenuItem value="Bugsnag">Bugsnag</MenuItem>
                      <MenuItem value="LogRocket">LogRocket</MenuItem>
                      <MenuItem value="Custom">Custom Solution</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Performance Monitoring</InputLabel>
                    <Select
                      value={data.performanceMonitoring || ''}
                      onChange={(e) => handleSimpleChange('performanceMonitoring', e.target.value)}
                      label="Performance Monitoring"
                    >
                      <MenuItem value="New Relic">New Relic</MenuItem>
                      <MenuItem value="DataDog">DataDog</MenuItem>
                      <MenuItem value="Pingdom">Pingdom</MenuItem>
                      <MenuItem value="UptimeRobot">UptimeRobot</MenuItem>
                      <MenuItem value="Custom">Custom Solution</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Project Summary */}
      <Paper sx={{ mt: 4, p: 3, background: 'linear-gradient(45deg, #f8fafc, #e2e8f0)' }}>
        <Typography variant="h5" gutterBottom color="primary" textAlign="center">
          🎉 Project Summary
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {Object.entries(getProjectSummary()).map(([key, value], index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Box textAlign="center">
                <Typography variant="body2" color="textSecondary" textTransform="capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Box textAlign="center">
          <Typography variant="body1" color="textSecondary" mb={2}>
            Ready to bring your vision to life? Your AI-enhanced product roadmap is complete!
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={onComplete}
            sx={{ px: 4, py: 1.5 }}
          >
            Create Product 🚀
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default BudgetDeploymentStep;
