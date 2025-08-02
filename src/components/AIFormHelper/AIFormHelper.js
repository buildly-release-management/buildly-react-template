import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Popover,
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Chip,
} from '@mui/material';
import {
  SmartToy as SmartToyIcon,
  ThumbUp as ThumbUpIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const AIFormHelper = ({ 
  fieldType = 'general', 
  onSuggestion, 
  placeholder = 'Enter value...',
  suggestions = [],
  size = 'small'
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuggestions, setGeneratedSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState('');

  const open = Boolean(anchorEl);

  // AI suggestion generator using BabbleBeaver AI
  const generateSuggestions = async (type) => {
    const promptMap = {
      'product-name': 'Generate 3 creative, professional product names for a software platform. Make them memorable and business-appropriate. Return only the names, one per line.',
      'product-description': 'Generate 3 comprehensive product descriptions for a software platform. Each should be 1-2 sentences explaining key features and benefits. Return only the descriptions, one per line.',
      'feature-title': 'Generate 3 software feature titles that are clear, actionable, and user-focused. Make them specific and compelling. Return only the titles, one per line.',
      'feature-description': 'Generate 3 detailed feature descriptions for software functionality. Each should explain the feature and its benefits in 1-2 sentences. Return only the descriptions, one per line.',
      'issue-title': 'Generate 3 software issue titles that are clear, specific, and actionable for developers. Return only the titles, one per line.',
      'issue-description': 'Generate 3 detailed issue descriptions that explain the problem, impact, and suggested approach in 1-2 sentences. Return only the descriptions, one per line.',
      'release-title': 'Generate 3 software release titles with version numbers that clearly indicate the release focus and improvements. Return only the titles, one per line.',
      'release-description': 'Generate 3 comprehensive release descriptions that highlight key features, improvements, and benefits in 1-2 sentences. Return only the descriptions, one per line.',
      'general': 'Generate 3 helpful suggestions for this form field. Keep them relevant and professional. Return only the suggestions, one per line.'
    };

    const prompt = promptMap[type] || promptMap['general'];

    // Use the same URL logic as other components
    const chatbotUrl = window.env.PRODUCTION 
      ? window.env.BABBLE_CHATBOT_URL 
      : '/api/babble/chatbot';
      
    console.log('AIFormHelper: Making request to:', chatbotUrl);
    console.log('AIFormHelper: With prompt:', prompt);
    console.log('AIFormHelper: window.env object:', window.env);

    // Check if URL is available for production
    if (window.env.PRODUCTION && !window.env?.BABBLE_CHATBOT_URL) {
      console.error('AIFormHelper: BABBLE_CHATBOT_URL not found in window.env');
      return ['AI service not configured', 'Please check environment settings', 'Contact administrator'];
    }

    try {
      const response = await fetch(chatbotUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      console.log('AIFormHelper: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('AIFormHelper: Response data:', data);
      
      // Split response by lines and clean up
      const suggestions = data.response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.match(/^\d+\.?\s*/)) // Remove numbered prefixes
        .slice(0, 3); // Take only first 3 suggestions

      return suggestions.length > 0 ? suggestions : ['AI suggestion not available', 'Please try again', 'Check your connection'];
    } catch (error) {
      console.error('AIFormHelper: Error generating AI suggestions:', error);
      return ['AI temporarily unavailable', 'Please try again later', 'Check documentation for examples'];
    }
  };

  const handleClick = async (event) => {
    setAnchorEl(event.currentTarget);
    setIsGenerating(true);
    
    try {
      const suggestions = await generateSuggestions(fieldType);
      setGeneratedSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setGeneratedSuggestions(['AI temporarily unavailable', 'Please try again later', 'Check documentation for examples']);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setGeneratedSuggestions([]);
    setSelectedSuggestion('');
  };

  const handleSuggestionSelect = (suggestion) => {
    setSelectedSuggestion(suggestion);
  };

  const handleAccept = () => {
    if (onSuggestion && selectedSuggestion) {
      onSuggestion(selectedSuggestion);
    }
    handleClose();
  };

  const handleRefine = async () => {
    setIsGenerating(true);
    try {
      const suggestions = await generateSuggestions(fieldType);
      setGeneratedSuggestions(suggestions);
    } catch (error) {
      console.error('Error refining suggestions:', error);
      setGeneratedSuggestions(['AI temporarily unavailable', 'Please try again later', 'Check documentation for examples']);
    } finally {
      setIsGenerating(false);
    }
  };

  const iconSize = size === 'small' ? '1rem' : '1.2rem';
  const buttonSize = size === 'small' ? 'small' : 'medium';

  return (
    <>
      <Tooltip title="Get AI suggestions for this field">
        <IconButton
          onClick={handleClick}
          size={buttonSize}
          sx={{
            color: '#0C5595',
            background: 'rgba(12, 85, 149, 0.1)',
            border: '1px solid rgba(12, 85, 149, 0.2)',
            width: size === 'small' ? 28 : 36,
            height: size === 'small' ? 28 : 36,
            ml: 1,
            '&:hover': {
              background: 'rgba(12, 85, 149, 0.2)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <SmartToyIcon sx={{ fontSize: iconSize }} />
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
            border: '1px solid #E5E7EB',
            maxWidth: 400,
            mt: 1,
          }
        }}
      >
        <Paper sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="subtitle1" fontWeight={600} color="#0C5595">
              AI Suggestions
            </Typography>
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {isGenerating ? (
            <Box display="flex" alignItems="center" gap={2} py={3}>
              <CircularProgress size={20} sx={{ color: '#0C5595' }} />
              <Typography variant="body2" color="text.secondary">
                BabbleBeaver AI is generating suggestions...
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Select a suggestion or ask for refinements:
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={1} mb={3}>
                {generatedSuggestions.slice(0, 3).map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    clickable
                    variant={selectedSuggestion === suggestion ? "filled" : "outlined"}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      height: 'auto',
                      py: 1,
                      px: 2,
                      '& .MuiChip-label': {
                        whiteSpace: 'normal',
                        lineHeight: 1.4,
                      },
                      backgroundColor: selectedSuggestion === suggestion ? '#0C5595' : 'transparent',
                      color: selectedSuggestion === suggestion ? 'white' : 'inherit',
                      '&:hover': {
                        backgroundColor: selectedSuggestion === suggestion ? '#0A4A85' : 'rgba(12, 85, 149, 0.1)',
                      }
                    }}
                  />
                ))}
              </Box>

              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  startIcon={<ThumbUpIcon />}
                  onClick={handleAccept}
                  disabled={!selectedSuggestion}
                  sx={{
                    backgroundColor: '#0C5595',
                    '&:hover': { backgroundColor: '#0A4A85' },
                    flex: 1,
                  }}
                >
                  Use This
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleRefine}
                  sx={{
                    borderColor: '#0C5595',
                    color: '#0C5595',
                    '&:hover': {
                      borderColor: '#0A4A85',
                      backgroundColor: 'rgba(12, 85, 149, 0.1)',
                    },
                  }}
                >
                  Refine
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Popover>
    </>
  );
};

export default AIFormHelper;
