import React, { useState, useEffect } from 'react';
import _ from 'lodash';
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
  MenuItem, Checkbox,
} from '@mui/material';
import logo from '@assets/buildly-product-labs-logo.png';
import Copyright from '@components/Copyright/Copyright';
import GithubLogin from '@components/SocialLogin/GithubLogin';
import { useInput } from '@hooks/useInput';
import useAlert from '@hooks/useAlert';
import { routes } from '@routes/routesConstants';
import { validators } from '@utils/validators';
import { isMobile } from '@utils/mediaQuery';
import Loader from '@components/Loader/Loader';
import { useQuery } from 'react-query';
import { inviteTokenCheckQuery } from '@react-query/queries/authUser/inviteTokenCheckQuery';
import { useRegisterMutation } from '@react-query/mutations/authUser/registerMutation';
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
  consentContainer: {
    display: 'flex',
    flexDirection: 'row',
    placeContent: 'center flex-start',
    alignItems: 'center',
  },
  pageLink: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
  },
}));

const Register = ({ history }) => {
  const classes = useStyles();

  const [inviteToken, setInviteToken] = useState('');

  const email = useInput('', { required: true });
  const username = useInput('', { required: true });
  const password = useInput('', { required: true });
  const re_password = useInput('', {
    required: true,
    confirm: true,
    matchField: password,
  });
  const organization_name = useInput('', { required: true });
  const userType = useInput('', { required: true });
  const first_name = useInput('', { required: true });
  const last_name = useInput('');
  const coupon_code = useInput(''); // window.env.FREE_COUPON_CODE ||
  const referralCode = new URLSearchParams(location.search).get('referral_code');
  const [formError, setFormError] = useState({});
  const [checked, setChecked] = React.useState(false);

  const { displayAlert } = useAlert();

  const { data: inviteTokenCheckData, isLoading: isInviteTokenCheckLoading } = useQuery(
    ['inviteTokenCheck'],
    () => inviteTokenCheckQuery(inviteToken, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(inviteToken) },
  );

  const { mutate: registerMutation, isLoading: isRegisterLoading } = useRegisterMutation(history, routes.LOGIN, displayAlert);

  const { mutate: socialLoginMutation, isLoading: isSocialLoginLoading } = useSocialLoginMutation(history, routes.MISSING_DATA, routes.PRODUCT_PORTFOLIO, displayAlert);

  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search);
    const token = queryParameters.get('token');
    if (!_.isEmpty(token)) {
      setInviteToken(token);
    }
  }, []);

  useEffect(() => {
    if (inviteTokenCheckData) {
      email.setValue(inviteTokenCheckData.email || '');
      organization_name.setValue(inviteTokenCheckData.organization_name || '');
    }
  }, [inviteTokenCheckData]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (window.env.PRODUCTION) {
      const script = document.createElement('script');
      script.src = '//fw-cdn.com/1900654/2696977.js';
      script.chat = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    let registerFormValue = {
      username: username.value,
      email: email.value,
      password: password.value,
      organization_name: organization_name.value,
      user_type: userType.value,
      first_name: first_name.value,
      last_name: last_name.value,
    };
    if (referralCode) {
      registerFormValue = {
        ...registerFormValue,
        referral_code: referralCode,
      };
    } else {
      registerFormValue = {
        ...registerFormValue,
        coupon_code: coupon_code.value,
      };
    }

    if (!inviteTokenCheckData && _.includes(_.toLower(_.trim(organization_name.value)), 'buildly')) {
      displayAlert('error', 'Organization name cannot have word Buildly in it.');
    } else {
      registerMutation(registerFormValue);
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

  const handleChange = (e) => {
    setChecked(e.target.checked);
  };

  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    let errorExists = false;
    if (
      !username.value
      || !password.value
      || !email.value
      || !re_password.value
      || !organization_name.value
      || !userType.value
      || !first_name.value
    ) return true;
    errorKeys.forEach((key) => {
      if (formError[key].error) errorExists = true;
    });
    return errorExists;
  };

  return (
    <>
      {(isRegisterLoading || isSocialLoginLoading || isInviteTokenCheckLoading) && <Loader open={isRegisterLoading || isSocialLoginLoading || isInviteTokenCheckLoading} />}
      <div className={classes.logoDiv}>
        <img src={logo} alt="Logo" className={classes.logo} />
      </div>
      <Container component="main" maxWidth="sm" className={classes.container}>
        <CssBaseline />
        <Card variant="outlined">
          <CardContent>
            <div className={classes.paper}>
              <Typography component="h1" variant="h5">
                Register
              </Typography>
              <form className={classes.form} noValidate onSubmit={handleSubmit}>
                <Grid container spacing={isMobile() ? 0 : 3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="first_name"
                      label="First Name"
                      name="first_name"
                      autoComplete="first_name"
                      error={formError.first_name && formError.first_name.error}
                      helperText={
                        formError.first_name ? formError.first_name.message : ''
                      }
                      className={classes.textField}
                      onBlur={(e) => handleBlur(e, 'required', first_name)}
                      {...first_name.bind}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      id="last_name"
                      label="Last Name"
                      name="last_name"
                      autoComplete="last_name"
                      error={formError.last_name && formError.last_name.error}
                      helperText={
                        formError.last_name ? formError.last_name.message : ''
                      }
                      className={classes.textField}
                      onBlur={(e) => handleBlur(e)}
                      {...last_name.bind}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={isMobile() ? 0 : 3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="username"
                      label="Username"
                      name="username"
                      autoComplete="username"
                      error={formError.username && formError.username.error}
                      helperText={
                        formError.username ? formError.username.message : ''
                      }
                      className={classes.textField}
                      onBlur={(e) => handleBlur(e, 'required', username)}
                      {...username.bind}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email"
                      name="email"
                      autoComplete="email"
                      type="email"
                      disabled={inviteTokenCheckData}
                      error={formError.email && formError.email.error}
                      helperText={
                        formError.email ? formError.email.message : ''
                      }
                      className={classes.textField}
                      onBlur={(e) => handleBlur(e, 'email', email)}
                      {...email.bind}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={isMobile() ? 0 : 3}>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="organization_name"
                      label="Organization Name"
                      name="organization_name"
                      autoComplete="organization_name"
                      disabled={inviteTokenCheckData}
                      error={formError.orgName && formError.orgName.error}
                      helperText={
                        formError.orgName ? formError.orgName.message : ''
                      }
                      className={classes.textField}
                      onBlur={(e) => handleBlur(e, 'required', organization_name)}
                      {...organization_name.bind}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={isMobile() ? 0 : 3}>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      select
                      id="userType"
                      name="userType"
                      label="User Type"
                      autoComplete="userType"
                      error={formError.userType && formError.userType.error}
                      helperText={
                        formError.userType ? formError.userType.message : ''
                      }
                      className={classes.textField}
                      onBlur={(e) => handleBlur(e, 'required', userType)}
                      {...userType.bind}
                    >
                      <MenuItem value="">----------</MenuItem>
                      <MenuItem value="Developer">Developer</MenuItem>
                      <MenuItem value="Product Team">Product Team</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
                <Grid container spacing={isMobile() ? 0 : 3}>
                  <Grid item xs={12} md={6}>
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
                      error={formError.password && formError.password.error}
                      helperText={
                        formError.password ? formError.password.message : ''
                      }
                      className={classes.textField}
                      onBlur={(e) => handleBlur(e, 'required', password)}
                      {...password.bind}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
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
                      error={
                        formError.re_password && formError.re_password.error
                      }
                      helperText={
                        formError.re_password
                          ? formError.re_password.message
                          : ''
                      }
                      className={classes.textField}
                      onBlur={(e) => handleBlur(e, 'confirm', re_password)}
                      {...re_password.bind}
                    />
                  </Grid>
                </Grid>
                {!(referralCode) && (
                <Grid container spacing={isMobile() ? 0 : 3}>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      id="coupon_code"
                      label="Coupon Code"
                      name="coupon_code"
                      autoComplete="coupon_code"
                      error={formError.coupon_code && formError.coupon_code.error}
                      helperText={
                              formError.coupon_code ? formError.coupon_code.message : ''
                            }
                      className={classes.textField}
                      onBlur={(e) => handleBlur(e, '', coupon_code)}
                      {...coupon_code.bind}
                    />
                  </Grid>
                </Grid>
                )}
                <Grid container spacing={isMobile() ? 0 : 3}>
                  <Grid item xs={12}>
                    <div className={classes.consentContainer}>
                      <Checkbox
                        id="igin "
                        checked={checked}
                        onChange={handleChange}
                      />
                      <p>
                        <span>I have read and accept the </span>
                        <a className={classes.pageLink} href="https://buildly.io/tos/" target="_blank" rel="noopener noreferrer">terms of service</a>
                        <span> and </span>
                        <a className={classes.pageLink} href="https://buildly.io/privacy/" target="_blank" rel="noopener noreferrer">privacy policy</a>
                      </p>
                    </div>
                  </Grid>
                </Grid>
                <div className={classes.loadingWrapper}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    disabled={isRegisterLoading || isSocialLoginLoading || submitDisabled() || !checked || isInviteTokenCheckLoading}
                  >
                    Register
                  </Button>
                </div>
              </form>
              <Grid container>
                <Grid item xs={12} className={classes.or}>
                  <Typography variant="body1">----OR----</Typography>
                </Grid>
                <Grid item xs={12} className={classes.socialAuth}>
                  <GithubLogin
                    socialLoginMutation={socialLoginMutation}
                    history={history}
                    disabled={isRegisterLoading || isSocialLoginLoading || isInviteTokenCheckLoading}
                  />
                </Grid>
                <Grid item className={classes.link}>
                  <Link href={routes.LOGIN} variant="body2" color="secondary">
                    Already have an account? Sign in
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

export default Register;
