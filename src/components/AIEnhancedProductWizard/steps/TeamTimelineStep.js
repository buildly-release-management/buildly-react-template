/**
 * Team & Timeline Step Component
 * Fourth step in the AI-Enhanced Product Wizard
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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  Group as TeamIcon,
  Schedule as TimelineIcon,
  Person as PersonIcon,
  Code as DevIcon,
  Design as DesignIcon,
  Management as ManageIcon,
} from '@mui/icons-material';

const TeamTimelineStep = ({ data, setData, classes }) => {
  const handleSimpleChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTeamRoleChange = (role, count) => {
    setData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        [role]: count,
      },
    }));
  };

  const teamRoles = [
    {
      role: 'Frontend Developer',
      icon: <DesignIcon />,
      color: '#3b82f6',
      description: 'UI/UX implementation, React/Vue development',
      recommended: data.techStack?.some(tech => ['React', 'Vue.js', 'Angular'].includes(tech)) ? 2 : 1,
    },
    {
      role: 'Backend Developer',
      icon: <DevIcon />,
      color: '#10b981',
      description: 'API development, database design, server logic',
      recommended: 2,
    },
    {
      role: 'Full-stack Developer',
      icon: <DevIcon />,
      color: '#f59e0b',
      description: 'Both frontend and backend development',
      recommended: 1,
    },
    {
      role: 'QA Engineer',
      icon: <PersonIcon />,
      color: '#8b5cf6',
      description: 'Testing, quality assurance, automation',
      recommended: 1,
    },
    {
      role: 'Product Manager',
      icon: <ManageIcon />,
      color: '#ef4444',
      description: 'Requirements, roadmap, stakeholder communication',
      recommended: 1,
    },
    {
      role: 'UI/UX Designer',
      icon: <DesignIcon />,
      color: '#06b6d4',
      description: 'User interface design, user experience optimization',
      recommended: 1,
    },
    {
      role: 'DevOps Engineer',
      icon: <DevIcon />,
      color: '#84cc16',
      description: 'Deployment, infrastructure, CI/CD',
      recommended: 1,
    },
  ];

  const getRecommendedTimeline = () => {
    const featureCount = data.features?.length || 0;
    const techComplexity = data.techStack?.length || 0;
    const integrationComplexity = data.integrations?.length || 0;
    
    const complexityScore = featureCount + techComplexity + integrationComplexity;
    
    if (complexityScore < 10) return '3-4 months';
    if (complexityScore < 20) return '4-6 months';
    if (complexityScore < 30) return '6-9 months';
    return '9-12 months';
  };

  const getRecommendedTeamSize = () => {
    const featureCount = data.features?.length || 0;
    if (featureCount < 5) return '3-4 people';
    if (featureCount < 10) return '4-6 people';
    if (featureCount < 15) return '6-8 people';
    return '8-10 people';
  };

  const getTotalTeamMembers = () => {
    return Object.values(data.team || {}).reduce((sum, count) => sum + (parseInt(count) || 0), 0);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="primary" textAlign="center">
        Plan your team & timeline
      </Typography>
      
      <Typography variant="body1" textAlign="center" color="textSecondary" mb={4}>
        Based on your {data.features?.length || 0} features and technology choices, 
        let's determine the right team structure and realistic timeline.
      </Typography>

      <Grid container spacing={3}>
        {/* AI Recommendations */}
        <Grid item xs={12}>
          <Card sx={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white', mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TeamIcon />
                <Typography variant="h6" ml={1}>
                  AI Recommendations
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" style={{ opacity: 0.9 }}>
                    Recommended Team Size
                  </Typography>
                  <Typography variant="h6">
                    {getRecommendedTeamSize()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" style={{ opacity: 0.9 }}>
                    Estimated Timeline
                  </Typography>
                  <Typography variant="h6">
                    {getRecommendedTimeline()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Team Composition */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Team Composition
          </Typography>
          <Grid container spacing={2}>
            {teamRoles.map((roleInfo) => (
              <Grid item xs={12} sm={6} md={4} key={roleInfo.role}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ bgcolor: roleInfo.color, mr: 2 }}>
                        {roleInfo.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {roleInfo.role}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Recommended: {roleInfo.recommended}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" mb={2}>
                      {roleInfo.description}
                    </Typography>
                    
                    <FormControl fullWidth size="small">
                      <InputLabel>Count</InputLabel>
                      <Select
                        value={data.team?.[roleInfo.role] || 0}
                        onChange={(e) => handleTeamRoleChange(roleInfo.role, e.target.value)}
                        label="Count"
                      >
                        {[0, 1, 2, 3, 4, 5].map(num => (
                          <MenuItem key={num} value={num}>{num}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Timeline Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: '#8b5cf6', mr: 2 }}>
                  <TimelineIcon />
                </Avatar>
                <Typography variant="h6">Project Timeline</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Development Phase</InputLabel>
                    <Select
                      value={data.developmentPhase || ''}
                      onChange={(e) => handleSimpleChange('developmentPhase', e.target.value)}
                      label="Development Phase"
                    >
                      <MenuItem value="MVP">MVP (Minimum Viable Product)</MenuItem>
                      <MenuItem value="Full Product">Full Product</MenuItem>
                      <MenuItem value="Enterprise">Enterprise Solution</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Estimated Duration</InputLabel>
                    <Select
                      value={data.estimatedDuration || ''}
                      onChange={(e) => handleSimpleChange('estimatedDuration', e.target.value)}
                      label="Estimated Duration"
                    >
                      <MenuItem value="1-3 months">1-3 months</MenuItem>
                      <MenuItem value="3-6 months">3-6 months</MenuItem>
                      <MenuItem value="6-9 months">6-9 months</MenuItem>
                      <MenuItem value="9-12 months">9-12 months</MenuItem>
                      <MenuItem value="12+ months">12+ months</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Target Launch Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={data.targetLaunchDate || ''}
                    onChange={(e) => handleSimpleChange('targetLaunchDate', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Work Methodology */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Work Methodology
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Development Methodology</InputLabel>
                    <Select
                      value={data.methodology || ''}
                      onChange={(e) => handleSimpleChange('methodology', e.target.value)}
                      label="Development Methodology"
                    >
                      <MenuItem value="Agile/Scrum">Agile/Scrum</MenuItem>
                      <MenuItem value="Kanban">Kanban</MenuItem>
                      <MenuItem value="Waterfall">Waterfall</MenuItem>
                      <MenuItem value="Hybrid">Hybrid</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Team Location</InputLabel>
                    <Select
                      value={data.teamLocation || ''}
                      onChange={(e) => handleSimpleChange('teamLocation', e.target.value)}
                      label="Team Location"
                    >
                      <MenuItem value="On-site">On-site</MenuItem>
                      <MenuItem value="Remote">Remote</MenuItem>
                      <MenuItem value="Hybrid">Hybrid</MenuItem>
                      <MenuItem value="Distributed">Distributed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Sprint Duration</InputLabel>
                    <Select
                      value={data.sprintDuration || ''}
                      onChange={(e) => handleSimpleChange('sprintDuration', e.target.value)}
                      label="Sprint Duration"
                    >
                      <MenuItem value="1 week">1 week</MenuItem>
                      <MenuItem value="2 weeks">2 weeks</MenuItem>
                      <MenuItem value="3 weeks">3 weeks</MenuItem>
                      <MenuItem value="4 weeks">4 weeks</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progress Summary */}
      {getTotalTeamMembers() > 0 && (
        <Card sx={{ mt: 3, background: 'linear-gradient(45deg, #f3f4f6, #e5e7eb)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              👥 Team Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Total Team Size</Typography>
                <Typography variant="h6">{getTotalTeamMembers()} members</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Estimated Timeline</Typography>
                <Typography variant="h6">{data.estimatedDuration || getRecommendedTimeline()}</Typography>
              </Grid>
            </Grid>
            
            {Object.entries(data.team || {}).filter(([_, count]) => count > 0).length > 0 && (
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>Team Breakdown</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {Object.entries(data.team || {})
                    .filter(([_, count]) => count > 0)
                    .map(([role, count]) => (
                      <Chip key={role} label={`${count}x ${role}`} size="small" />
                    ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TeamTimelineStep;
