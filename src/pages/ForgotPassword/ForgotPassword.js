import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import {
  Button,
  CssBaseline,
  TextField,
  Link,
  Grid,
  Card,
  CardContent,
  Typography,
  Container,
} from '@mui/material';
import logo from '@assets/buildly-product-labs-logo.png';
import Copyright from '@components/Copyright/Copyright';
import Loader from '@components/Loader/Loader';
import { useInput } from '@hooks/useInput';
import useAlert from '@hooks/useAlert';
import { routes } from '@routes/routesConstants';
import { validators } from '@utils/validators';
import { useSendPasswordResetLinkMutation } from '../../react-query/mutation/authUser/sendPasswordResetLinkMutation';

const useStyles = makeStyles((theme) => ({
  logoDiv: {
    width: '100%',
    textAlign: 'center',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2.5),
  },
  logo: {
    width: theme.spacing(40),
    objectFit: 'contain',
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  submit: {
    marginBottom: theme.spacing(2),
  },
  textField: {
    minHeight: '5rem',
    margin: '0.25rem 0',
  },
  loadingWrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
}));

const ForgotPassword = () => {
  const classes = useStyles();
  const email = useInput('', { required: true });
  const [error, setError] = useState({});

  const { displayAlert } = useAlert();

  const { mutate: sendPasswordResetLinkMutation, isLoading: isSendPasswordResetLinkLoading } = useSendPasswordResetLinkMutation(displayAlert);

  const handleSubmit = (event) => {
    event.preventDefault();
    const loginFormValue = {
      email: email.value,
    };
    sendPasswordResetLinkMutation(loginFormValue);
  };

  const handleBlur = (e, validation, input) => {
    const validateObj = validators(validation, input);
    const prevState = { ...error };
    if (validateObj && validateObj.error) {
      setError({
        ...prevState,
        [e.target.id]: validateObj,
      });
    } else {
      setError({
        ...prevState,
        [e.target.id]: {
          error: false,
          message: '',
        },
      });
    }
  };

  const submitDisabled = () => {
    const errorKeys = Object.keys(error);
    if (!email.value) return true;
    // eslint-disable-next-line consistent-return
    errorKeys.forEach((key) => {
      if (error[key].error) return true;
    });
    return false;
  };

  return (
    <>
      {isSendPasswordResetLinkLoading && <Loader open={isSendPasswordResetLinkLoading} />}
      <div className={classes.logoDiv}>
        <img src={logo} alt="Logo" className={classes.logo} />
      </div>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Card variant="outlined">
          <CardContent>
            <div className={classes.paper}>
              <Typography component="h1" variant="h5" gutterBottom>
                Enter your registered Email
              </Typography>
              <form className={classes.form} noValidate onSubmit={handleSubmit}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Registered email"
                  name="email"
                  autoComplete="email"
                  className={classes.textField}
                  error={error.email && error.email.error}
                  helperText={error && error.email ? error.email.message : ''}
                  onBlur={(e) => handleBlur(e, 'email', email)}
                  {...email.bind}
                />
                <div className={classes.loadingWrapper}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    disabled={isSendPasswordResetLinkLoading || submitDisabled()}
                  >
                    Submit
                  </Button>
                </div>
                <Grid container>
                  <Grid item xs>
                    <Link href={routes.LOGIN} variant="body2" color="secondary">
                      Go back to Sign in
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link
                      href={routes.REGISTER}
                      variant="body2"
                      color="secondary"
                    >
                      Don't have an account? Register
                    </Link>
                  </Grid>
                </Grid>
              </form>
            </div>
          </CardContent>
        </Card>
      </Container>
      <Copyright />
    </>
  );
};

export default ForgotPassword;
