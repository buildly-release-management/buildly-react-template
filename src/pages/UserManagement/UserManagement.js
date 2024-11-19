import React, { useEffect, useState } from 'react';
import { Route, useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  Tab,
  Tabs,
} from '@mui/material';
import { getUser } from '@context/User.context';
import { hasGlobalAdminRights } from '@utils/permissions';
import { routes } from '@routes/routesConstants';
import Users from './Users/Users';
import UserGroups from './UserGroups/UserGroups';
import AddUser from './forms/AddUser';

const UserManagement = () => {
  const history = useHistory();
  const subNav = [
    { label: 'Current users', value: 'current-users' },
    { label: 'User groups', value: 'groups' },
  ];
  const viewPath = (
    subNav.find((item) => location.pathname.endsWith(item.value)) || subNav[0]
  ).value;
  const [view, setView] = useState(viewPath);
  const [showAddUser, setShowAddUser] = useState(false);

  const user = getUser();
  let isSuperAdmin = false;

  if (user) {
    isSuperAdmin = hasGlobalAdminRights(user);
  }

  useEffect(() => {
    history.push(`/app/profile/users/${view || location.state}`);
  }, [view]);

  const viewTabClicked = (event, newView) => {
    setView(newView);
  };

  return (
    <Box mt={5} mb={3}>
      <Button
        type="button"
        variant="contained"
        color="primary"
        onClick={() => setShowAddUser(true)}
        style={{ marginLeft: isSuperAdmin ? '20px' : '0px' }}
      >
        + Add Users
      </Button>
      <Box mb={3} mt={2}>
        <Tabs value={view} onChange={viewTabClicked}>
          {subNav.map((itemProps, index) => (
            <Tab {...itemProps} key={`tab${index}:${itemProps.value}`} />
          ))}
        </Tabs>
      </Box>
      <Route path={routes.CURRENT_USERS} component={Users} />
      <Route path={routes.USER_GROUPS} component={UserGroups} />
    </Box>
  );
};

export default UserManagement;
