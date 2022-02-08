/* eslint-disable no-nested-ternary */
import React, { useContext } from 'react';
import { connect } from 'react-redux';
import Loader from '@components/Loader/Loader';
import UserDashboard from './components/UserDashboard';
import NewProductForm from '../NewProduct/NewProduct';
import FeedbackForm from './components/FeedbackForm';
import { UserContext } from '@context/User.context';

const Dashboard = ({
  history, loading, loaded, filled,
}) => {
  const user = useContext(UserContext);
  return (
    <>
      {loading && <Loader open={loading} />}
      {loaded && user.survey_status === false && user.user_type === 'Developer'
        ? <FeedbackForm /> : user.user_type === 'Product Team' && user.survey_status === false
          ? <NewProductForm />
          : (
            <UserDashboard history={history} />
          )}

    </>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.googleSheetReducer,
});

export default connect(mapStateToProps)(Dashboard);
