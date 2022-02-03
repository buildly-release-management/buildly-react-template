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
      {loaded && !filled && user.user_type === 'Developer'
        ? <FeedbackForm />
        : <NewProductForm />}
      {loaded && filled && <UserDashboard history={history} />}
    </>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.googleSheetReducer,
});

export default connect(mapStateToProps)(Dashboard);
