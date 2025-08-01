import _ from 'lodash';
import moment from 'moment-timezone';
import React from 'react';
import { Box, LinearProgress, Typography, Chip, Link } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components for better score visualization
const ScoreContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  minWidth: '120px',
}));

const ScoreProgress = styled(LinearProgress)(({ theme, scorecolor }) => ({
  height: '8px',
  borderRadius: '4px',
  backgroundColor: '#E5E7EB',
  flex: 1,
  '& .MuiLinearProgress-bar': {
    backgroundColor: scorecolor || theme.palette.primary.main,
    borderRadius: '4px',
  },
}));

const ScoreText = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  color: '#374151',
  minWidth: '35px',
}));

// Function to get color based on score
const getScoreColor = (score, maxScore = 20) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return '#10B981'; // Green
  if (percentage >= 60) return '#F59E0B'; // Yellow
  if (percentage >= 40) return '#EF4444'; // Red
  return '#6B7280'; // Gray
};

// Component to render score with progress bar
const ScoreDisplay = ({ score, maxScore = 20, label }) => {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const color = getScoreColor(score, maxScore);
  
  return (
    <ScoreContainer>
      <ScoreProgress 
        variant="determinate" 
        value={percentage} 
        scorecolor={color}
      />
      <ScoreText>
        {score}/{maxScore}
      </ScoreText>
    </ScoreContainer>
  );
};

// Component to render release information
const ReleaseInfo = ({ product }) => {
  // This would need to be connected to actual release data
  // For now, showing placeholder structure
  const latestRelease = product?.latest_release;
  const currentRelease = product?.current_release;
  
  return (
    <Box>
      {latestRelease && (
        <Box mb={0.5}>
          <Chip 
            size="small" 
            label={`Latest: ${latestRelease.version || 'v1.0.0'}`}
            color="success"
            variant="outlined"
          />
        </Box>
      )}
      {currentRelease && (
        <Box>
          <Chip 
            size="small" 
            label={`Working: ${currentRelease.version || 'v1.1.0'}`}
            color="primary"
            variant="outlined"
          />
        </Box>
      )}
      {!latestRelease && !currentRelease && (
        <Typography variant="caption" color="text.secondary">
          No releases
        </Typography>
      )}
    </Box>
  );
};

export const productColumns = [
  {
    name: 'name',
    label: 'Product Name',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value, tableMeta) => {
        const product = tableMeta.rowData;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {value || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {product[1] ? product[1].substring(0, 50) + '...' : ''}
            </Typography>
          </Box>
        );
      },
    },
  },
  {
    name: 'description',
    label: 'Description',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      display: false, // Hidden since we show it in the name column
      customBodyRender: (value) => value || '-',
    },
  },
  {
    name: 'product_info',
    label: 'Complexity Score',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (info) => {
        const score = (info && info.complexity_score) || 0;
        return <ScoreDisplay score={score} maxScore={20} label="Complexity" />;
      },
    },
  },
  {
    name: 'product_info',
    label: 'Cost Score',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (info) => {
        const score = (info && info.cost_score) || 0;
        return <ScoreDisplay score={score} maxScore={20} label="Cost" />;
      },
    },
  },
  {
    name: 'releases',
    label: 'Release Status',
    options: {
      sort: false,
      filter: false,
      customBodyRender: (value, tableMeta) => {
        const product = tableMeta.rowData[0]; // Get the full product data
        return <ReleaseInfo product={value} />;
      },
    },
  },
  {
    name: 'edit_date',
    label: 'Last Updated',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (
        <Typography variant="caption">
          {value ? moment(value).format('MMM DD, YYYY') : '-'}
        </Typography>
      ),
    },
  },
];

export const getProductsData = (products) => {
  let finalProducts = [];
  _.forEach(products, (prod) => {
    if (prod) {
      const product = {
        ...prod,
        product_name: prod?.name,
        // Add mock release data - this should be connected to actual release API
        releases: {
          latest_release: prod?.latest_release || { version: 'v1.0.0', date: '2024-01-15' },
          current_release: prod?.current_release || { version: 'v1.1.0', date: '2024-02-01' },
        },
      };
      finalProducts = [...finalProducts, product];
    }
  });
  return finalProducts;
};
