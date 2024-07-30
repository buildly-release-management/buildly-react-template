import React, { useState, useEffect } from 'react';
import { Route } from 'react-router-dom';
import Popup from 'reactjs-popup';
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
import useAlert from '../../hooks/useAlert';
import { routes } from '@routes/routesConstants';
import Users from './Users/Users';
import UserGroups from './UserGroups/UserGroups';
import { useInviteMutation } from '../../react-query/mutation/authUser/inviteMutation';

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

const UserManagement = ({ history, location }) => {
  const classes = useStyles();
  const { displayAlert } = useAlert();

  const subNav = [
    { label: 'Current users', value: 'current-users' },
    { label: 'User groups', value: 'groups' },
  ];

  const viewPath = (subNav.find((item) => location.pathname.endsWith(item.value)) || subNav[0]).value;

  const [view, setView] = useState(viewPath);
  const email = useInput('', { required: true });

  useEffect(() => {
    history.push(`/app/profile/users/${view || location.state}`);
  }, [view]);

  const clearEmails = () => {
    email.clear();
  };

  const { mutate: inviteMutation, isLoading: isInviting } = useInviteMutation(clearEmails, displayAlert);

  const inviteUser = (event) => {
    event.preventDefault();
    const inviteFormValue = {
      emails: getEmailsFromInputValue(email.value),
    };
    inviteMutation(inviteFormValue);
  };

  const getEmailsFromInputValue = (value) => value.split(',').map((item) => item.trim());

  const viewTabClicked = (event, vw) => {
    setView(vw);
  };

  return (
    <>
      {isInviting && <Loader open={isInviting} />}
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
              <form className={classes.inviteForm} onSubmit={inviteUser}>
                <Typography variant="h6">Invite users to platform</Typography>
                <TextField
                  className={classes.textField}
                  label="Emails"
                  id="email"
                  variant="outlined"
                  placeholder="abc@xcy.com, 123@zxc.com"
                  {...email.bind}
                />
                <Grid justifyContent="flex-end" container spacing={0}>
                  <Grid item>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      disabled={isInviting || !email.value}
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
      </Box>
    </>
  );
};

export default UserManagement;
