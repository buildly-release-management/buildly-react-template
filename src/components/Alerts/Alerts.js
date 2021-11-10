import React from 'react';
import { connect } from 'react-redux';
import { makeStyles, Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { hideAlert } from '@redux/alert/actions/alert.actions';

const Alert = (props) => <MuiAlert elevation={6} variant="filled" {...props} />;

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

const Alerts = ({ data, dispatch }) => {
  const classes = useStyles();
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideAlert());
  };
  return (
    <div className={classes.root}>
      <Snackbar
        open={data ? data.open : false}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {data && (
          <Alert onClose={handleClose} severity={data.type}>
            {data.message}
          </Alert>
        )}
      </Snackbar>
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.alertReducer,
});

export default connect(mapStateToProps)(Alerts);
