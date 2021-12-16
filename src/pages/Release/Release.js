import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import { loadCoreuserData } from '@redux/coreuser/coreuser.actions';
import { getReleases } from '@redux/project/actions/project.actions';
import { releaseColumns, getReleasesData } from './ReleaseConstants';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(5),
    paddingTop: theme.spacing(10),
  },
}));

const Release = ({ dispatch, loading, releases, users }) => {
  const classes = useStyles();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    dispatch(loadCoreuserData());
    if (!releases)
      dispatch(getReleases());
  }, [])

  useEffect(() => {
    if  (releases && releases.length > 0) {
      setRows(getReleasesData(releases, users));
    }
  }, [releases])

  const onAddButtonClick = () => {
    console.log("Add Release");
  };

  const editRelease = () => {
    console.log("Edit Release");
  };

  return (
    <div className={classes.root}>
      <DataTableWrapper
        loading={loading}
        rows={rows || []}
        columns={releaseColumns}
        filename="ReleaseList"
        addButtonHeading="Add Release"
        onAddButtonClick={onAddButtonClick}
        editAction={editRelease}
        tableHeader="Releases"
      />
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  loading: state.projectReducer.loading || state.coreuserReducer.loading,
  releases: state.projectReducer.release,
  users: state.coreuserReducer.data,
});

export default connect(mapStateToProps)(Release);
