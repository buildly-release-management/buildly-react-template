import React, { useEffect, useRef } from 'react';
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
import { Box, Typography, Paper } from '@mui/material';
import { devLog } from '../../../utils/devLogger';

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
          devLog.log('Navigate to release:', release);
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
    </>
  );
};

export default GanttChart;
