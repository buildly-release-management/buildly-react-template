import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { IconButton, Slide, Snackbar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useStore } from '@zustand/alert/alertStore';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
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
}));

const Alerts = () => {
  const { data, hideAlert } = useStore();
  const classes = useStyles();
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
    <div className={classes.root}>
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
          classes={{
            root: classes[data.type],
          }}
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
    </div>
  );
};

export default Alerts;
