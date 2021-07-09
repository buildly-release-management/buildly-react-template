import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  makeStyles,
  MenuItem,
  TextField,
  Typography,
} from '@material-ui/core';
import {
  AddRounded as AddRoundedIcon,
  EditRounded as EditRoundedIcon,
  DeleteRounded as DeleteRoundedIcon,
  TrendingFlatRounded as TrendingFlatRoundedIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  section1: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: theme.palette.secondary.contrastText,
  },
  title: {
    margin: theme.spacing(2, 0),
  },
  project: {
    width: '30%',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.secondary.contrastText,
    },
    '& .MuiOutlinedInput-root:hover > .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgb(255, 255, 255, 0.23)',
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.secondary.contrastText,
    },
    '& .MuiSelect-icon': {
      color: theme.palette.secondary.contrastText,
    },
    '& .MuiInputBase-input': {
      color: theme.palette.secondary.contrastText,
    },
  },
  section2: {
    marginTop: theme.spacing(8),
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    color: theme.palette.secondary.contrastText,
  },
  actionTitle: {
    flex: 1,
    marginLeft: theme.spacing(2),
  },
  section3: {
    display: 'flex',
    color: theme.palette.secondary.contrastText,
  },
  rightBox: {
    marginLeft: theme.spacing(2),
  },
  boxSection: {
    flex: 1,
    marginTop: theme.spacing(2),
    border: `1px solid ${theme.palette.secondary.contrastText}`,
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1, 1, 8, 1),
    display: 'flex',
    flexDirection: 'column',
  },
  addIcon: {
    marginLeft: 'auto',
    marginBottom: theme.spacing(3),
  },
  noData: {
    width: '100%',
    textAlign: 'center',
  },
  boxEntry: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: theme.spacing(1, 1, 2, 1),
  },
  entryTitle: {
    flex: 1,
  },
  entryIcon: {
    marginRight: theme.spacing(2),
  },
}));

const UserDashboard = ({
  projects,
  requirements,
  issues,
}) => {
  const classes = useStyles();
  const [proj, setProj] = useState(0);
  const [projReqs, setProjReqs] = useState([]);
  const [projIssues, setProjIssues] = useState([]);
  
  return (
    <div>
      <div className={classes.section1}>
        <Typography className={classes.title} variant="h3">
          Dashboard
        </Typography>
        <TextField
          variant='outlined'
          margin='normal'
          select
          id='project'
          color='primary'
          label='Select Project'
          className={classes.project}
          value={proj}
          onChange={(e) => {
            setProj(e.target.value);
            setProjReqs(_.filter(
              requirements,
              { projId: e.target.value},
            ));
            setProjIssues(_.filter(
              issues,
              { projId: e.target.value},
            ));
          }}
        >
          <MenuItem value={0}>Select</MenuItem>
          {projects
          && projects.length > 0
          && _.map(projects, (proj) => (
            <MenuItem
              key={`project-${proj.id}`}
              value={proj.id}
            >
              {proj.name}
            </MenuItem>
          ))
          }
        </TextField>
      </div>

      <div className={classes.section2}>
        <Typography
          className={classes.actionTitle}
          variant='h6'
        >
          Requirements
        </Typography>
        <Typography
          className={`${classes.actionTitle} ${classes.rightBox}`}
          variant='h6'
        >
          Issues
        </Typography>
      </div>

      <div className={classes.section3}>
        <div className={classes.boxSection}>
          <AddRoundedIcon
            className={classes.addIcon}
            fontSize='large'
          />
          {proj === 0 && (
            <Typography
              className={classes.noData}
              variant='body1'
            >
              No Project selected. Please select the project.
            </Typography>
          )}
          {proj !== 0 && projReqs && projReqs.length === 0
          && (
            <Typography
              className={classes.noData}
              variant='body1'
            >
              No Requirements yet.
            </Typography>
          )}
          {proj !== 0 && projReqs && projReqs.length > 0
          && _.map(projReqs, (req) => (
            <div
              key={`req-${req.projId}-${req.id}`}
              className={classes.boxEntry}
            >
              <Typography
                className={classes.entryTitle}
                variant='body1'
              >
                {req.title}
              </Typography>
              <TrendingFlatRoundedIcon
                className={classes.entryIcon}
              />
              <EditRoundedIcon className={classes.entryIcon} />
              <DeleteRoundedIcon />
            </div>
          ))
          }
        </div>

        <div className={`${classes.boxSection} ${classes.rightBox}`}>
          <AddRoundedIcon
            className={classes.addIcon}
            fontSize='large'
          />
          {proj === 0 && (
            <Typography
              className={classes.noData}
              variant='body1'
            >
              No Project selected. Please select the project.
            </Typography>
          )}
          {proj !== 0 && projIssues && projIssues.length === 0
          && (
            <Typography
              className={classes.noData}
              variant='body1'
            >
              No Issues yet.
            </Typography>
          )}
          {proj !== 0 && projIssues && projIssues.length > 0
          && _.map(projIssues, (issue) => (
            <div
              key={`req-${issue.projId}-${issue.id}`}
              className={classes.boxEntry}
            >
              <Typography
                className={classes.entryTitle}
                variant='body1'
              >
                {issue.title}
              </Typography>
              <EditRoundedIcon className={classes.entryIcon} />
              <DeleteRoundedIcon />
            </div>
          ))
          }
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.dashboardReducer,
});

export default connect(mapStateToProps)(UserDashboard);
