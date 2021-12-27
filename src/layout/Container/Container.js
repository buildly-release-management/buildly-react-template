import React, { useState } from 'react';
import { Route, Redirect, Switch } from "react-router-dom";
import { Container } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { UserContext, getUser } from "@context/User.context";
import TopBar from "@layout/TopBar/TopBar";
import NavBar from "@layout/NavBar/NavBar";
import Dashboard from "@pages/Dashboard/Dashboard";
import UserManagement from "@pages/UserManagement/UserManagement";
import MissingData from "@pages/MissingData/MissingData";
import { routes } from "@routes/routesConstants";
import NewProject from "@pages/NewProject/NewProject";
import Release from '@pages/Release/Release';
import ViewRelease from '@pages/Release/components/ViewRelease';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
    },
  },
  content: {
    flexGrow: 1,
    height: '100%',
    paddingTop: '6em',
    maxWidth: '100% !important',
  },
}));

/**
 * Container for the app layout when the user is authenticated.
 */
const ContainerDashboard = ({ location, history }) => {
  const classes = useStyles();
  const [navHidden, setNavHidden] = useState(false);

  return (
    <div className={classes.root}>
      <UserContext.Provider value={getUser()}>
        <TopBar navHidden={navHidden} setNavHidden={setNavHidden} location={location} history={history} />
        <NavBar navHidden={navHidden} setNavHidden={setNavHidden} location={location} history={history} />
        <Container className={classes.content}>
          <Switch>
            <Route
              exact
              path={routes.APP}
              render={() => <Redirect to={routes.DASHBOARD} />}
            />
            <Route path={routes.DASHBOARD} component={Dashboard} />
            <Route path={routes.USER_MANAGEMENT} component={UserManagement} />
            <Route path={routes.MISSING_DATA} component={MissingData} />
            <Route path={routes.NEW_PROJECT} component={NewProject} />
            <Route exact path={`${routes.RELEASE}/view/:releaseID`} component={ViewRelease} />
            <Route path={routes.RELEASE} component={Release} />
          </Switch>
        </Container>
      </UserContext.Provider>
    </div>
  );
};

export default ContainerDashboard;
