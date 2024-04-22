import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import Popup from 'reactjs-popup';
import {
  NotificationContainer,
  NotificationManager,
} from 'react-notifications';
import { rem } from 'polished';
import makeStyles from '@mui/styles/makeStyles';
import {
  Tabs,
  Tab,
  Button,
  TextField,
  Typography,
  Grid,
  Box,
} from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import Loader from '@components/Loader/Loader';
import { useInput } from '@hooks/useInput';
import { invite } from '@redux/authuser/actions/authuser.actions';
import { routes } from '@routes/routesConstants';
import Users from './Users/Users';
import UserGroups from './UserGroups/UserGroups';

const useStyles = makeStyles((theme) => ({
  userManagementHeading: {
    margin: theme.spacing(3, 0),
  },
  textField: {
    minHeight: rem(5),
    margin: theme.spacing(1, 0),
    width: '100%',
  },
  inviteForm: {
    padding: theme.spacing(3),
    minWidth: rem(25),
  },
  tabs: {
    '& .MuiTabs-root': {
      color: theme.palette.contrast.text,
      '& .Mui-selected': {
        color: theme.palette.secondary.main,
      },
      '& .MuiTabs-indicator': {
        backgroundColor: theme.palette.secondary.light,
      },
    },
  },
}));

const UserManagement = ({
  dispatch,
  loading,
  loaded,
  error,
  user,
  history,
  location,
}) => {
  const classes = useStyles();
  const email = useInput('', { required: true });
  const [inviteCall, setInviteCall] = useState(false);
  const subNav = [
    { label: 'Current users', value: 'current-users' },
    { label: 'User groups', value: 'groups' },
  ];
  const viewPath = (
    subNav.find((item) => location.pathname.endsWith(item.value)) || subNav[0]
  ).value;
  const [view, setView] = useState(viewPath);

  useEffect(() => {
    history.push(`/app/profile/users/${view || location.state}`);
  }, [view]);

  if (user && user.data && user.data.detail && inviteCall && !error) {
    NotificationManager.success(user.data.detail, 'Success');
    setInviteCall(false);
  }

  const inviteUser = (event) => {
    event.preventDefault();
    const inviteFormValue = {
      emails: getEmailsFromInputValue(email.value),
    };
    setInviteCall(true);
    dispatch(invite(inviteFormValue));
    email.clear();
  };

  const getEmailsFromInputValue = (value) => value.split(',').map((item) => item.trim());

  const viewTabClicked = (event, vw) => {
    setView(vw);
  };

  return (
    <>
      {(loading || !loaded) && <Loader open={loading || !loaded} />}
      <Box mt={1} mb={3}>
        <Grid container mb={3} justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography className={classes.userManagementHeading} variant="h4">
              People using this system
            </Typography>
          </Grid>
          <Grid item>
            <Popup
              trigger={(
                <Button
                  type="button"
                  variant="contained"
                  size="small"
                  color="primary"
                  startIcon={<EmailIcon />}
                >
                  Invite users
                </Button>
              )}
              position="bottom right"
              on="click"
              closeOnDocumentClick
              mouseLeaveDelay={300}
              mouseEnterDelay={0}
              contentStyle={{
                padding: 0,
                border: 'none',
                width: '100%',
                minWidth: `${rem(250)}`,
                maxWidth: `${rem(400)}`,
              }}
              arrow={false}
            >
              <form className={classes.inviteForm}>
                <Typography variant="h6">Invite users to platform</Typography>
                <TextField
                  className={classes.textField}
                  label="Emails"
                  id="email"
                  variant="outlined"
                  placeholder="abc@xcy.com, 123@zxc.com"
                  error={Boolean(error)}
                  helperText={error}
                  {...email.bind}
                />
                <Grid justifyContent="flex-end" container spacing={0}>
                  <Grid item>
                    <Button
                      onClick={inviteUser}
                      size="small"
                      variant="contained"
                      color="primary"
                      disabled={(loading && !loaded) || !email.value}
                      type="submit"
                    >
                      Send
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Popup>
          </Grid>
        </Grid>
        <Grid mb={3} container justifyContent="center">
          <Grid item className={classes.tabs}>
            <Tabs value={view} onChange={viewTabClicked}>
              {subNav.map((itemProps, index) => (
                <Tab {...itemProps} key={`tab${index}:${itemProps.value}`} />
              ))}
            </Tabs>
          </Grid>
        </Grid>
        <Route path={routes.CURRENT_USERS} component={Users} />
        <Route path={routes.USER_GROUPS} component={UserGroups} />
        <NotificationContainer />
      </Box>
    </>
  );
};

const mapStateToProps = (state, ownProps) => {
  const loaded = state.coreuserReducer.loaded && state.coregroupReducer.loaded;
  return {
    ...ownProps,
    ...state.authReducer,
    loaded,
  };
};

export default connect(mapStateToProps)(UserManagement);
