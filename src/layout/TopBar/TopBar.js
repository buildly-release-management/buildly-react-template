import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { AppBar, Toolbar, IconButton, Hidden, TextField, MenuItem } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {
  ExitToApp as ExitToAppIcon,
  Group as GroupIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import logo from '@assets/light-logo.png';
import { UserContext } from '@context/User.context';
import { logout, getUser, loadOrgNames, updateUser } from '@redux/authuser/actions/authuser.actions';
import { checkFilled } from '@redux/googleSheet/actions/googleSheet.actions';
import { routes } from '@routes/routesConstants';
import { hasGlobalAdminRights, hasAdminRights } from '@utils/permissions';

const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: theme.palette.secondary.light,
    zIndex: theme.zIndex.drawer + 1,
    width: '100%',
  },
  logo: {
    maxWidth: 50,
    objectFit: 'contain',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  menuRight: {
    marginLeft: 'auto',
  },
  menuIcon: {
    color: theme.palette.secondary.contrastText,
  },
  paper: {
    border: '1px solid',
  },
  globalFilter: {
    width: theme.spacing(24),
    marginTop: theme.spacing(1.5),
    '& .MuiOutlinedInput-input': {
      padding: theme.spacing(1, 3.5, 1, 2),
    },
  },
}));

/**
 * Component for the top bar header.
 */
const TopBar = ({ location, history, dispatch, navHidden, setNavHidden, data, orgNames, }) => {
  const classes = useStyles();
  const user = useContext(UserContext);
  const isAdmin = false;
  let isSuperAdmin = true;
  const [organization, setOrganization] = useState('');

  if (data && data.data) {
    user = data.data;
    if (!organization) {
      setOrganization(user.organization.name);
    }
    isAdmin = hasAdminRights(user) || hasGlobalAdminRights(user);
    isSuperAdmin = checkForGlobalAdmin(user);
  }

  useEffect(() => {
    if (location.path !== routes.MISSING_DATA) {
      if (!user.email || !user.organization) {
        history.push(routes.MISSING_DATA);
      }
    }
    dispatch(checkFilled(`${user.first_name} ${user.last_name}`));
  }, []);

  useEffect(() => {
    dispatch(getUser());
    if (!orgNames) {
      dispatch(loadOrgNames());
    }
  }, []);

  const handleLogoutClick = () => {
    dispatch(logout());
    history.push('/');
  };

  const handleOrganizationChange = (e) => {
    const organization_name = e.target.value;
    setOrganization(organization_name);
    const { organization_uuid } = _.filter(orgNames, (org) => org.name === organization_name)[0];
    dispatch(updateUser({
      id: user.id,
      organization_uuid,
      organization_name,
    }, true));
    history.push(routes.DASHBOARD);
  };

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar>
        <Hidden mdUp>
          <IconButton
            edge="start"
            className={classes.menuButton}
            onClick={() => setNavHidden(!navHidden)}
            color="default"
            aria-label="menu"
            size="large">
            <MenuIcon />
          </IconButton>
        </Hidden>
        <Link to={routes.DASHBOARD}>
          <img src={logo} className={classes.logo} />
        </Link>

        <div className={classes.menuRight}>
          {isSuperAdmin && (
            <TextField
              className={classes.globalFilter}
              variant="outlined"
              fullWidth
              id="org"
              label="Organization"
              select
              value={organization}
              onChange={handleOrganizationChange}
            >
              {_.map(orgNames, (org, index) => (
                < MenuItem
                  key={index}
                  value={org}
                >
                  {org}
                </MenuItem>
              ))}
            </TextField>
          )}
          {isAdmin && (
            <Link to={routes.USER_MANAGEMENT}>
              <IconButton aria-label="user-management" color="inherit" size="large">
                <GroupIcon fontSize="large" className={classes.menuIcon} />
              </IconButton>
            </Link>
          )}
          <IconButton
            aria-label="logout"
            color="inherit"
            onClick={handleLogoutClick}
            size="large">
            <ExitToAppIcon fontSize="large" className={classes.menuIcon} />
          </IconButton>
        </div>
      </Toolbar>
    </AppBar >
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.authReducer,
  ...state.googleSheetReducer,
});

export default connect(mapStateToProps)(TopBar);
