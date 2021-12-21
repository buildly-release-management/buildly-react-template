import React, { useState } from 'react';
import {
  makeStyles,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { isMobile } from '@utils/mediaQuery';
import { routes } from '@routes/routesConstants';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(5),
    paddingLeft: theme.spacing(3),
  },
  section: {
    marginTop: theme.spacing(5),
    width: '100%',
  },
  select: {
    minWidth: theme.spacing(20),
  },
  graphXS: {
    marginTop: theme.spacing(5),
    backgroundColor: 'aqua',
    height: theme.spacing(50),
  },
  graphMD: {
    marginRight: theme.spacing(3),
    backgroundColor: 'beige',
    height: theme.spacing(50),
  },
  gridTitle: {
    marginTop: theme.spacing(5),
  },
  gridContent: {
    marginTop: theme.spacing(2),
  },
  title: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const ViewRelease = ({ history }) => {
  const classes = useStyles();
  const [region, setRegion] = useState('');

  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={isMobile() ? 0 : 3}
        className={classes.section}
      >
        <Grid item xs={5}>
          <div className={classes.title}>
            <IconButton
              onClick={(e) => { history.push(routes.RELEASE); }}
            >
              <ArrowBackIcon fontSize="medium" />
            </IconButton>
            <Typography component="h3" variant="h3">
              Release
            </Typography>
          </div>
        </Grid>
        <Grid item xs={6} align="right">
          <TextField
            variant="outlined"
            size="small"
            required
            select
            id="region"
            name="region"
            className={classes.select}
            value={region}
            onChange={(e) => { setRegion(e.target.value); }}
          >
            <MenuItem value="">Select region</MenuItem>
            <MenuItem value="dev">Development</MenuItem>
            <MenuItem value="demo">Demo</MenuItem>
            <MenuItem value="prod">Production</MenuItem>
          </TextField>
        </Grid>
      </Grid>
      <Grid
        container
        spacing={isMobile() ? 0 : 3}
        className={classes.section}
      >
        <Grid item xs={4} sm={6} md={8}>
          <Typography component="div" variant="h4">
            <em>Version 1.0.0</em>
          </Typography>
        </Grid>
        <Grid item xs={4} sm={3} md={2} align="right">
          <Button
            type="button"
            variant="contained"
            color="primary"
          >
            View Timeline
          </Button>
        </Grid>
        <Grid item xs={4} sm={3} md={2} align="right">
          <Button
            type="button"
            variant="contained"
            color="primary"
          >
            View Status
          </Button>
        </Grid>
      </Grid>

      <Grid container className={classes.section}>
        <Grid item xs={12} md={6}>
          <Grid item>
            <Typography component="div" variant="h5">
              Release Notes
            </Typography>
          </Grid>
          <Grid item className={classes.gridContent}>
            <Typography component="div" variant="body1">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit,
              sed do eiusmod tempor incididunt ut labore et dolore magna
              aliqua. Pellentesque elit eget gravida cum sociis natoque.
              Sagittis eu volutpat odio facilisis mauris sit amet massa.
              Semper viverra nam libero justo laoreet. Augue eget arcu
              dictum varius duis at.
            </Typography>
          </Grid>
          <Grid item className={classes.gridTitle}>
            <Typography component="div" variant="h5">
              Services
            </Typography>
          </Grid>
          <Grid container className={classes.gridContent}>
            <Grid item xs={6}>
              <Typography component="div" variant="body1">
                Service 1
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography component="div" variant="body1">
                v1.0.0
              </Typography>
            </Grid>
          </Grid>
          <Grid container className={classes.gridContent}>
            <Grid item xs={6}>
              <Typography component="div" variant="body1">
                Service 2
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography component="div" variant="body1">
                v1.0.0
              </Typography>
            </Grid>
          </Grid>
          <Grid container className={classes.gridContent}>
            <Grid item xs={6}>
              <Typography component="div" variant="body1">
                Service 3
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography component="div" variant="body1">
                v1.0.0
              </Typography>
            </Grid>
          </Grid>
          <Grid container className={classes.gridContent}>
            <Grid item xs={6}>
              <Typography component="div" variant="body1">
                Service 4
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography component="div" variant="body1">
                v1.0.0
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <div className={isMobile() ? classes.graphXS : classes.graphMD}>
            Graph here
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default ViewRelease;
