import React from 'react';
import { connect } from 'react-redux';
import Loader from '@components/Loader/Loader';
import UserDashboard from './components/UserDashboard';
import FeedbackForm from './components/FeedbackForm';
import Kanban from './components/Kanban';

const Dashboard = ({ history, loading, loaded, filled }) => {

  return (
    <React.Fragment>
      {loading && <Loader open={loading} />}
      {loaded && !filled && <FeedbackForm />}
      {/* {loaded && filled && <UserDashboard history={history} />} */}
      <Kanban/>
    </React.Fragment>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.googleSheetReducer,
});

export default connect(mapStateToProps)(Dashboard);
