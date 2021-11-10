/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Route } from 'react-router-dom';
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
import { routes } from '@routes/routesConstants';
import { deleteRequirement, deleteIssue } from '@redux/dashboard/actions/dashboard.actions';
import AddRequirements from '../forms/AddRequirements';
import AddIssues from '../forms/AddIssues';
import RequirementToIssue from '../forms/RequirementToIssue';
import ConfirmModal from '../forms/ConfirmModal';

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
  product: {
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
    cursor: 'pointer',
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
    cursor: 'pointer',
  },
  icon: {
    cursor: 'pointer',
  },
}));

const UserDashboard = ({
  products,
  dispatch,
  requirements,
  issues,
  redirectTo,
  history,
}) => {
  const classes = useStyles();
  const [proj, setProj] = useState(0);
  const [projReqs, setProjReqs] = useState([]);
  const [projIssues, setProjIssues] = useState([]);
  const [openDeleteModal, setDeleteModal] = useState(false);
  const [toDeleteItem, setDeleteItem] = useState({ id: 0, type: 'req' });

  const addReqPath = redirectTo
    ? `${redirectTo}/dashboard`
    : `${routes.DASHBOARD}/add-requirement`;

  const editReqPath = redirectTo
    ? `${redirectTo}/dashboard`
    : `${routes.DASHBOARD}/edit-requirement`;

  const addIssuePath = redirectTo
    ? `${redirectTo}/dashboard`
    : `${routes.DASHBOARD}/add-issue`;

  const editIssuePath = redirectTo
    ? `${redirectTo}/dashboard`
    : `${routes.DASHBOARD}/edit-issue`;

  const requirementToIssuePath = redirectTo
    ? `${redirectTo}/dashboard`
    : `${routes.DASHBOARD}/convert-issue`;

  useEffect(() => {
    const reqs = _.filter(
      requirements,
      { productUUID: proj },
    );
    setProjReqs(_.orderBy(reqs, ['id']));
  }, [requirements]);

  useEffect(() => {
    const iss = _.filter(
      issues,
      { productUUID: proj },
    );
    setProjIssues(_.orderBy(iss, ['id']));
  }, [issues]);

  const editItem = (item, type) => {
    let path;
    if (type === 'req') {
      path = `${editReqPath}/:${item.id}`;
    } else if (type === 'issue') {
      path = `${editIssuePath}/:${item.id}`;
    } else if (type === 'convert') {
      path = `${requirementToIssuePath}/:${item.id}`;
    }

    history.push(path, {
      type: 'edit',
      from: redirectTo || routes.DASHBOARD,
      data: item,
      productUUID: proj,
    });
  };

  const addItem = (type) => {
    let path;
    let nextId;
    if (type === 'req') {
      path = addReqPath;
      nextId = (_.max(_.map(projReqs, 'id')) || 0) + 1;
    } else if (type === 'issue') {
      path = addIssuePath;
      nextId = (_.max(_.map(projIssues, 'id')) || 0) + 1;
    } else if (type === 'convert') {
      path = requirementToIssuePath;
      nextId = (_.max(_.map(projIssues, 'id')) || 0) + 1;
    }

    history.push(path, {
      from: redirectTo || routes.DASHBOARD,
      productUUID: proj,
      nextId,
    });
  };

  const convertIssue = (item, type) => {
    let path;
    let nextId;
    if (type === 'convert') {
      path = requirementToIssuePath;
      nextId = (_.max(_.map(projIssues, 'id')) || 0) + 1;
    }

    history.push(path, {
      type: 'edit',
      from: redirectTo || routes.DASHBOARD,
      productUUID: proj,
      nextId,
      data: item,
    });
  };

  const deleteItem = (item, type) => {
    setDeleteItem({ id: item.id, type });
    setDeleteModal(true);
  };

  const handleDeleteModal = () => {
    const { type } = toDeleteItem;
    const { id } = toDeleteItem;
    setDeleteModal(false);
    if (type === 'req') {
      dispatch(deleteRequirement(id));
    } else if (type === 'issue') {
      dispatch(deleteIssue(id));
    }
  };

  return (
    <div>
      <div className={classes.section1}>
        <Typography className={classes.title} variant="h3">
          Dashboard
        </Typography>
        <TextField
          variant="outlined"
          margin="normal"
          select
          id="product"
          color="primary"
          label="Select Product"
          className={classes.product}
          value={proj}
          onChange={(e) => {
            setProj(e.target.value);
            setProjReqs(_.filter(
              requirements,
              { productUUID: e.target.value },
            ));
            setProjIssues(_.filter(
              issues,
              { productUUID: e.target.value },
            ));
          }}
        >
          <MenuItem value={0}>Select</MenuItem>
          {products
          && products.length > 0
          && _.map(products, (proj) => (
            <MenuItem
              key={`product-${proj.id}`}
              value={proj.id}
            >
              {proj.name}
            </MenuItem>
          ))}
        </TextField>
      </div>

      <div className={classes.section2}>
        <Typography
          className={classes.actionTitle}
          variant="h6"
        >
          Requirements
        </Typography>
        <Typography
          className={`${classes.actionTitle} ${classes.rightBox}`}
          variant="h6"
        >
          Issues
        </Typography>
      </div>

      <div className={classes.section3}>
        <div className={classes.boxSection}>
          <AddRoundedIcon
            className={classes.addIcon}
            fontSize="large"
            onClick={(e) => addItem('req')}
          />
          {proj === 0 && (
            <Typography
              className={classes.noData}
              variant="body1"
            >
              No Product selected. Please select the product.
            </Typography>
          )}
          {proj !== 0 && projReqs && projReqs.length === 0
          && (
            <Typography
              className={classes.noData}
              variant="body1"
            >
              No Requirements yet.
            </Typography>
          )}
          {proj !== 0 && projReqs && projReqs.length > 0
          && _.map(projReqs, (req) => (
            <div
              key={`req-${req.productUUID}-${req.id}`}
              className={classes.boxEntry}
            >
              <Typography
                className={classes.entryTitle}
                variant="body1"
              >
                {req.title}
              </Typography>
              <TrendingFlatRoundedIcon
                className={classes.entryIcon}
                onClick={(e) => convertIssue(req, 'convert')}
              />
              <EditRoundedIcon
                className={classes.entryIcon}
                onClick={(e) => editItem(req, 'req')}
              />
              <DeleteRoundedIcon
                className={classes.icon}
                onClick={(e) => deleteItem(req, 'req')}
              />
            </div>
          ))}

        </div>

        <div className={`${classes.boxSection} ${classes.rightBox}`}>
          <AddRoundedIcon
            className={classes.addIcon}
            fontSize="large"
            onClick={(e) => addItem('issue')}
          />
          {proj === 0 && (
            <Typography
              className={classes.noData}
              variant="body1"
            >
              No Product selected. Please select the product.
            </Typography>
          )}
          {proj !== 0 && projIssues && projIssues.length === 0
          && (
            <Typography
              className={classes.noData}
              variant="body1"
            >
              No Issues yet.
            </Typography>
          )}
          {proj !== 0 && projIssues && projIssues.length > 0
          && _.map(projIssues, (issue) => (
            <div
              key={`issue-${issue.productUUID}-${issue.id}`}
              className={classes.boxEntry}
            >
              <Typography
                className={classes.entryTitle}
                variant="body1"
              >
                {issue.title}
              </Typography>
              <EditRoundedIcon
                className={classes.entryIcon}
                onClick={(e) => editItem(issue, 'issue')}
              />
              <DeleteRoundedIcon
                className={classes.icon}
                onClick={(e) => deleteItem(issue, 'issue')}
              />
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        open={openDeleteModal}
        setOpen={setDeleteModal}
        submitAction={handleDeleteModal}
        title="Are you sure you want to delete?"
        submitText="Delete"
      />
      <Route path={`${addReqPath}`} component={AddRequirements} />
      <Route path={`${editReqPath}`} component={AddRequirements} />
      <Route path={`${addIssuePath}`} component={AddIssues} />
      <Route path={`${editIssuePath}`} component={AddIssues} />
      <Route path={`${requirementToIssuePath}`} component={RequirementToIssue} />
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.dashboardReducer,
});

export default connect(mapStateToProps)(UserDashboard);
