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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const GanttChart = ({ releases = [], title = "Release Timeline" }) => {
  const chartRef = useRef(null);

  // Transform release data into gantt chart format
  const transformDataForGantt = (releases) => {
    if (!releases || releases.length === 0) return null;

    const datasets = releases.map((release, index) => {
      const startDate = new Date(release.start_date || release.release_date);
      const endDate = new Date(release.end_date || release.release_date);
      
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

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
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
            const endDate = new Date(release.end_date || release.release_date).toLocaleDateString();
            return [
              `Start: ${startDate}`,
              `End: ${endDate}`,
              `Status: ${release.release_status || 'Unknown'}`,
              `Features: ${release.features?.length || 0}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'week',
          displayFormats: {
            week: 'MMM dd'
          }
        },
        title: {
          display: true,
          text: 'Timeline',
        },
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
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height: Math.max(300, releases.length * 60), width: '100%' }}>
        <Bar 
          ref={chartRef}
          data={data} 
          options={options} 
        />
      </Box>
    </Paper>
  );
};

export default GanttChart;
