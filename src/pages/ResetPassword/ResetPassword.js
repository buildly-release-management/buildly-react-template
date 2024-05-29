import React, { useState } from 'react';
import { connect } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';
import {
  Button,
  CssBaseline,
  TextField,
  Link,
  Card,
  CardContent,
  Typography,
  Container,
  Grid,
} from '@mui/material';
import logo from '@assets/buildly-product-labs-logo.png';
import Copyright from '@components/Copyright/Copyright';
import Loader from '@components/Loader/Loader';
import { useInput } from '@hooks/useInput';
import { resetPassword } from '@redux/authuser/actions/authuser.actions';
import { routes } from '@routes/routesConstants';
import { validators } from '@utils/validators';
import { isMobile } from '@utils/mediaQuery';

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
    marginTop: theme.spacing(1),
  },
  textField: {
    minHeight: '5rem',
    margin: theme.spacing(1, 0),
  },
  submit: {
    marginBottom: theme.spacing(2),
  },
  loadingWrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
}));

const ResetPassword = ({
  dispatch, loading, history, location,
}) => {
  const classes = useStyles();
  const password = useInput('', { required: true });
  const re_password = useInput('', {
    required: true,
    confirm: true,
    matchField: password,
  });

  const [formError, setFormError] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    const [uid, token] = location.pathname
      .substring(
        location.pathname.indexOf(routes.RESET_PASSWORD) + 1,
        location.pathname.lastIndexOf('/'),
      )
      .split('/')
      .slice(1);
    if (location.pathname.includes(routes.RESET_PASSWORD)) {
      const resetPasswordFormValue = {
        new_password1: password.value,
        new_password2: re_password.value,
        uid,
        token,
      };
      dispatch(resetPassword(resetPasswordFormValue, history));
    }
  };

  const handleBlur = (e, validation, input) => {
    const validateObj = validators(validation, input);
    const prevState = { ...formError };
    if (validateObj && validateObj.error) {
      setFormError({
        ...prevState,
        [e.target.id]: validateObj,
      });
    } else {
      setFormError({
        ...prevState,
        [e.target.id]: {
          error: false,
          message: '',
        },
      });
    }
  };

  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    let errorExists = false;
    if (!password.value || !re_password.value) return true;
    errorKeys.forEach((key) => {
      if (formError[key].error) errorExists = true;
    });
    return errorExists;
  };

  return (
    <>
      {loading && <Loader open={loading} />}
      <div className={classes.logoDiv}>
        <img src={logo} alt="Logo" className={classes.logo} />
      </div>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Card variant="outlined">
          <CardContent>
            <div className={classes.paper}>
              <Typography component="h1" variant="h5">
                Reset your Password
              </Typography>
              <form className={classes.form} noValidate onSubmit={handleSubmit}>
                <Grid container spacing={isMobile() ? 0 : 2}>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="New Password"
                      type="password"
                      id="password"
                      autoComplete="current-password"
                      className={classes.textField}
                      error={formError.password && formError.password.error}
                      helperText={
                        formError.password ? formError.password.message : ''
                      }
                      onBlur={(e) => handleBlur(e, 'required', password)}
                      {...password.bind}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="re_password"
                      label="Confirm Password"
                      name="re_password"
                      type="password"
                      autoComplete="re_password"
                      className={classes.textField}
                      error={
                        formError.re_password && formError.re_password.error
                      }
                      helperText={
                        formError.re_password
                          ? formError.re_password.message
                          : ''
                      }
                      onBlur={(e) => handleBlur(e, 'confirm', re_password)}
                      {...re_password.bind}
                    />
                  </Grid>
                </Grid>
                <div className={classes.loadingWrapper}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    disabled={loading || submitDisabled()}
                  >
                    Submit
                  </Button>
                </div>
                <Grid container>
                  <Grid item>
                    <Link href={routes.LOGIN} variant="body2" color="secondary">
                      Go back to Sign in
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

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.authReducer,
});

export default connect(mapStateToProps)(ResetPassword);
