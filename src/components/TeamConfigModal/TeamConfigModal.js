import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Chip,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import { Add, Remove, AutoAwesome } from '@mui/icons-material';

const TeamConfigModal = ({ open, onClose, onSave, release, initialTeam = [] }) => {
  const [teamConfig, setTeamConfig] = useState(() => {
    // Initialize with default team roles
    const defaultRoles = [
      { role: 'Frontend Developer', count: 1, weeklyRate: 2500 },
      { role: 'Backend Developer', count: 1, weeklyRate: 2800 },
      { role: 'QA Engineer', count: 1, weeklyRate: 2200 },
      { role: 'DevOps Engineer', count: 0, weeklyRate: 3000 },
      { role: 'UI/UX Designer', count: 0, weeklyRate: 2400 },
      { role: 'Product Manager', count: 0, weeklyRate: 3200 }
    ];

    // Merge with initial team if provided
    if (initialTeam.length > 0) {
      return initialTeam.map(member => ({
        ...member,
        count: member.count || 0
      }));
    }

    return defaultRoles;
  });

  const updateTeamMember = (index, field, value) => {
    const updated = [...teamConfig];
    updated[index] = { ...updated[index], [field]: value };
    setTeamConfig(updated);
  };

  const addRole = () => {
    setTeamConfig([...teamConfig, { 
      role: 'New Role', 
      count: 1, 
      weeklyRate: 2500 
    }]);
  };

  const removeRole = (index) => {
    const updated = teamConfig.filter((_, i) => i !== index);
    setTeamConfig(updated);
  };

  const handleSave = () => {
    const activeTeam = teamConfig.filter(member => member.count > 0);
    onSave(activeTeam);
    onClose();
  };

  const totalWeeklyCost = teamConfig.reduce((sum, member) => 
    sum + (member.count * member.weeklyRate), 0
  );

  const estimatedTimelineWeeks = Math.max(4, Math.ceil((release?.features?.length || 0) / 2));

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <AutoAwesome />
        Configure Team for {release?.name || 'Release'}
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            Configure your ideal team composition. AI will use this to generate accurate budget estimates.
          </Typography>
        </Box>

        <Card sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Release Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Features</Typography>
                <Typography variant="h4" color="primary">
                  {release?.features?.length || 0}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Issues</Typography>
                <Typography variant="h4" color="error">
                  {release?.issues?.length || 0}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Est. Timeline</Typography>
                <Typography variant="h4" color="success">
                  {estimatedTimelineWeeks}w
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          👥 Team Configuration
        </Typography>

        <Grid container spacing={2}>
          {teamConfig.map((member, index) => (
            <Grid item xs={12} key={index}>
              <Card variant="outlined">
                <CardContent sx={{ p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Role"
                        value={member.role}
                        onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton 
                          size="small" 
                          onClick={() => updateTeamMember(index, 'count', Math.max(0, member.count - 1))}
                          disabled={member.count <= 0}
                        >
                          <Remove />
                        </IconButton>
                        <TextField
                          size="small"
                          type="number"
                          value={member.count}
                          onChange={(e) => updateTeamMember(index, 'count', parseInt(e.target.value) || 0)}
                          sx={{ width: '60px' }}
                          inputProps={{ min: 0, max: 10 }}
                        />
                        <IconButton 
                          size="small" 
                          onClick={() => updateTeamMember(index, 'count', Math.min(10, member.count + 1))}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Weekly Rate ($)"
                        type="number"
                        value={member.weeklyRate}
                        onChange={(e) => updateTeamMember(index, 'weeklyRate', parseInt(e.target.value) || 0)}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body2" color="text.secondary">
                        ${(member.count * member.weeklyRate * estimatedTimelineWeeks).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => removeRole(index)}
                        disabled={teamConfig.length <= 1}
                      >
                        <Remove />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={addRole}
          >
            Add Role
          </Button>

          <Box textAlign="right">
            <Typography variant="body2" color="text.secondary">
              Weekly Cost: ${totalWeeklyCost.toLocaleString()}
            </Typography>
            <Typography variant="h6" color="primary">
              Total Estimate: ${(totalWeeklyCost * estimatedTimelineWeeks).toLocaleString()}
            </Typography>
          </Box>
        </Box>

        <Box mt={2}>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            💡 AI will use this team configuration to generate detailed budget estimates including risk buffers and timeline optimizations.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          startIcon={<AutoAwesome />}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          Generate AI Budget
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamConfigModal;
