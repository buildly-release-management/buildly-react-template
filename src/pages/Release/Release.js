import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(5),
    paddingTop: theme.spacing(10),
  },
}));

const Release = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography component="h3" variant="h3">
        Releases
      </Typography>
      <DataTableWrapper
      />
    </div>
  );
};

export default Release;
