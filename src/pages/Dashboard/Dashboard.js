import React from 'react';
import { connect } from 'react-redux';
import Loader from '@components/Loader/Loader';
import UserDashboard from './components/UserDashboard';
import FeedbackForm from './components/FeedbackForm';

const Dashboard = ({
  loading, loaded, filled,
}) => (
  <>
    {loading && <Loader open={loading} />}
    {loaded && !filled && <FeedbackForm />}
    {/* {loaded && <UserDashboard history={history} />} */}
    {loaded && filled && (
      <p style={{ padding: '160px 0', textAlign: 'center' }}>
        Work in progress. Keep a tab on this space for more updates.
      </p>
    )}
  </>
);

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.googleSheetReducer,
});

export default connect(mapStateToProps)(Dashboard);
