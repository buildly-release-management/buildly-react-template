import React from 'react';
import _ from 'lodash';
import { Route, Redirect, Switch } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import { Container } from '@mui/material';
import { UserContext, getUser } from '@context/User.context';
import Insights from '@pages/Insights/Insights';
import TopBar from '@layout/TopBar/TopBar';
import ProductRoadmap from '@pages/ProductRoadmap/ProductRoadmap';
import UserManagement from '@pages/UserManagement/UserManagement';
import { routes } from '@routes/routesConstants';
import NewProduct from '@pages/NewProduct/NewProduct';
import DeveloperForm from '@pages/DeveloperForm/DeveloperForm';
import ProductPortfolio from '@pages/ProductPortfolio/ProductPortfolio';
import UserProfile from '@pages/UserProfile/UserProfile';
import ReleaseList from '@pages/ReleaseList/ReleaseList';
import ReleaseDetails from '@pages/ReleaseDetails/ReleaseDetails';
import Dashboard from '@pages/Dashboard/Dashboard';
import AddBusinessTask from '@pages/ProductRoadmap/forms/AddBusinessTask';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
    },
  },
  content: {
    flexGrow: 1,
    height: '100vh',
    paddingTop: '3.5em',
    maxWidth: '100% !important',
  },
}));

const ContainerDashboard = ({ location, history }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <UserContext.Provider value={getUser()}>
        <TopBar
          location={location}
          history={history}
        />
        <Container className={classes.content}>
          <Switch>
            <Route
              exact
              path={routes.APP}
              render={() => <Redirect to={routes.DASHBOARD} />}
            />
            <Route exact path={routes.DASHBOARD} component={Dashboard} />
            <Route exact path={`${routes.RELEASE}/:releaseUuid`} component={ReleaseDetails} />
            <Route exact path={routes.ADD_BUSINESS_TASK} component={AddBusinessTask} />
            <Route exact path={routes.EDIT_BUSINESS_TASK} component={AddBusinessTask} />
            <Route path={routes.PRODUCT_ROADMAP} component={ProductRoadmap} />
            <Route path={routes.USER_PROFILE} component={UserProfile} />
            <Route path={routes.USER_MANAGEMENT} component={UserManagement} />
            <Route path={routes.NEW_PRODUCT} component={NewProduct} />
            <Route path={routes.DEVELOPER_FORM} component={DeveloperForm} />
            <Route path={routes.PRODUCT_PORTFOLIO} component={ProductPortfolio} />
            <Route path={routes.RELEASE} component={ReleaseList} />
            <Route path={routes.INSIGHTS} component={Insights} />
          </Switch>
        </Container>
      </UserContext.Provider>
    </div>
  );
};

export default ContainerDashboard;
