import React, { useEffect, useState, useMemo, useCallback } from 'react';
import './TimelineComponent.css';
import { Timeline, TimelineEvent } from '@mailtop/horizontal-timeline';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Chip, 
  Card, 
  CardContent,
  CardHeader,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert
} from '@mui/material';
import { 
  TabContext, 
  TabList, 
  TabPanel 
} from '@mui/lab';
import { 
  ExpandMore as ExpandMoreIcon,
  BugReport as BugIcon,
  Star as FeatureIcon,
  Schedule as ReleaseIcon,
  CheckCircle as CompleteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { devLog } from '@utils/devLogger';

const TimelineComponent = ({ reportData, suggestedFeatures, onReleaseClick, productContext, onReleaseUpdate }) => {
  const [releaseData, setReleaseData] = useState([]);
  const [features, setFeatures] = useState([]);
  const [expandedFeatures, setExpandedFeatures] = useState({});
  const [activeTab, setActiveTab] = useState('0'); // For tab navigation
  const [completionDialog, setCompletionDialog] = useState({ open: false, releaseIndex: null, incompleteItems: [] });

  // Memoize data processing to prevent unnecessary re-renders
  const processedReleaseData = useMemo(() => {
    if (!reportData || !Array.isArray(reportData)) {
      devLog.log('Timeline - No valid report data provided');
      return [];
    }
    
    // Only log once when data changes to reduce console spam
    devLog.log('Timeline - Processing release data:', {
      totalReleases: reportData.length,
      firstReleaseIssues: reportData[0]?.issues?.length || 0,
      firstReleaseFeatures: reportData[0]?.features?.length || 0,
    });
    
    return reportData;
  }, [reportData]);

  useEffect(() => {
    setReleaseData(processedReleaseData);
  }, [processedReleaseData]);

  useEffect(() => {
    setFeatures(suggestedFeatures || []);
  }, [suggestedFeatures]);

  // Find current release based on today's date
  const currentReleaseIndex = useMemo(() => {
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];
    
    return releaseData.findIndex(release => {
      const releaseDate = new Date(release.release_date);
      const endDate = new Date(release.calculated_end_date || release.release_date);
      return currentDate >= release.release_date && currentDate <= endDate.toISOString().split('T')[0];
    });
  }, [releaseData]);

  // Helper functions for release completion logic
  const isReleaseOverdue = useCallback((releaseDate) => {
    const today = new Date();
    const release = new Date(releaseDate);
    return release < today;
  }, []);

  const isItemComplete = useCallback((item) => {
    const status = item.status || item._status || '';
    const completedStatuses = ['done', 'complete', 'completed', 'closed', 'resolved'];
    return completedStatuses.includes(status.toLowerCase());
  }, []);

  const getIncompleteItems = useCallback((release) => {
    const incompleteFeatures = (release.features || []).filter(feature => !isItemComplete(feature));
    const incompleteIssues = (release.issues || []).filter(issue => !isItemComplete(issue));
    
    return {
      features: incompleteFeatures,
      issues: incompleteIssues,
      total: incompleteFeatures.length + incompleteIssues.length
    };
  }, [isItemComplete]);

  const handleReleaseCompletion = useCallback((releaseIndex, forceComplete = false) => {
    const release = releaseData[releaseIndex];
    const incompleteItems = getIncompleteItems(release);
    
    if (incompleteItems.total > 0 && !forceComplete) {
      // Show warning dialog
      setCompletionDialog({
        open: true,
        releaseIndex,
        incompleteItems
      });
      return;
    }
    
    // Mark release as complete and move incomplete items
    const updatedReleaseData = [...releaseData];
    updatedReleaseData[releaseIndex] = {
      ...release,
      is_completed: true,
      completion_date: new Date().toISOString().split('T')[0],
      // Remove incomplete items from this release
      features: (release.features || []).filter(isItemComplete),
      issues: (release.issues || []).filter(isItemComplete)
    };
    
    setReleaseData(updatedReleaseData);
    
    // Notify parent component of changes
    if (onReleaseUpdate) {
      onReleaseUpdate(updatedReleaseData[releaseIndex], incompleteItems);
    }
    
    setCompletionDialog({ open: false, releaseIndex: null, incompleteItems: [] });
  }, [releaseData, getIncompleteItems, isItemComplete, onReleaseUpdate]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }, []);

  // Auto-complete releases that are past due
  useEffect(() => {
    const today = new Date();
    let hasChanges = false;
    
    const updatedData = releaseData.map(release => {
      if (!release.is_completed && isReleaseOverdue(release.release_date)) {
        hasChanges = true;
        const incompleteItems = getIncompleteItems(release);
        
        return {
          ...release,
          is_completed: true,
          completion_date: release.release_date, // Use the original release date
          auto_completed: true, // Flag to show it was auto-completed
          // Keep all items but mark which were incomplete
          incomplete_items_moved: incompleteItems.total
        };
      }
      return release;
    });
    
    if (hasChanges) {
      setReleaseData(updatedData);
      devLog.log('Auto-completed overdue releases');
    }
  }, [releaseData, isReleaseOverdue, getIncompleteItems]);

  // Simple icon component to replace emojis
  const ReleaseIcon = ({ index, isActive }) => (
    <div 
      className={`timeline-icon ${isActive ? 'active' : ''}`}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: isActive ? '#4CAF50' : '#0C5595',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
        border: isActive ? '3px solid #fff' : '2px solid #fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}
    >
      {index + 1}
    </div>
  );



  return (
    <div className="timeline-wrapper">
      {/* Compact Status Header */}
      <Card sx={{ mb: 2, backgroundColor: '#f8f9fa' }}>
        <CardContent sx={{ py: 1.5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              📊 Timeline Overview
            </Typography>
            <Box display="flex" gap={2}>
              <Typography variant="body2" color="text.secondary">
                📋 {releaseData?.reduce((total, release) => total + (release.features?.length || 0), 0)} Features
              </Typography>
              <Typography variant="body2" color="text.secondary">
                🚀 {releaseData?.length || 0} Releases
              </Typography>
              <Typography variant="body2" color="text.secondary">
                🐛 {releaseData?.reduce((total, release) => total + (release.issues?.length || 0), 0)} Issues
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {releaseData && releaseData.length > 0 ? (
        <TabContext value={activeTab}>
          {/* Tab Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <TabList onChange={(event, newValue) => setActiveTab(newValue)} aria-label="timeline tabs">
              {releaseData.map((release, index) => (
                <Tab 
                  key={`tab-${index}`}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      {release.is_completed ? <CompleteIcon fontSize="small" /> : <ReleaseIcon fontSize="small" />}
                      <span>{release.name}</span>
                      {release.features?.length > 0 && (
                        <Chip size="small" label={release.features.length} sx={{ height: 20, fontSize: '0.7rem' }} />
                      )}
                      {release.is_completed && (
                        <Chip 
                          size="small" 
                          label="DONE" 
                          color="success" 
                          sx={{ height: 18, fontSize: '0.6rem' }} 
                        />
                      )}
                    </Box>
                  } 
                  value={index.toString()} 
                />
              ))}
            </TabList>
          </Box>

          {/* Tab Panels */}
          {releaseData.map((releaseItem, idx) => {
            const isCurrentRelease = idx === currentReleaseIndex;
            
            return (
              <TabPanel key={`panel-${idx}`} value={idx.toString()} sx={{ px: 0 }}>
                <Card>
                  <CardHeader
                    title={
                      <Box display="flex" alignItems="center" gap={1}>
                        {releaseItem.is_completed ? <CompleteIcon color="success" /> : <ReleaseIcon />}
                        <span>{releaseItem.name}</span>
                        {isCurrentRelease && !releaseItem.is_completed && (
                          <Chip 
                            label="CURRENT" 
                            color="primary" 
                            size="small" 
                            sx={{ fontWeight: 'bold' }}
                          />
                        )}
                        {releaseItem.is_completed && (
                          <Chip 
                            label={releaseItem.auto_completed ? "AUTO-COMPLETED" : "COMPLETED"} 
                            color="success" 
                            size="small" 
                            sx={{ fontWeight: 'bold' }}
                          />
                        )}
                      </Box>
                    }
                    subheader={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Start: {formatDate(releaseItem.start_date)} → Release: {formatDate(releaseItem.release_date)}
                        </Typography>
                        {releaseItem.is_completed && (
                          <Typography variant="body2" color="success.main">
                            Completed: {formatDate(releaseItem.completion_date)}
                            {releaseItem.incomplete_items_moved > 0 && (
                              <span style={{ marginLeft: '8px' }}>
                                ({releaseItem.incomplete_items_moved} items moved)
                              </span>
                            )}
                          </Typography>
                        )}
                        {!releaseItem.is_completed && isReleaseOverdue(releaseItem.release_date) && (
                          <Typography variant="body2" color="error.main">
                            ⚠️ Overdue since {formatDate(releaseItem.release_date)}
                          </Typography>
                        )}
                      </Box>
                    }
                    action={
                      <Box display="flex" gap={1}>
                        <Chip 
                          icon={<FeatureIcon />}
                          label={`${releaseItem.features?.length || 0} Features`}
                          variant="outlined"
                          size="small"
                        />
                        <Chip 
                          icon={<BugIcon />}
                          label={`${releaseItem.issues?.length || 0} Issues`}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    }
                    sx={{ backgroundColor: isCurrentRelease ? '#e3f2fd' : 'inherit' }}
                  />
                  
                  <CardContent>
                    {/* Manual Completion Checkbox */}
                    {!releaseItem.is_completed && (
                      <Box sx={{ mb: 2 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={false}
                              onChange={() => handleReleaseCompletion(idx)}
                              color="primary"
                            />
                          }
                          label={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2">Mark release as complete</Typography>
                              {getIncompleteItems(releaseItem).total > 0 && (
                                <Chip 
                                  icon={<WarningIcon />}
                                  label={`${getIncompleteItems(releaseItem).total} incomplete items`}
                                  color="warning"
                                  size="small"
                                />
                              )}
                            </Box>
                          }
                        />
                      </Box>
                    )}

                    {/* Extension Notice */}
                    {releaseItem.calculated_end_date && releaseItem.calculated_end_date !== releaseItem.release_date && (
                      <Box sx={{ mb: 2, p: 1, backgroundColor: '#fff3cd', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          ⏱️ Timeline Extended to: {releaseItem.calculated_end_date}
                        </Typography>
                      </Box>
                    )}

                    {/* Features Section */}
                    {releaseItem.features && releaseItem.features.length > 0 ? (
                      <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <FeatureIcon />
                            <Typography variant="h6">
                              Features ({releaseItem.features.length})
                            </Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box display="flex" flexDirection="column" gap={1}>
                            {releaseItem.features.map((feature, index) => (
                              <Card 
                                key={`feat-${idx}-${index}`} 
                                variant="outlined" 
                                sx={{ backgroundColor: '#f8f9fa' }}
                              >
                                <CardContent sx={{ py: 1 }}>
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" fontWeight="medium">
                                      {feature.name || feature.feature_name}
                                    </Typography>
                                    <Box display="flex" gap={1}>
                                      <Typography variant="caption" color="text.secondary">
                                        � {feature.estimated_completion_date || 'TBD'}
                                      </Typography>
                                      <Chip 
                                        size="small"
                                        label={feature.estimation_source === 'ai' ? '🤖 AI' : '📊 Est'}
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                      />
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            ))}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    ) : (
                      <Box sx={{ p: 2, textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          No features assigned to this release
                        </Typography>
                      </Box>
                    )}

                    {/* Issues Section */}
                    {releaseItem.issues && releaseItem.issues.length > 0 && (
                      <Accordion sx={{ mt: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <BugIcon />
                            <Typography variant="h6">
                              Issues ({releaseItem.issues.length})
                            </Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box display="flex" flexDirection="column" gap={1}>
                            {releaseItem.issues.slice(0, 5).map((issue, index) => {
                              const isComplete = isItemComplete(issue);
                              return (
                                <Box 
                                  key={`issue-${index}`} 
                                  display="flex" 
                                  alignItems="center" 
                                  gap={1}
                                  sx={{ 
                                    p: 1, 
                                    backgroundColor: isComplete ? '#e8f5e8' : '#fafafa',
                                    borderRadius: 1,
                                    border: isComplete ? '1px solid #4caf50' : '1px solid #e0e0e0'
                                  }}
                                >
                                  {isComplete && <CompleteIcon color="success" fontSize="small" />}
                                  <Typography 
                                    variant="body2"
                                    sx={{ 
                                      textDecoration: isComplete ? 'line-through' : 'none',
                                      color: isComplete ? 'text.secondary' : 'text.primary'
                                    }}
                                  >
                                    • {issue.name || issue.issue_name || issue.title}
                                  </Typography>
                                  {issue.status && (
                                    <Chip 
                                      size="small"
                                      label={issue.status}
                                      color={isComplete ? 'success' : 'default'}
                                      variant="outlined"
                                      sx={{ height: 18, fontSize: '0.6rem', ml: 'auto' }}
                                    />
                                  )}
                                </Box>
                              );
                            })}
                            {releaseItem.issues.length > 5 && (
                              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                ...and {releaseItem.issues.length - 5} more issues
                              </Typography>
                            )}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    )}

                    {/* Suggested Features */}
                    {features && features.length > 0 && (!releaseItem.features || releaseItem.features.length === 0) && (
                      <Accordion sx={{ mt: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="h6">💡 Suggested Features</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box display="flex" flexDirection="column" gap={1}>
                            {features.slice(0, 3).map((feature, index) => (
                              <Typography key={`sug-feat-${index}`} variant="body2">
                                • {feature?.suggested_feature}
                              </Typography>
                            ))}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    )}

                    {/* Action Button */}
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          cursor: onReleaseClick ? 'pointer' : 'default',
                          color: 'primary.main',
                          textDecoration: 'underline'
                        }}
                        onClick={() => onReleaseClick && onReleaseClick(releaseItem)}
                      >
                        📋 View Release Details
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </TabPanel>
            );
          })}
        </TabContext>
      ) : (
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {releaseData ? (
              'No release data available to display timeline.'
            ) : (
              'Loading timeline data...'
            )}
          </Typography>
        </Card>
      )}

      {/* Completion Warning Dialog */}
      <Dialog open={completionDialog.open} onClose={() => setCompletionDialog({ open: false, releaseIndex: null, incompleteItems: [] })}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon color="warning" />
            Incomplete Items Found
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This release has incomplete features and issues that will be moved out of the release when marked complete.
          </Alert>
          
          {completionDialog.incompleteItems?.features?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Incomplete Features ({completionDialog.incompleteItems.features.length}):
              </Typography>
              {completionDialog.incompleteItems.features.slice(0, 5).map((feature, index) => (
                <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                  • {feature.name || feature.feature_name}
                </Typography>
              ))}
              {completionDialog.incompleteItems.features.length > 5 && (
                <Typography variant="body2" sx={{ ml: 2, fontStyle: 'italic' }}>
                  ...and {completionDialog.incompleteItems.features.length - 5} more
                </Typography>
              )}
            </Box>
          )}
          
          {completionDialog.incompleteItems?.issues?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Incomplete Issues ({completionDialog.incompleteItems.issues.length}):
              </Typography>
              {completionDialog.incompleteItems.issues.slice(0, 5).map((issue, index) => (
                <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                  • {issue.name || issue.issue_name || issue.title}
                </Typography>
              ))}
              {completionDialog.incompleteItems.issues.length > 5 && (
                <Typography variant="body2" sx={{ ml: 2, fontStyle: 'italic' }}>
                  ...and {completionDialog.incompleteItems.issues.length - 5} more
                </Typography>
              )}
            </Box>
          )}
          
          <Typography variant="body2" color="text.secondary">
            These items will be available to assign to future releases.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCompletionDialog({ open: false, releaseIndex: null, incompleteItems: [] })}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleReleaseCompletion(completionDialog.releaseIndex, true)}
            variant="contained"
            color="primary"
          >
            Complete Release
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TimelineComponent;
