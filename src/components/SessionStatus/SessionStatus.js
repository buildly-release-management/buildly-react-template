import React from 'react';
import { 
  Chip, 
  Tooltip, 
  IconButton,
  Box
} from '@mui/material';
import { 
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon 
} from '@mui/icons-material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  sessionStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5), // Reduced gap
  },
  sessionChip: {
    fontSize: '0.7rem', // Smaller font
    height: '20px', // Smaller height
    '& .MuiChip-label': {
      padding: '0 6px', // Reduced padding
    },
    '& .MuiChip-icon': {
      fontSize: '0.85rem', // Smaller icon
      marginLeft: '4px',
      marginRight: '-2px',
    },
  },
  warningChip: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
    '& .MuiChip-icon': {
      color: theme.palette.warning.contrastText,
    },
  },
  expiredChip: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    '& .MuiChip-icon': {
      color: theme.palette.error.contrastText,
    },
  },
  validChip: {
    backgroundColor: '#e8f5e8', // Light green background
    color: '#2e7d32', // Darker green text
    border: '1px solid #c8e6c9', // Light green border
    '& .MuiChip-icon': {
      color: '#2e7d32', // Darker green icon
    },
  },
  refreshButton: {
    padding: theme.spacing(0.25), // Smaller padding
    color: theme.palette.text.secondary,
    '& .MuiSvgIcon-root': {
      fontSize: '1rem', // Smaller icon
    },
  },
}));

const SessionStatus = ({ sessionStatus, refreshSession, showRefreshButton = true }) => {
  const classes = useStyles();

  if (!sessionStatus.isValid) {
    return (
      <Box className={classes.sessionStatus}>
        <Chip
          icon={<WarningIcon />}
          label="Session Expired"
          className={`${classes.sessionChip} ${classes.expiredChip}`}
          size="small"
          variant="outlined"
        />
      </Box>
    );
  }

  const chipClass = sessionStatus.isAboutToExpire 
    ? `${classes.sessionChip} ${classes.warningChip}`
    : `${classes.sessionChip} ${classes.validChip}`;

  const chipIcon = sessionStatus.isAboutToExpire ? <WarningIcon /> : <AccessTimeIcon />;

  return (
    <Box className={classes.sessionStatus}>
      {showRefreshButton && (
        <Tooltip title="Refresh session status" arrow>
          <IconButton
            onClick={refreshSession}
            className={classes.refreshButton}
            size="small"
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      
      <Tooltip 
        title={`Session expires in ${sessionStatus.formattedTimeRemaining}${sessionStatus.isAboutToExpire ? ' - Please save your work!' : ''}`}
        arrow
      >
        <Chip
          icon={chipIcon}
          label={sessionStatus.formattedTimeRemaining}
          className={chipClass}
          size="small"
          variant="outlined"
        />
      </Tooltip>
    </Box>
  );
};

export default SessionStatus;
