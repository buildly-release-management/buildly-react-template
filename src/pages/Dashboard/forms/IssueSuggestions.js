import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import makeStyles from '@mui/styles/makeStyles';
import {
  useTheme,
  useMediaQuery,
  Grid,
  Button,
} from '@mui/material';
import FormModal from '@components/Modal/FormModal';
import {
  createIssue,
} from '@redux/decision/actions/decision.actions';
import { getAllCredentials } from '@redux/product/actions/product.actions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

const useStyles = makeStyles((theme) => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
      width: '70%',
      margin: 'auto',
    },
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    borderRadius: '18px',
  },
  formTitle: {
    fontWeight: 'bold',
    marginTop: '1em',
    textAlign: 'center',
  },
}));

const IssueSuggestions = ({
  history,
  location,
  dispatch,
  credentials,
  convertIssue,
}) => {
  const classes = useStyles();
  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);

  const redirectTo = location.state && location.state.from;
  const editData = (
    location.state
    && (location.state.type === 'edit' || location.state.type === 'view')
    && location.state.data
  ) || {};
  const product_uuid = location.state && location.state.product_uuid;
  const showData = (
    location.state
    && location.state.type === 'show'
    && location.state.data
  ) || {};

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  useEffect(() => {
    if (!credentials || _.isEmpty(credentials)) {
      dispatch(getAllCredentials());
    }
  }, []);

  const issueCred = _.find(
    credentials,
    { product_uuid, auth_detail: { tool_type: 'Issue' } },
  );
  const handleSubmit = (event) => {
    event.preventDefault();
    const dateTime = new Date();
    const formData = {
      ...editData,
      edit_date: dateTime,
      feature_uuid: showData.feature_uuid,
      start_date: dateTime,
      end_date: dateTime,
      status: showData.status,
      tags: showData.tags,
      product_uuid,
      estimate: showData.total_estimate,
      complexity: Number(),
      repository: 'FE-Testing',
      create_date: dateTime,
      ...issueCred?.auth_detail,
    };
    // eslint-disable-next-line no-return-assign
    _.map(showData.issue_suggestion, (issue) => (
      // eslint-disable-next-line no-sequences
      formData.name = issue.name,
      formData.description = issue.description,
      formData.issue_type = issue.ticket_type,
      dispatch(createIssue(formData))
    ));
    history.push(redirectTo);
  };

  const closeFormModal = () => {
    setFormModal(false);
    if (location && location.state) {
      history.push(redirectTo);
    }
  };

  const discardFormData = () => {
    setConfirmModal(false);
    setFormModal(false);
    if (location && location.state) {
      history.push(redirectTo);
    }
  };

  return (
    <>
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={closeFormModal}
          title="Issue Suggestions"
          titleClass={classes.formTitle}
          maxWidth="md"
          wantConfirm
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={discardFormData}
        >
          <form
            className={classes.form}
            noValidate
            onSubmit={handleSubmit}
          >
            <Grid container spacing={isDesktop ? 2 : 0}>
              <List>
                {_.map(showData.issue_suggestion, (issue, index) => (
                  <ListItem key={index}>
                    <ListItemButton>
                      <ListItemText
                        primary={issue.name}
                      />
                    </ListItemButton>
                    <Divider />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid
              container
              spacing={isDesktop ? 3 : 0}
              justifyContent="center"
            >
              <Grid item xs={12} sm={4}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                >
                  Go with suggestions
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={(e) => convertIssue(showData, 'convert')}
                  className={classes.submit}
                >
                  Create own issue
                </Button>
              </Grid>
            </Grid>
          </form>
        </FormModal>
      )}
    </>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  credentials: state.productReducer.credentials,
});

export default connect(mapStateToProps)(IssueSuggestions);
