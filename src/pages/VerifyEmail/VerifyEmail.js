import React, { useEffect } from 'react';
import _ from 'lodash';
import makeStyles from '@mui/styles/makeStyles';
import useAlert from '@hooks/useAlert';
import { Typography } from '@mui/material';
import Loader from '@components/Loader/Loader';
import { routes } from '@routes/routesConstants';
import { useVerifyEmailMutation } from '../../react-query/mutations/authUser/verifyEmailMutation';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const VerifyEmail = ({ history }) => {
  const classes = useStyles();

  const { displayAlert } = useAlert();

  const { mutate: verifyEmailMutation, isLoading: isVerifyEmailLoading, isError: verifyEmailError } = useVerifyEmailMutation(history, routes.LOGIN, displayAlert);

  useEffect(() => {
    const path = window.location.pathname;
    const parts = path.split('/');
    const token = parts[parts.length - 1];
    const data = {
      token,
    };
    verifyEmailMutation(data);
  }, []);

  return (
    <div className={classes.root}>
      {isVerifyEmailLoading && <Loader open={isVerifyEmailLoading} />}
      {isVerifyEmailLoading && (
        <Typography variant="h5" component="h5">
          Verifying email using the verification link
        </Typography>
      )}
      {verifyEmailError && (
        <Typography variant="h5" component="h5">
          Something doesn't seem right. Please check the link and try again.
        </Typography>
      )}
    </div>
  );
};

export default VerifyEmail;
