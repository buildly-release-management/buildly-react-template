import React, { useState, useEffect } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { useLocation } from 'react-router-dom';
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
// import GithubLogin from '@components/SocialLogin/GithubLogin';
import Loader from '@components/Loader/Loader';
import { useInput } from '@hooks/useInput';
import useAlert from '@hooks/useAlert';
import { routes } from '@routes/routesConstants';
import { validators } from '@utils/validators';
import { useResetPasswordCheckMutation } from '@react-query/mutations/authUser/resetPasswordCheckMutation';
import { useLoginMutation } from '@react-query/mutations/authUser/loginMutation';
import { useSocialLoginMutation } from '@react-query/mutations/authUser/socialLoginMutation';

const useStyles = makeStyles((theme) => ({
  logoDiv: {
    width: theme.spacing(26),
    margin: 'auto',
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(2.5),
  },
  logo: {
    width: theme.spacing(26),
    objectFit: 'contain',
  },
  container: {
    marginBottom: theme.spacing(15),
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
  or: {
    textAlign: 'center',
    marginBottom: theme.spacing(1),
  },
  socialAuth: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  link: {
    margin: theme.spacing(1, 0, 0, 1),
  },
}));

const Login = ({ history }) => {
  const classes = useStyles();
  const username = useInput('', { required: true });
  const password = useInput('', { required: true });
  const [error, setError] = useState({});
  const location = useLocation();

  const { displayAlert } = useAlert();

  const { mutate: resetPasswordCheckMutation, isLoading: isPasswordCheckLoading } = useResetPasswordCheckMutation(history, routes.RESET_PASSWORD, routes.LOGIN, displayAlert);

  const { mutate: loginMutation, isLoading: isLoginLoading } = useLoginMutation(history, routes.PRODUCT_PORTFOLIO, displayAlert);

  const { mutate: socialLoginMutation, isLoading: isSocialLoginLoading } = useSocialLoginMutation(history, routes.MISSING_DATA, routes.PRODUCT_PORTFOLIO, displayAlert);

  useEffect(() => {
    const [uid, token] = location.pathname
      .substring(
        location.pathname.indexOf(routes.RESET_PASSWORD) + 1,
        location.pathname.lastIndexOf('/'),
      )
      .split('/')
      .slice(1);
    if (location.pathname.includes(routes.RESET_PASSWORD)) {
      const values = { uid, token };
      resetPasswordCheckMutation(values);
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const loginFormValue = {
      username: username.value,
      password: password.value,
    };
    loginMutation(loginFormValue);
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
    if (!username.value || !password.value) return true;
    // eslint-disable-next-line consistent-return
    errorKeys.forEach((key) => {
      if (error[key].error) return true;
    });
    return false;
  };

  return (
    <>
      {(isLoginLoading || isPasswordCheckLoading || isSocialLoginLoading) && <Loader open={isLoginLoading || isPasswordCheckLoading || isSocialLoginLoading} />}
      <div className={classes.logoDiv}>
        <img src={logo} alt="Logo" className={classes.logo} />
      </div>
      <Container component="main" maxWidth="xs" className={classes.container}>
        <CssBaseline />
        <Card variant="outlined">
          <CardContent>
            <div className={classes.paper}>
              <Typography component="h1" variant="h5">
                Sign in
              </Typography>
              <form className={classes.form} noValidate onSubmit={handleSubmit}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  error={error.username && error.username.error}
                  helperText={
                    error && error.username ? error.username.message : ''
                  }
                  className={classes.textField}
                  onBlur={(e) => handleBlur(e, 'required', username)}
                  {...username.bind}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  error={error.password && error.password.error}
                  helperText={
                    error && error.password ? error.password.message : ''
                  }
                  className={classes.textField}
                  onBlur={(e) => handleBlur(e, 'required', password)}
                  {...password.bind}
                />
                <div className={classes.loadingWrapper}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    disabled={isLoginLoading || isPasswordCheckLoading || isSocialLoginLoading || submitDisabled()}
                  >
                    Sign in
                  </Button>
                </div>
              </form>
              <Grid container>
                {/* <Grid item xs={12} className={classes.or}>
                  <Typography variant="body1">----OR----</Typography>
                </Grid>
                <Grid item xs={12} className={classes.socialAuth}>
                  <GithubLogin
                    socialLoginMutation={socialLoginMutation}
                    history={history}
                    disabled={isLoginLoading || isPasswordCheckLoading || isSocialLoginLoading}
                  />
                </Grid> */}
                <Grid item xs className={classes.link}>
                  <Link
                    href={routes.FORGOT_PASSWORD}
                    variant="body2"
                    color="secondary"
                  >
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item className={classes.link}>
                  <Link href={routes.REGISTER} variant="body2" color="secondary">
                    Don't have an account? Register
                  </Link>
                </Grid>
              </Grid>
            </div>
          </CardContent>
        </Card>
      </Container>
      <Copyright />
    </>
  );
};

export default Login;
