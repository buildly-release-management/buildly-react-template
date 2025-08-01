import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { Box, Typography, Paper, Button } from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';
import TeamConfigModal from '../../TeamConfigModal';
import { generateAIBudgetEstimate } from '../../../pages/Insights/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const GanttChart = ({ releases = [], title = "Release Timeline", productContext }) => {
  const chartRef = useRef(null);
  const [teamConfigModal, setTeamConfigModal] = useState({ open: false, release: null });
  const [budgetEstimates, setBudgetEstimates] = useState({});
  const [savingBudget, setSavingBudget] = useState(false);

    // Handle team configuration and AI budget generation
  const handleTeamConfig = async (release) => {
    setTeamConfigModal({ open: true, release });
    
    // If we don't have an existing estimate, generate one
    if (!budgetEstimates[release.name]) {
      try {
        const releaseFeatures = release.features || [];
        const estimate = await generateAIBudgetEstimate(release, releaseFeatures);
        setBudgetEstimates(prev => ({
          ...prev,
          [release.name]: estimate
        }));
      } catch (error) {
        console.error('Failed to generate budget estimate:', error);
      }
    }
  };

  // Handle editing existing team configuration
  const handleEditTeam = (release) => {
    setTeamConfigModal({ open: true, release });
  };

  const handleTeamSave = (teamConfig) => {
    const release = teamConfigModal.release;
    if (!release) return;

    const currentEstimate = budgetEstimates[release.name];
    
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
      last_updated: new Date().toISOString(),
      timeline_weeks: currentEstimate?.timeline_weeks || 12,
      confidence: currentEstimate?.confidence || 'Medium',
      risk_buffer: riskBuffer
    };

    setBudgetEstimates(prev => ({
      ...prev,
      [release.name]: updatedEstimate
    }));

    setTeamConfigModal({ open: false, release: null });
  };

  // Calculate optimal date range based on releases with features
  const calculateOptimalDateRange = (releases) => {
    if (!releases || releases.length === 0) return null;

    // Filter releases that have features
    const releasesWithFeatures = releases.filter(release => 
      release.features && release.features.length > 0
    );

    // If no releases have features, use all releases with a note
    const relevantReleases = releasesWithFeatures.length > 0 ? releasesWithFeatures : releases;

    const allDates = [];
    
    relevantReleases.forEach(release => {
      // Add release start and end dates
      if (release.start_date) allDates.push(new Date(release.start_date));
      if (release.end_date) allDates.push(new Date(release.end_date));
      if (release.release_date) allDates.push(new Date(release.release_date));
      if (release.calculated_end_date) allDates.push(new Date(release.calculated_end_date));

      // Add feature completion dates if they exist
      if (release.features) {
        release.features.forEach(feature => {
          if (feature.estimated_completion_date) {
            allDates.push(new Date(feature.estimated_completion_date));
          }
        });
      }
    });

    if (allDates.length === 0) {
      // Fallback: use current date +/- 3 months
      const now = new Date();
      const startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      const endDate = new Date(now);
      endDate.setMonth(now.getMonth() + 3);
      return { startDate, endDate, fallback: true };
    }

    // Sort dates and find range
    allDates.sort((a, b) => a - b);
    const minDate = allDates[0];
    const maxDate = allDates[allDates.length - 1];

    // Add buffer (10% of the total range, minimum 1 week)
    const totalRange = maxDate.getTime() - minDate.getTime();
    const bufferTime = Math.max(totalRange * 0.1, 7 * 24 * 60 * 60 * 1000); // 1 week minimum

    const startDate = new Date(minDate.getTime() - bufferTime);
    const endDate = new Date(maxDate.getTime() + bufferTime);

    return { 
      startDate, 
      endDate, 
      focusedOnFeatures: releasesWithFeatures.length > 0 && releasesWithFeatures.length < releases.length
    };
  };

  // Transform release data into gantt chart format
  const transformDataForGantt = (releases) => {
    if (!releases || releases.length === 0) return null;

    const datasets = releases.map((release, index) => {
      const startDate = new Date(release.start_date || release.release_date);
      const endDate = new Date(release.calculated_end_date || release.end_date || release.release_date);
      
      // Calculate duration in days
      const duration = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));

      return {
        label: release.name,
        data: [{
          x: [startDate, endDate],
          y: index,
        }],
        backgroundColor: release.bgColor || '#F9943B',
        borderColor: release.bgColor || '#F9943B',
        borderWidth: 1,
        barThickness: 20,
        categoryPercentage: 0.8,
        barPercentage: 0.9,
      };
    });

    return {
      labels: releases.map(release => release.name),
      datasets: datasets,
    };
  };

  const data = transformDataForGantt(releases);
  const dateRange = calculateOptimalDateRange(releases);

  // Determine the best time unit based on the date range
  const getOptimalTimeUnit = (dateRange) => {
    if (!dateRange) return 'week';
    
    const totalDays = (dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24);
    
    if (totalDays <= 30) return 'day';      // Less than a month: show days
    if (totalDays <= 90) return 'week';     // Less than 3 months: show weeks
    if (totalDays <= 365) return 'month';   // Less than a year: show months
    return 'quarter';                       // More than a year: show quarters
  };

  const timeUnit = getOptimalTimeUnit(dateRange);

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: dateRange ? 
          (dateRange.focusedOnFeatures ? 
            `Focused Timeline (${releases.filter(r => r.features?.length > 0).length}/${releases.length} releases with features)` :
            dateRange.fallback ? 
              `Timeline View (${releases.length} releases - estimated range)` :
              `Complete Timeline (${releases.length} releases)`) :
          title,
        font: {
          size: 14,
          weight: 'bold'
        },
        color: '#333'
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const release = releases[context[0].dataIndex];
            return release?.name || 'Release';
          },
          label: (context) => {
            const release = releases[context.dataIndex];
            const estimate = budgetEstimates[release.name];
            const startDate = new Date(release.start_date || release.release_date).toLocaleDateString();
            const endDate = new Date(release.calculated_end_date || release.end_date || release.release_date).toLocaleDateString();
            const featureCount = release.features?.length || 0;
            const issueCount = release.issues?.length || 0;
            
            const tooltipLines = [
              `Start: ${startDate}`,
              `End: ${endDate}`,
              `Status: ${release.release_status || 'Unknown'}`,
              `Features: ${featureCount}`,
              `Issues: ${issueCount}`,
              ...(release.calculated_end_date && release.calculated_end_date !== release.release_date ? 
                ['⚡ Extended timeline (feature-driven)'] : [])
            ];

            // Add feature details if available
            if (release.features && release.features.length > 0) {
              tooltipLines.push('', '📋 Features:');
              release.features.slice(0, 3).forEach(feature => {
                const date = feature.estimated_completion_date ? ` (${feature.estimated_completion_date})` : '';
                tooltipLines.push(`  • ${feature.name || feature.feature_name}${date}`);
              });
              if (release.features.length > 3) {
                tooltipLines.push(`  ... and ${release.features.length - 3} more`);
              }
            }

            // Add budget info if available
            if (estimate) {
              tooltipLines.push('', '💰 Budget Estimate:');
              tooltipLines.push(`  Total: $${estimate.total_budget?.toLocaleString()}`);
              tooltipLines.push(`  Timeline: ${estimate.timeline_weeks}w`);
              tooltipLines.push(`  Team: ${estimate.team?.length || 0} roles`);
              tooltipLines.push(`  🤖 AI-generated`);
            } else if (release.totalCost && release.totalCost > 0) {
              tooltipLines.push('', '💰 Current Budget:');
              tooltipLines.push(`  Total: $${release.totalCost.toLocaleString()}`);
            }

            return tooltipLines;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeUnit,
          displayFormats: {
            day: 'MMM dd',
            week: 'MMM dd',
            month: 'MMM yyyy',
            quarter: 'MMM yyyy'
          }
        },
        title: {
          display: true,
          text: `Timeline (${timeUnit}s)`,
        },
        // Set min and max based on optimal range
        ...(dateRange && {
          min: dateRange.startDate,
          max: dateRange.endDate
        }),
      },
      y: {
        title: {
          display: true,
          text: 'Releases',
        },
        ticks: {
          callback: function(value, index) {
            return releases[index]?.name || `Release ${index + 1}`;
          }
        }
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const element = elements[0];
        const release = releases[element.index];
        if (release) {
          // TODO: Navigate to release details
          console.log('Navigate to release:', release);
        }
      }
    },
  };

  if (!data || releases.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No release data available for Gantt chart
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Create releases with start and end dates to see the timeline view.
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1} sx={{ fontStyle: 'italic' }}>
          💡 The chart automatically focuses on periods with features for better visibility.
        </Typography>
      </Paper>
    );
  }

  // Check if we have any releases with features to show a helpful message
  const releasesWithFeatures = releases.filter(r => r.features?.length > 0);
  const hasOptimizedView = releasesWithFeatures.length > 0 && releasesWithFeatures.length < releases.length;
  const noFeaturesAnywhere = releasesWithFeatures.length === 0;

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {hasOptimizedView && (
          <Typography variant="body2" color="text.secondary" mb={2} sx={{ 
            backgroundColor: '#E3F2FD', 
            padding: '8px 12px', 
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            🔍 Focused view: Showing {releasesWithFeatures.length} of {releases.length} releases with features. 
            Chart automatically zooms to relevant timeline periods.
          </Typography>
        )}
        {noFeaturesAnywhere && (
          <Typography variant="body2" color="text.secondary" mb={2} sx={{ 
            backgroundColor: '#FFF3E0', 
            padding: '8px 12px', 
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            ⚠️ No releases have features yet. Add features to releases to see a more detailed timeline.
          </Typography>
        )}
        <Box sx={{ height: Math.max(300, releases.length * 60), width: '100%' }}>
          <Bar 
            ref={chartRef}
            data={data} 
            options={options} 
          />
        </Box>
      </Paper>

      {/* Budget Summary Panel */}
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          💰 Budget Overview
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
          {releases.map((release) => {
            const estimate = budgetEstimates[release.name];
            const hasExistingBudget = release.totalCost && release.totalCost > 0;
            
            return (
              <Paper 
                key={release.name}
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  backgroundColor: release.bgColor + '10',
                  borderColor: release.bgColor
                }}
              >
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {release.name}
                </Typography>
                
                <Box sx={{ mb: 2, fontSize: '0.875rem' }}>
                  <Typography variant="body2" color="text.secondary">
                    📋 {release.features?.length || 0} Features • 🐛 {release.issues?.length || 0} Issues
                  </Typography>
                </Box>

                {estimate ? (
                  <Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 2
                    }}>
                      <Typography variant="h6" color="primary">
                        ${estimate.total_budget?.toLocaleString()}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEditTeam(release)}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        ✏️ Edit Team
                      </Button>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        📅 Timeline: {estimate.timeline_weeks} weeks • 
                        <span style={{ marginLeft: '8px' }}>🎯 {estimate.confidence} confidence</span>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        💰 Weekly burn: ${(estimate.total_budget / estimate.timeline_weeks).toLocaleString()}
                      </Typography>
                    </Box>

                    {/* Team Composition */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 'bold',
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        👥 Team ({estimate.team?.length || 0} roles)
                      </Typography>
                      
                      <Box sx={{ maxHeight: 120, overflowY: 'auto' }}>
                        {estimate.team?.map((member, idx) => (
                          <Box key={idx} sx={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1,
                            mb: 0.5,
                            backgroundColor: 'rgba(0,0,0,0.04)',
                            borderRadius: 1,
                            border: '1px solid rgba(0,0,0,0.1)'
                          }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                                {member.role} ({member.count})
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ${member.weeklyRate}/week each
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                                ${(member.count * member.weeklyRate * estimate.timeline_weeks).toLocaleString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ${(member.count * member.weeklyRate).toLocaleString()}/week
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    <Box sx={{ 
                      p: 1,
                      backgroundColor: estimate.estimation_source === 'ai' ? 'rgba(156, 39, 176, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                      borderRadius: 1,
                      textAlign: 'center'
                    }}>
                      <Typography variant="caption" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: 0.5,
                        fontSize: '0.75rem'
                      }}>
                        {estimate.estimation_source === 'ai' ? '🤖 AI-generated' : '👤 User-configured'} • 
                        Risk buffer: {estimate.risk_buffer}%
                      </Typography>
                    </Box>
                  </Box>
                ) : hasExistingBudget ? (
                  <Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 2
                    }}>
                      <Typography variant="h6" color="info.main">
                        ${release.totalCost?.toLocaleString()}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleTeamConfig(release)}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        ⚙️ Configure
                      </Button>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Current budget • Team: {release.team?.length || 0} members
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      📊 Generate detailed budget & team estimates
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AutoAwesome />}
                      onClick={() => handleTeamConfig(release)}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Configure Team & Budget
                    </Button>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>

        {Object.keys(budgetEstimates).length > 0 && (
          <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1 
              }}>
                📊 Project Totals
              </Typography>
              
              {/* Save Budget Options */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleSaveBudget('release')}
                  sx={{ fontSize: '0.7rem', px: 1 }}
                >
                  💾 Save This Release
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleSaveBudget('future')}
                  sx={{ fontSize: '0.7rem', px: 1 }}
                >
                  🔮 Save Future Releases
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleSaveBudget('product')}
                  sx={{ fontSize: '0.7rem', px: 1 }}
                >
                  🏢 Save Entire Product
                </Button>
              </Box>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" color="primary">
                ${Object.values(budgetEstimates).reduce((sum, est) => sum + (est.total_budget || 0), 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total estimated budget for {Object.keys(budgetEstimates).length} releases
              </Typography>
            </Box>

            {/* Team Summary */}
            <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'white', borderRadius: 1, border: '1px solid rgba(0,0,0,0.1)' }}>
              <Typography variant="subtitle2" sx={{ fontSize: '0.875rem', mb: 1 }}>
                👥 Total Team Overview
              </Typography>
              
              {(() => {
                // Aggregate all team roles across releases
                const allRoles = {};
                let totalWeeklyBurn = 0;
                let totalWeeks = 0;
                
                Object.values(budgetEstimates).forEach(estimate => {
                  if (estimate.team) {
                    estimate.team.forEach(member => {
                      if (!allRoles[member.role]) {
                        allRoles[member.role] = { count: 0, weeklyRate: member.weeklyRate };
                      }
                      allRoles[member.role].count += member.count;
                    });
                    totalWeeklyBurn += estimate.total_budget / estimate.timeline_weeks;
                    totalWeeks = Math.max(totalWeeks, estimate.timeline_weeks);
                  }
                });

                return (
                  <Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1, mb: 1 }}>
                      {Object.entries(allRoles).map(([role, data]) => (
                        <Box key={role} sx={{ 
                          fontSize: '0.75rem',
                          p: 0.5,
                          backgroundColor: 'rgba(0,0,0,0.04)',
                          borderRadius: 0.5
                        }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            {role}: {data.count}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Weekly burn rate: ${totalWeeklyBurn.toLocaleString()} • 
                      Peak timeline: {totalWeeks} weeks
                    </Typography>
                  </Box>
                );
              })()}
            </Box>
          </Box>
        )}
      </Paper>

      <TeamConfigModal
        open={teamConfigModal.open}
        onClose={() => setTeamConfigModal({ open: false, release: null })}
        onSave={handleTeamSave}
        release={teamConfigModal.release}
        initialTeam={teamConfigModal.release ? budgetEstimates[teamConfigModal.release.name]?.team : []}
      />
    </>
  );
};

export default GanttChart;
