import React from 'react';
import { IconButton, Slide, Snackbar, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useStore } from '@zustand/alert/alertStore';

// Define styles object for different alert types
const alertStyles = {
  success: {
    backgroundColor: '#009900',
    color: '#000',
    whiteSpace: 'pre-wrap',
  },
  info: {
    backgroundColor: '#0099CC',
    color: '#000',
    whiteSpace: 'pre-wrap',
  },
  warning: {
    backgroundColor: '#FFCC33',
    color: '#000',
    whiteSpace: 'pre-wrap',
  },
  error: {
    backgroundColor: '#FF0033',
    color: '#000',
    whiteSpace: 'pre-wrap',
  },
};

const Alerts = () => {
  const { data, hideAlert } = useStore();
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    hideAlert();
    if (data && data.onClose) {
      data.onClose(data.id);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        '& > * + *': {
          marginTop: 2,
        },
      }}
    >
      {data && (
        <Snackbar
          key={`${data.type}-${data.message}`}
          open={data.open || false}
          autoHideDuration={10000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          message={data.message}
          TransitionComponent={(props) => (
            <Slide {...props} direction="left" />
          )}
          sx={alertStyles[data.type] || alertStyles.info}
          action={(
            <>
              <IconButton
                aria-label="close"
                color="inherit"
                sx={{ p: 0.5 }}
                onClick={handleClose}
              >
                <CloseIcon />
              </IconButton>
            </>
          )}
        />
      )}
    </Box>
  );
};

export default Alerts;
