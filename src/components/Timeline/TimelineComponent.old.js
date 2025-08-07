import React, { useEffect, useState, useMemo } from 'react';
import './TimelineComponent.css';
import { Timeline, TimelineEvent } from '@mailtop/horizontal-timeline';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Chip } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

const TimelineComponent = ({ reportData, suggestedFeatures, onReleaseClick, productContext }) => {
  const [releaseData, setReleaseData] = useState([]);
  const [features, setFeatures] = useState([]);
  const [expandedFeatures, setExpandedFeatures] = useState({});

  useEffect(() => {
    setReleaseData(reportData || []);
  }, [reportData]);

  useEffect(() => {
    setFeatures(suggestedFeatures);
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

  // Toggle feature expansion
  const toggleFeatureExpansion = (releaseIndex) => {
    setExpandedFeatures(prev => ({
      ...prev,
      [releaseIndex]: !prev[releaseIndex]
    }));
  };

  // Calculate the effective end date of a release based on feature completion dates
  const calculateReleaseEndDate = (features, defaultReleaseDate) => {
    if (!features || features.length === 0) {
      return defaultReleaseDate;
    }

    const completionDates = features
      .map(f => f.estimated_completion_date)
      .filter(date => date)
      .map(date => new Date(date))
      .sort((a, b) => b - a); // Sort descending to get latest date

    if (completionDates.length === 0) {
      return defaultReleaseDate;
    }

    // Use the latest feature completion date, but add buffer
    const latestFeatureDate = completionDates[0];
    const bufferDays = 7; // 1 week buffer for testing and finalization
    latestFeatureDate.setDate(latestFeatureDate.getDate() + bufferDays);

    return latestFeatureDate.toISOString().split('T')[0];
  };

  // Enhanced feature rendering with accordion for overflow
  const renderFeatureList = (release, releaseIndex) => {
    const features = release.features || [];
    const maxVisible = 5;
    const hasOverflow = features.length > maxVisible;
    const isExpanded = expandedFeatures[releaseIndex];
    const visibleFeatures = isExpanded ? features : features.slice(0, maxVisible);

    if (features.length === 0) return null;

    return (
      <div style={{ 
        marginTop: '12px', 
        padding: '10px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '6px',
        fontSize: '11px'
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          marginBottom: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          <span>📋 Features ({features.length})</span>
          {hasOverflow && (
            <Chip
              size="small"
              label={isExpanded ? 'Show Less' : `+${features.length - maxVisible} More`}
              onClick={() => toggleFeatureExpansion(releaseIndex)}
              sx={{
                height: '20px',
                fontSize: '10px',
                cursor: 'pointer',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'inherit',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                }
              }}
            />
          )}
        </div>
        
        <div style={{ position: 'relative', paddingLeft: '10px' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute',
            left: '15px',
            top: '0',
            bottom: '0',
            width: '2px',
            background: 'linear-gradient(to bottom, #4CAF50, #2196F3)',
            opacity: 0.6
          }} />
          
          {visibleFeatures.map((feature, index) => (
            <div 
              key={`feat-${releaseIndex}-${index}`}
              style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: '6px',
                padding: '6px 8px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                position: 'relative',
                marginLeft: '20px',
                maxWidth: '300px', // Prevent overflow
                overflow: 'hidden'
              }}
            >
              {/* Timeline dot */}
              <div style={{
                position: 'absolute',
                left: '-30px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: feature.estimation_source === 'ai' ? '#4CAF50' : '#FFC107',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ 
                  fontWeight: 'bold',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '250px'
                }}>
                  {feature.name || feature.feature_name}
                </div>
                <div style={{ 
                  fontSize: '10px',
                  opacity: 0.8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>
                    📅 {feature.estimated_completion_date || 'TBD'}
                  </span>
                  <span style={{ 
                    color: feature.estimation_source === 'ai' ? '#4CAF50' : '#FFC107',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}>
                    {feature.estimation_source === 'ai' ? '🤖 AI' : '📊 Est'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple budget display for timeline view
  const renderBudgetSection = (release) => {
    const hasExistingBudget = release.totalCost && release.totalCost > 0;

    return (
      <div style={{ 
        marginTop: '8px', 
        padding: '8px',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: '4px',
        fontSize: '11px'
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>💰 Budget Info</span>
        </div>

        {hasExistingBudget ? (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}>
              <span>Budget:</span>
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                ${release.totalCost?.toLocaleString()}
              </span>
            </div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>
              Team: {release.team?.length || 0} roles • {release.duration?.weeks || 0} weeks
            </div>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center',
            fontSize: '10px',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.7)'
          }}>
            📊 Configure budget in Estimates & Team section
          </div>
        )}
      </div>
    );
  };
    const hasExistingBudget = release.totalCost && release.totalCost > 0;

    return (
      <div style={{ 
        marginTop: '8px', 
        padding: '8px',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: '4px',
        fontSize: '11px'
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>💰 Budget Info</span>
        </div>

        {hasExistingBudget ? (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}>
              <span>Budget:</span>
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                ${release.totalCost?.toLocaleString()}
              </span>
            </div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>
              Team: {release.team?.length || 0} roles • {release.duration?.weeks || 0} weeks
            </div>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center',
            fontSize: '10px',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.7)'
          }}>
            📊 Configure budget in Estimates & Team section
          </div>
        )}
      </div>
    );
  };

  // Handle editing existing team configuration
  const handleEditTeam = (release) => {
    setSelectedRelease(release);
    setTeamConfigModal({ open: true, release });
  };

  // Handle team configuration save with budget recalculation
  const handleTeamSave = (teamConfig) => {
    if (!selectedRelease) return;

    const currentEstimate = budgetEstimates[selectedRelease.name];
    
    // Recalculate budget based on new team configuration
    const totalCost = teamConfig.reduce((sum, member) => {
      return sum + (member.count * member.weeklyRate * (currentEstimate?.timeline_weeks || 12));
    }, 0);

    // Apply risk buffer
    const riskBuffer = currentEstimate?.risk_buffer || 20;
    const bufferedCost = totalCost * (1 + riskBuffer / 100);

    const updatedEstimate = {
      ...currentEstimate,
      team: teamConfig,
      total_budget: Math.round(bufferedCost),
      base_cost: Math.round(totalCost),
      estimation_source: 'user_configured',
      last_updated: new Date().toISOString()
    };

    setBudgetEstimates(prev => ({
      ...prev,
      [selectedRelease.name]: updatedEstimate
    }));

    setTeamConfigModal({ open: false, release: null });
    setSelectedRelease(null);
  };

  // Render feature timeline under each release
  const renderFeatureTimeline = (release) => {
    if (!release.features || release.features.length === 0) {
      return (
        <div style={{ 
          marginTop: '8px', 
          padding: '8px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '4px',
          fontSize: '11px',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          📝 No features defined for this release
        </div>
      );
    }

    const sortedFeatures = [...release.features].sort((a, b) => {
      const dateA = new Date(a.estimated_completion_date || release.release_date);
      const dateB = new Date(b.estimated_completion_date || release.release_date);
      return dateA - dateB;
    });

    return (
      <div style={{ 
        marginTop: '8px', 
        padding: '8px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '4px',
        fontSize: '11px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          📅 Feature Timeline ({release.features.length} features)
          <div style={{ 
            height: '2px', 
            flex: 1, 
            background: 'linear-gradient(to right, rgba(255,255,255,0.3), transparent)',
            marginLeft: '8px'
          }} />
        </div>
        
        {/* Feature lines with visual timeline */}
        <div style={{ position: 'relative', paddingLeft: '10px' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute',
            left: '15px',
            top: '0',
            bottom: '0',
            width: '2px',
            background: 'linear-gradient(to bottom, #4CAF50, #2196F3)',
            opacity: 0.6
          }} />
          
          {sortedFeatures.map((feature, index) => (
            <div 
              key={`timeline-feat-${index}`}
              style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: '6px',
                padding: '4px 8px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                position: 'relative',
                marginLeft: '20px'
              }}
            >
              {/* Timeline dot */}
              <div style={{
                position: 'absolute',
                left: '-30px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: feature.estimation_source === 'ai' ? '#4CAF50' : '#FFC107',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ 
                  fontWeight: 'bold',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {feature.name || feature.feature_name}
                </div>
                <div style={{ 
                  fontSize: '10px',
                  opacity: 0.8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>
                    📅 {feature.estimated_completion_date || 'TBD'}
                  </span>
                  <span style={{ 
                    color: feature.estimation_source === 'ai' ? '#4CAF50' : '#FFC107',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}>
                    {feature.estimation_source === 'ai' ? '🤖 AI' : '📊 Est'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {release.features.length > 5 && (
          <div style={{ 
            fontSize: '10px', 
            fontStyle: 'italic', 
            textAlign: 'center',
            marginTop: '8px',
            padding: '4px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '4px'
          }}>
            ⬆️ Showing first 5 features • {release.features.length - 5} more available
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Timeline height={560} placeholder>
        {(
          releaseData && releaseData.map((releaseItem, idx) => (
            <TimelineEvent
              key={idx}
              color={releaseItem.bgColor}
              icon={releaseItem.icon}
              title={
                <div>
                  <span 
                    style={{ cursor: onReleaseClick ? 'pointer' : 'default', color: '#0C5595' }}
                    onClick={() => onReleaseClick && onReleaseClick(releaseItem)}
                  >
                    {releaseItem.name}
                  </span>
                  {releaseItem.calculated_end_date && releaseItem.calculated_end_date !== releaseItem.release_date && (
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#666', 
                      marginTop: '2px',
                      fontStyle: 'italic'
                    }}>
                      Extended to: {releaseItem.calculated_end_date}
                    </div>
                  )}
                </div>
              }
              subtitle={`Target: ${releaseItem.release_date}`}
              action={(
                <div
                  className="release-summary"
                  style={{
                    backgroundColor: releaseItem.bgColor,
                    padding: '12px 16px',
                    borderRadius: '8px',
                    color: releaseItem.bgColor === '#0C5594'
                      || releaseItem.bgColor === '#152944'
                      ? '#fff'
                      : '#000',
                    minWidth: '400px',
                    maxWidth: '500px',
                  }}
                >
                  <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                    Release Summary
                  </div>
                  
                  <div style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '8px' }}>
                    <div style={{ marginBottom: '4px' }}>
                      📋 <strong>{releaseItem.features?.length || 0}</strong> Features
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      🐛 <strong>{releaseItem.issues?.length || 0}</strong> Issues
                    </div>
                    {releaseItem.calculated_end_date && releaseItem.calculated_end_date !== releaseItem.release_date && (
                      <div style={{ marginBottom: '4px', fontSize: '12px' }}>
                        ⏱️ <strong>Extended timeline</strong> (feature-driven)
                      </div>
                    )}
                  </div>

                  {/* Feature Timeline Section */}
                  {renderFeatureTimeline(releaseItem)}
                  
                  {/* Budget and Team Section */}
                  {renderBudgetSection(releaseItem)}
                
                {releaseItem && releaseItem.features && releaseItem.features.length > 0 ? (
                  <div style={{ marginBottom: '8px', marginTop: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                      📋 Feature Details
                    </div>
                    <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                      {releaseItem.features.slice(0, 3).map((feature, index) => (
                        <div key={`feat-${index}`} style={{ marginBottom: '2px' }}>
                          • {feature.name || feature.feature_name}
                          {feature.estimated_completion_date && (
                            <span style={{ 
                              fontSize: '10px', 
                              color: 'rgba(255,255,255,0.7)',
                              marginLeft: '8px'
                            }}>
                              ({feature.estimated_completion_date})
                            </span>
                          )}
                        </div>
                      ))}
                      {releaseItem.features.length > 3 && (
                        <div style={{ fontStyle: 'italic', color: 'rgba(0,0,0,0.7)' }}>
                          ...and {releaseItem.features.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {releaseItem && releaseItem.issues && releaseItem.issues.length > 0 ? (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                      🐛 Issues ({releaseItem.issues.length})
                    </div>
                    <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                      {releaseItem.issues.slice(0, 2).map((issue, index) => (
                        <div key={`issue-${index}`} style={{ marginBottom: '2px' }}>
                          • {issue.name || issue.issue_name}
                        </div>
                      ))}
                      {releaseItem.issues.length > 2 && (
                        <div style={{ fontStyle: 'italic', color: 'rgba(0,0,0,0.7)' }}>
                          ...and {releaseItem.issues.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {features && features.length > 0 && (!releaseItem.features || releaseItem.features.length === 0) ? (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                      💡 Suggested Features
                    </div>
                    <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                      {features.slice(0, 2).map((feature, index) => (
                        <div key={`sug-feat-${index}`} style={{ marginBottom: '2px' }}>
                          • {feature?.suggested_feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div 
                  style={{ 
                    fontSize: '11px', 
                    textAlign: 'center', 
                    marginTop: '8px',
                    padding: '4px 8px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => onReleaseClick && onReleaseClick(releaseItem)}
                >
                  📋 View Release Details
                </div>
              </div>
            )}
          />
        ))
      )}
    </Timeline>
  </>
  );
};

export default TimelineComponent;
