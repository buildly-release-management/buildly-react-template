import React, { useEffect, useState, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import _ from 'lodash';
import { devLog } from '@utils/devLogger';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import {
  Box, 
  Button, 
  Fab, 
  Popover, 
  useTheme, 
  Typography,
  Paper,
  Chip,
  Link,
  Avatar,
  IconButton,
  Collapse,
  Card,
  CardContent,
  Divider,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  SmartToy as SmartToyIcon,
  Close as CloseIcon,
  Help as HelpIcon,
  Launch as LaunchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Lightbulb as LightbulbIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import { UserContext } from '@context/User.context';
import './Chatbot.css';

// Set sender here
const sender = 'Buildly Assistant';

// Documentation links based on current page
const getContextualHelp = (pathname) => {
  const helpMap = {
    '/app/dashboard': {
      title: 'Dashboard Help',
      links: [
        { label: 'Getting Started', url: 'https://docs.buildly.io/docs/getting-started' },
        { label: 'Dashboard Overview', url: 'https://docs.buildly.io/docs/features/dashboard' },
        { label: 'Product Management', url: 'https://docs.buildly.io/docs/features/product-portfolio' },
        { label: 'Creating Your First Product', url: 'https://docs.buildly.io/docs/guides/first-project' },
        { label: 'Release Planning', url: 'https://docs.buildly.io/docs/features/releases' },
      ],
    },
    '/app/product-portfolio': {
      title: 'Product Portfolio Help',
      links: [
        { label: 'Product Management', url: 'https://docs.buildly.io/docs/features/product-portfolio' },
        { label: 'Creating Products', url: 'https://docs.buildly.io/docs/guides/first-project' },
        { label: 'Product Roadmaps', url: 'https://docs.buildly.io/docs/features/product-roadmap' },
      ],
    },
    '/app/product-roadmap': {
      title: 'Product Roadmap Help',
      links: [
        { label: 'Roadmap Overview', url: 'https://docs.buildly.io/docs/features/product-roadmap' },
        { label: 'AI Feature Suggestions', url: 'https://docs.buildly.io/docs/features/ai-feature-suggestions' },
        { label: 'Kanban Board Guide', url: 'https://docs.buildly.io/docs/guides/kanban-workflow' },
        { label: 'Feature Management', url: 'https://docs.buildly.io/docs/guides/feature-management' },
      ],
    },
    '/app/releases': {
      title: 'Release Management Help',
      links: [
        { label: 'Release Planning', url: 'https://docs.buildly.io/docs/features/releases' },
        { label: 'AI Release Generation', url: 'https://docs.buildly.io/docs/features/ai-release-generation' },
        { label: 'Punchlist Management', url: 'https://docs.buildly.io/docs/guides/punchlist-workflow' },
        { label: 'Deployment Guide', url: 'https://docs.buildly.io/docs/guides/deployment' },
      ],
    },
    '/app/insights': {
      title: 'Insights & Analytics Help',
      links: [
        { label: 'Analytics Overview', url: 'https://docs.buildly.io/docs/features/insights' },
        { label: 'AI Budget Estimation', url: 'https://docs.buildly.io/docs/features/ai-budget-estimation' },
        { label: 'Team Assistance', url: 'https://docs.buildly.io/docs/features/team-assistance' },
        { label: 'Performance Metrics', url: 'https://docs.buildly.io/docs/guides/analytics' },
      ],
    },
    default: {
      title: 'Buildly Help',
      links: [
        { label: 'Documentation Home', url: 'https://docs.buildly.io/docs' },
        { label: 'Getting Started', url: 'https://docs.buildly.io/docs/getting-started' },
        { label: 'All Features', url: 'https://docs.buildly.io/docs/features' },
        { label: 'AI Assistant Guide', url: 'https://docs.buildly.io/docs/features/ai-assistant' },
        { label: 'API Reference', url: 'https://docs.buildly.io/docs/api' },
        { label: 'Support', url: 'https://docs.buildly.io/docs/support' },
      ],
    }
  };
  
  return helpMap[pathname] || helpMap.default;
};

// Generate contextual suggestions using BabbleBeaver AI
const generateContextualSuggestions = async (pathname) => {
  const pageContextMap = {
    '/app/dashboard': 'Generate 3 helpful questions a user might ask about using a product management dashboard, creating their first product, starting a release, or getting started with project management. Include questions about navigation and next steps. Return only the questions, one per line.',
    '/app/product-portfolio': 'Generate 3 helpful questions a user might ask about managing products, setting complexity scores, or organizing product features. Return only the questions, one per line.',
    '/app/product-roadmap': 'Generate 3 helpful questions a user might ask about product roadmaps, AI feature suggestions, Kanban boards, or feature management. Include questions about AI assistance and workflow optimization. Return only the questions, one per line.',
    '/app/releases': 'Generate 3 helpful questions a user might ask about creating releases, AI release generation, punchlist management, or deployment processes. Include questions about release planning and tracking. Return only the questions, one per line.',
    '/app/insights': 'Generate 3 helpful questions a user might ask about analytics, AI budget estimation, team assistance requests, or performance metrics. Include questions about insights and team management. Return only the questions, one per line.',
    'default': 'Generate 3 helpful questions a user might ask about getting started with Buildly, finding documentation, using AI features, or contacting support. Return only the questions, one per line.'
  };

  const prompt = pageContextMap[pathname] || pageContextMap['default'];

  try {
    // Use the configured chatbot URL (automatically set based on environment)
    const chatbotUrl = window.env.BABBLE_CHATBOT_URL;
    
    if (!chatbotUrl) {
      console.warn('Chatbot: BABBLE_CHATBOT_URL not configured');
      return [];
    }
    
    devLog.log('Chatbot: Using URL:', chatbotUrl, 'Production:', window.env.PRODUCTION);
    
    const response = await fetch(chatbotUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    
    const data = await response.json();
    
    // Split response by lines and clean up
    const suggestions = data.response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\d+\.?\s*/))
      .slice(0, 3);

    return suggestions.length > 0 ? suggestions : [
      'How do I get started?',
      'Where can I find help?',
      'How do I create a new project?'
    ];
  } catch (error) {
    console.error('Error generating contextual suggestions:', error);
    return [
      'How do I get started?',
      'Where can I find help?',
      'How do I create a new project?'
    ];
  }
};

// Enhanced initial message with contextual help
const getInitialMessage = (pathname, userName) => ({
  message: `Hi ${userName}! 👋 I'm your Buildly Assistant. I can help you navigate the platform, answer questions, and provide relevant documentation. What would you like to know?`,
  sender,
  timestamp: new Date(),
});

const Chatbot = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [hasContextualInfo, setHasContextualInfo] = useState(false);
  const [contextualSuggestions, setContextualSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const theme = useTheme();
  const user = useContext(UserContext);
  const open = Boolean(anchorEl);
  const id = open ? 'chatbot-popover' : undefined;
  
  const contextualHelp = getContextualHelp(location.pathname);

  useEffect(() => {
    // Initialize with contextual message
    const initialMessage = getInitialMessage(location.pathname, user?.first_name || 'there');
    setMessages([initialMessage]);
    // Generate dynamic suggestions using BabbleBeaver AI
    const loadSuggestions = async () => {
      setLoadingSuggestions(true);
      const suggestions = await generateContextualSuggestions(location.pathname);
      setContextualSuggestions(suggestions);
      setLoadingSuggestions(false);
    };
    loadSuggestions();
    setHasContextualInfo(contextualHelp.links.length > 0);
  }, [location.pathname, user]);

  useEffect(() => {
    if (history.action === 'PUSH' && !open) {
      setHasNewMessage(true);
      setHasContextualInfo(true);
      // Stop the contextual bounce after 10 seconds
      setTimeout(() => setHasContextualInfo(false), 10000);
    }
  }, [location.pathname]);

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    setHasNewMessage(false);
    setHasContextualInfo(false);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowHelp(true);
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
    setShowHelp(false);
  };

  const handleSend = async (message) => {
    const newMessages = [...messages, { 
      message, 
      direction: 'outgoing', 
      sender: 'user',
      timestamp: new Date()
    }];
    setMessages(newMessages);
    setShowHelp(false);

    setIsTyping(true);
    await processMessageToBabble(newMessages);
  };

  async function processMessageToBabble(chatMessages) {
    const lastMessage = _.last(chatMessages).message;
    
    // Enhanced prompt with context
    const contextualPrompt = `
      User is currently on: ${location.pathname}
      User question: ${lastMessage}
      
      Please provide helpful, specific answers about Buildly Product Labs. 
      If the question is about navigation or features, provide specific guidance.
      Keep responses concise but informative.
      Include relevant documentation links when appropriate.
    `;

    try {
      // Use the configured chatbot URL (automatically set based on environment)
      const chatbotUrl = window.env.BABBLE_CHATBOT_URL;
        
      if (!chatbotUrl) {
        console.warn('Chatbot: BABBLE_CHATBOT_URL not configured');
        setMessages([...chatMessages, {
          message: "Chatbot service is not configured. Please check with your administrator.",
          sender,
          timestamp: new Date(),
        }]);
        return;
      }

      const response = await fetch(chatbotUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: contextualPrompt }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setMessages([...chatMessages, {
        message: data.response || 'No response received',
        sender,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      
      let errorMessage = "I'm sorry, I'm having trouble connecting right now.";
      
      // Check for specific error types
      if (error.response && error.response.status === 500) {
        errorMessage = "The chatbot service is experiencing technical difficulties. Our team has been notified.";
        devLog.error('Chatbot 500 error - service issue, not CORS');
      } else if (error.message.includes('CORS')) {
        errorMessage = "The chatbot service is currently unavailable due to a configuration issue. Please try again later.";
        devLog.error('CORS error detected');
      } else if (error.message.includes('fetch')) {
        errorMessage = "Unable to connect to the chatbot service. Please check your internet connection.";
        devLog.error('Network/fetch error');
      } else if (error.response && error.response.status >= 400 && error.response.status < 500) {
        errorMessage = "There was an issue with your request. Please try rephrasing your question.";
        devLog.error(`Chatbot client error: ${error.response.status}`);
      }
      
      setMessages([...chatMessages, {
        message: `${errorMessage} You can still use the documentation links above or contact support.`,
        sender,
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div style={{ 
      position: 'fixed', 
      right: theme.spacing(3), 
      bottom: theme.spacing(3),
      zIndex: 1300 
    }}>
      <Badge 
        color="primary" 
        variant="dot" 
        invisible={!hasNewMessage}
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: '#F9943B',
            animation: hasNewMessage ? 'pulse 2s infinite' : 'none',
          }
        }}
      >
        <Fab 
          aria-label="AI Assistant"
          onClick={handleOpen}
          sx={{
            background: '#0C5595 !important',
            border: '3px solid #FFFFFF',
            boxShadow: '0px 4px 20px rgba(12, 85, 149, 0.4)',
            animation: (hasNewMessage || hasContextualInfo) ? 'bounce 2s infinite' : 'none',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0px 6px 25px rgba(12, 85, 149, 0.6)',
              background: '#0A4A85 !important',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <SmartToyIcon 
            sx={{ 
              color: '#FFFFFF',
              fontSize: '1.5rem',
              filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.3))',
            }} 
          />
        </Fab>
      </Badge>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '16px',
              boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.15)',
              border: '1px solid #E5E7EB',
              overflow: 'hidden',
              margin: '8px',
            }
          }
        }}
        sx={{
          '& .MuiPopover-paper': {
            maxHeight: '90vh !important',
            maxWidth: '95vw !important',
          }
        }}
      >
        <Box 
          width={{ xs: 350, sm: 480, md: 520 }} 
          height={{ xs: 600, sm: 700, md: 750 }} 
          display="flex" 
          flexDirection="column"
          sx={{
            maxHeight: '90vh',
            maxWidth: '95vw',
          }}
        >
          {/* Header */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              background: 'linear-gradient(135deg, #4A90C5 0%, #FBB65B 100%)',
              color: 'white',
              borderRadius: 0,
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: 'rgba(255,255,255,0.2)' 
                  }}
                >
                  <SmartToyIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Buildly Assistant
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {contextualHelp.title}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Paper>

          {/* Contextual Help Section */}
          <Collapse in={showHelp}>
            <Card elevation={0} sx={{ m: 2, border: '1px solid #E5E7EB' }}>
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <LightbulbIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Quick Help
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setShowHelp(!showHelp)}
                  >
                    {showHelp ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
                
                {/* Documentation Links */}
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Documentation:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                  {contextualHelp.links.map((link, index) => (
                    <Chip
                      key={index}
                      label={link.label}
                      size="small"
                      clickable
                      icon={<MenuBookIcon />}
                      onClick={() => window.open(link.url, '_blank')}
                      sx={{ 
                        fontSize: '0.7rem',
                        '&:hover': { backgroundColor: '#E3F2FD' }
                      }}
                    />
                  ))}
                </Box>

                {/* Quick Suggestions */}
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Common questions:
                </Typography>
                {loadingSuggestions ? (
                  <Box display="flex" alignItems="center" gap={1} py={1}>
                    <CircularProgress size={16} sx={{ color: '#0C5595' }} />
                    <Typography variant="caption" color="text.secondary">
                      BabbleBeaver AI is generating suggestions...
                    </Typography>
                  </Box>
                ) : (
                  <Box display="flex" flexDirection="column" gap={0.5}>
                    {contextualSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        size="small"
                        variant="outlined"
                        startIcon={<HelpIcon />}
                        onClick={() => handleSuggestionClick(suggestion)}
                        sx={{ 
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          py: 0.5,
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Collapse>

          {/* Chat Container */}
          <Box 
            flex={1} 
            sx={{ 
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <MainContainer style={{ height: '100%', flex: 1 }}>
              <ChatContainer>
                <MessageList
                  scrollBehavior="smooth"
                  typingIndicator={isTyping ? <TypingIndicator content={`${sender} is typing...`} /> : null}
                  style={{ 
                    padding: '0 16px',
                    flex: 1,
                    minHeight: '300px',
                  }}
                >
                  {_.map(messages, (message, i) => (
                    <Message key={i} model={message} />
                  ))}
                </MessageList>
                <MessageInput 
                  placeholder="Ask me anything about Buildly..." 
                  onSend={handleSend}
                  style={{ 
                    padding: '0 16px 16px 16px',
                    borderTop: '1px solid #E5E7EB',
                    marginTop: '8px',
                  }}
                />
              </ChatContainer>
            </MainContainer>
          </Box>
        </Box>
      </Popover>
    </div>
  );
};

export default Chatbot;
