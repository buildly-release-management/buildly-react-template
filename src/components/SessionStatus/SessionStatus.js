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
    gap: theme.spacing(1),
  },
  sessionChip: {
    fontSize: '0.75rem',
    height: '24px',
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
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    '& .MuiChip-icon': {
      color: theme.palette.success.contrastText,
    },
  },
  refreshButton: {
    padding: theme.spacing(0.5),
    color: theme.palette.text.secondary,
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
      <Tooltip 
        title={`Session expires in ${sessionStatus.formattedTimeRemaining}${sessionStatus.isAboutToExpire ? ' - Please save your work!' : ''}`}
        arrow
      >
        <Chip
          icon={chipIcon}
          label={sessionStatus.formattedTimeRemaining}
          className={chipClass}
          size="small"
        />
      </Tooltip>
      
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
    </Box>
  );
};

export default SessionStatus;
