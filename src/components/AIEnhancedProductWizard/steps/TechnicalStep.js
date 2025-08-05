/**
 * Technical Step Component
 * Third step in the AI-Enhanced Product Wizard
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
} from '@mui/material';
import {
  Code as CodeIcon,
  Storage as DatabaseIcon,
  Cloud as CloudIcon,
  Integration as IntegrationIcon,
} from '@mui/icons-material';

const TechnicalStep = ({ data, setData, classes }) => {
  const handleTechStackChange = (technology) => {
    const currentTech = data.techStack || [];
    const isSelected = currentTech.includes(technology);
    
    const updatedTechStack = isSelected
      ? currentTech.filter(tech => tech !== technology)
      : [...currentTech, technology];
    
    setData(prev => ({
      ...prev,
      techStack: updatedTechStack,
    }));
  };

  const handleIntegrationChange = (integration) => {
    const currentIntegrations = data.integrations || [];
    const isSelected = currentIntegrations.includes(integration);
    
    const updatedIntegrations = isSelected
      ? currentIntegrations.filter(int => int !== integration)
      : [...currentIntegrations, integration];
    
    setData(prev => ({
      ...prev,
      integrations: updatedIntegrations,
    }));
  };

  const handleSimpleChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const techCategories = {
    'Frontend': {
      icon: '🎨',
      color: '#3b82f6',
      options: ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Flutter', 'React Native'],
    },
    'Backend': {
      icon: '⚙️',
      color: '#10b981',
      options: ['Node.js', 'Python', 'Java', 'C#', 'Go', 'Ruby', 'PHP'],
    },
    'Database': {
      icon: '🗄️',
      color: '#f59e0b',
      options: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Firebase', 'DynamoDB'],
    },
    'Cloud/Hosting': {
      icon: '☁️',
      color: '#8b5cf6',
      options: ['AWS', 'Google Cloud', 'Azure', 'Digital Ocean', 'Vercel', 'Netlify', 'Heroku'],
    },
  };

  const integrationOptions = [
    'Payment (Stripe/PayPal)',
    'Authentication (Auth0/Firebase)',
    'Email (SendGrid/Mailchimp)',
    'Analytics (Google Analytics)',
    'Social Media APIs',
    'CRM Systems',
    'ERP Systems',
    'Third-party APIs',
    'Webhook Support',
    'SSO Integration',
  ];

  const getRecommendedStack = (productType) => {
    const recommendations = {
      'E-commerce Platform': {
        frontend: 'React',
        backend: 'Node.js',
        database: 'PostgreSQL',
        cloud: 'AWS',
        reason: 'Optimized for high-traffic e-commerce with excellent payment integrations',
      },
      'SaaS Dashboard': {
        frontend: 'React',
        backend: 'Python',
        database: 'PostgreSQL',
        cloud: 'Google Cloud',
        reason: 'Perfect for data-heavy applications with advanced analytics',
      },
      'Mobile App Backend': {
        frontend: 'React Native',
        backend: 'Node.js',
        database: 'MongoDB',
        cloud: 'Firebase',
        reason: 'Fast development with excellent mobile integration',
      },
    };

    return recommendations[productType] || {
      frontend: 'React',
      backend: 'Node.js',
      database: 'PostgreSQL',
      cloud: 'AWS',
      reason: 'Popular, well-supported stack for most applications',
    };
  };

  const recommended = getRecommendedStack(data.type);

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="primary" textAlign="center">
        Choose your technology stack
      </Typography>
      
      <Typography variant="body1" textAlign="center" color="textSecondary" mb={4}>
        Select the technologies that will power your {data.type || 'product'}.
        We've highlighted recommendations based on your product type.
      </Typography>

      <Grid container spacing={3}>
        {/* AI Recommendations */}
        <Grid item xs={12}>
          <Card sx={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white', mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CodeIcon />
                <Typography variant="h6" ml={1}>
                  Recommended Stack for {data.type}
                </Typography>
              </Box>
              
              <Typography variant="body2" mb={2} style={{ opacity: 0.9 }}>
                {recommended.reason}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" display="block">Frontend</Typography>
                  <Chip 
                    label={recommended.frontend} 
                    style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                    variant="outlined"
                    onClick={() => handleTechStackChange(recommended.frontend)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" display="block">Backend</Typography>
                  <Chip 
                    label={recommended.backend} 
                    style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                    variant="outlined"
                    onClick={() => handleTechStackChange(recommended.backend)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" display="block">Database</Typography>
                  <Chip 
                    label={recommended.database} 
                    style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                    variant="outlined"
                    onClick={() => handleTechStackChange(recommended.database)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" display="block">Cloud</Typography>
                  <Chip 
                    label={recommended.cloud} 
                    style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                    variant="outlined"
                    onClick={() => handleTechStackChange(recommended.cloud)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Technology Categories */}
        {Object.entries(techCategories).map(([category, config]) => (
          <Grid item xs={12} key={category}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: config.color, mr: 2 }}>
                    <Typography variant="h6">{config.icon}</Typography>
                  </Avatar>
                  <Typography variant="h6">{category}</Typography>
                </Box>
                
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {config.options.map(tech => (
                    <Chip
                      key={tech}
                      label={tech}
                      onClick={() => handleTechStackChange(tech)}
                      color={data.techStack?.includes(tech) ? 'primary' : 'default'}
                      variant={data.techStack?.includes(tech) ? 'filled' : 'outlined'}
                      clickable
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Integrations */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: '#ef4444', mr: 2 }}>
                  <IntegrationIcon />
                </Avatar>
                <Typography variant="h6">Third-party Integrations</Typography>
              </Box>
              
              <Typography variant="body2" color="textSecondary" mb={2}>
                What external services will your product integrate with?
              </Typography>
              
              <Box display="flex" flexWrap="wrap" gap={1}>
                {integrationOptions.map(integration => (
                  <Chip
                    key={integration}
                    label={integration}
                    onClick={() => handleIntegrationChange(integration)}
                    color={data.integrations?.includes(integration) ? 'primary' : 'default'}
                    variant={data.integrations?.includes(integration) ? 'filled' : 'outlined'}
                    clickable
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Requirements */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Expected Traffic</InputLabel>
            <Select
              value={data.expectedTraffic || ''}
              onChange={(e) => handleSimpleChange('expectedTraffic', e.target.value)}
              label="Expected Traffic"
            >
              <MenuItem value="< 1,000 users/month">{'< 1,000 users/month'}</MenuItem>
              <MenuItem value="1K - 10K users/month">1K - 10K users/month</MenuItem>
              <MenuItem value="10K - 100K users/month">10K - 100K users/month</MenuItem>
              <MenuItem value="100K - 1M users/month">100K - 1M users/month</MenuItem>
              <MenuItem value="> 1M users/month">{'> 1M users/month'}</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Performance Priority</InputLabel>
            <Select
              value={data.performancePriority || ''}
              onChange={(e) => handleSimpleChange('performancePriority', e.target.value)}
              label="Performance Priority"
            >
              <MenuItem value="Speed">Speed (Fast response times)</MenuItem>
              <MenuItem value="Scalability">Scalability (Handle growth)</MenuItem>
              <MenuItem value="Reliability">Reliability (High uptime)</MenuItem>
              <MenuItem value="Cost">Cost (Budget optimization)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Progress Summary */}
      {(data.techStack?.length > 0 || data.integrations?.length > 0) && (
        <Card sx={{ mt: 3, background: 'linear-gradient(45deg, #f3f4f6, #e5e7eb)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              🔧 Technical Summary
            </Typography>
            <Grid container spacing={2}>
              {data.techStack?.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">Technology Stack</Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                    {data.techStack.slice(0, 4).map((tech, index) => (
                      <Chip key={index} label={tech} size="small" />
                    ))}
                    {data.techStack.length > 4 && (
                      <Chip label={`+${data.techStack.length - 4} more`} size="small" variant="outlined" />
                    )}
                  </Box>
                </Grid>
              )}
              {data.integrations?.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">Integrations</Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                    {data.integrations.slice(0, 3).map((integration, index) => (
                      <Chip key={index} label={integration} size="small" />
                    ))}
                    {data.integrations.length > 3 && (
                      <Chip label={`+${data.integrations.length - 3} more`} size="small" variant="outlined" />
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TechnicalStep;
