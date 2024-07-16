import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import makeStyles from '@mui/styles/makeStyles';
import {
  useTheme,
  useMediaQuery,
  Grid,
  TextField,
  Button,
  Autocomplete,
  MenuItem,
  Chip,
  Slider,
  Typography,
} from '@mui/material';
import FormModal from '@components/Modal/FormModal';
import Loader from '@components/Loader/Loader';
import SmartInput from '@components/SmartInput/SmartInput';
import { useInput } from '@hooks/useInput';
import { createFeature, updateFeature, generateUserStories } from '@redux/release/actions/release.actions';
import { validators } from '@utils/validators';
import { PRIORITIES } from '../ProductRoadmapConstants';

const useStyles = makeStyles((theme) => ({
  formTitle: {
    fontWeight: 'bold',
    marginTop: '1em',
    textAlign: 'center',
  },
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
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

const AddFeatures = ({
  location,
  statuses,
  releases,
  dispatch,
  products,
  credentials,
  loading,
  history,
  features,
  user_stories,
}) => {
  const classes = useStyles();
  const redirectTo = location.state && location.state.from;
  const editPage = location.state && (location.state.type === 'edit' || location.state.type === 'view');
  const editData = (editPage && location.state.data) || {};
  const product_uuid = location.state && location.state.product_uuid;
  const viewPage = (location.state && location.state.type === 'view') || false;
  // eslint-disable-next-line no-nested-ternary
  const formTitle = viewPage ? 'View Feature' : editPage ? 'Edit Feature' : 'Add Feature';
  const buttonText = editPage ? 'Save' : 'Add Feature';

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);

  const [formError, setFormError] = useState({});
  const [assigneeData, setAssigneeData] = useState([]);

  // form fields definition
  const name = useInput((editData && editData.name) || '', { required: true, productFeatures: features });
  const description = useInput((editData && editData.description) || '', { required: true });
  const priority = useInput((editData && editData.priority) || '', { required: true });

  const [tagList, setTagList] = useState([]);
  const [tags, setTags] = useState((editData && editData.tags) || []);

  const statusID = useInput((editData && editData.status) || '', { required: true });
  const [status, setStatus] = useState({ status: '' });
  const [colID, setColID] = useState({ colID: (editData && status?.status_tracking_id) || '' });

  const releaseUuid = useInput((editData && editData.release_uuid) || '', { required: true });
  const [release, setRelease] = useState(releaseUuid.value);

  const complexityValue = useInput((editData && editData.complexity) || 1, { required: true });
  const [complexity, setComplexity] = useState(complexityValue.value);

  const [assignees, setAssignees] = useState(
    (editData && editData.feature_detail && _.map(editData.feature_detail.assigneees, 'username'))
    || [],
  );

  const [userTypes, setUserTypes] = useState(
    (editData && editData.feature_detail && _.keys(editData.feature_detail.user_stories))
    || [],
  );
  const [userStories, setUserStories] = useState(
    (editData && editData.feature_detail && editData.feature_detail.user_stories)
    || [],
  );

  const complexityMarkers = [
    {
      value: 1,
      label: 1,
    },
    {
      value: 2,
      label: 2,
    },
    {
      value: 3,
      label: 3,
    },
    {
      value: 4,
      label: 4,
    },
    {
      value: 5,
      label: 5,
    },
  ];

  const valuetext = (value) => value.toString();

  useEffect(() => {
    const prod = _.find(products, { product_uuid });
    const assigneeOptions = _.map(prod?.feature_tool_detail?.user_list, 'username') || [];
    const productUserTypes = _.map((prod?.product_info?.user_labels || []), 'label');

    setAssigneeData(assigneeOptions);
    setTagList(prod?.feature_tool_detail?.labels || []);

    if (_.isEmpty(userTypes)) {
      setUserTypes(productUserTypes);
    }
    if (_.isEmpty(userStories)) {
      setUserStories(_.map(productUserTypes, (p) => ''));
    }
  }, [products]);

  useEffect(() => {
    if (editData) {
      const sts = _.find(statuses, { status_uuid: editData.status });
      setStatus(sts);
      setColID(sts?.status_tracking_id);
    }
  }, [statuses]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const dateTime = new Date();
    const featCred = _.find(credentials, (cred) => (_.toLower(cred.auth_detail.tool_type) === 'feature'));
    const finalUserStories = {};

    _.forEach(userTypes, (ut, index) => {
      finalUserStories = {
        ...finalUserStories,
        [ut]: userStories[index],
      };
    });

    const formData = {
      ...editData,
      edit_date: dateTime,
      name: name.value,
      description: description.value,
      complexity,
      release_uuid: release,
      status: statusID.value,
      priority: priority.value,
      tags,
      product_uuid,
      ...featCred?.auth_detail,
      feature_detail: {
        assigneees: _.filter(assigneeData, (user) => (
          !!user && _.includes(assignees, user.username)
        )),
        user_stories: finalUserStories,
      },
    };

    if (editPage) {
      formData.column_id = colID;
      dispatch(updateFeature(formData));
    } else {
      formData.create_date = dateTime;
      dispatch(createFeature(formData));
    }

    history.push(redirectTo);
  };

  const handleBlur = (e, validation, input, parentId) => {
    const validateObj = validators(validation, input);
    const prevState = { ...formError };
    if (validateObj && validateObj.error) {
      setFormError({
        ...prevState,
        [e.target.id || parentId]: validateObj,
      });
    } else {
      setFormError({
        ...prevState,
        [e.target.id || parentId]: {
          error: false,
          message: '',
        },
      });
    }
  };

  const sanitizeString = (value) => value.replace(/(<([^>]+)>)/gi, '');

  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);

    if (
      !name.value
      || !sanitizeString(description.value).length
      || !statusID.value
      || !priority.value
    ) {
      return true;
    }

    let errorExists = false;
    _.forEach(errorKeys, (key) => {
      if (formError[key].error) {
        errorExists = true;
      }
    });

    return errorExists;
  };

  const handleClose = () => {
    const dataHasChanged = (
      name.hasChanged()
    || priority.hasChanged()
    || statusID.hasChanged()
    || (!editPage && (!_.isEmpty(tags) || !_.isEmpty(assignees)))
    || !!(editPage && editData && !_.isEqual((editData.tags || []), tags))
    || !!(editPage && editData && editData.feature_detail
      && !_.isEqual(_.map(editData.feature_detail.assigneees, 'username'), assignees))
    );

    if (dataHasChanged) {
      setConfirmModal(true);
    } else {
      setFormModal(false);
      history.push(redirectTo);
    }
  };

  const requestUserStories = () => {}

  return (
    <>
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={handleClose}
          title={formTitle}
          titleClass={classes.formTitle}
          maxWidth="md"
          wantConfirm
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={(e) => history.push(redirectTo)}
        >
          {loading && <Loader open={loading} />}
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <Grid container spacing={isDesktop ? 2 : 0}>
              {/* Name */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Title"
                  name="name"
                  autoComplete="name"
                  error={
                    formError.name
                    && formError.name.error
                  }
                  helperText={
                    formError.name
                      ? formError.name.message
                      : ''
                  }
                  onBlur={(e) => handleBlur(e, 'duplicate', name)}
                  {...name.bind}
                  disabled={viewPage}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <SmartInput
                  onEditorValueChange={description.setNewValue}
                  value={description.value}
                  inputLabel="Description"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>

              {/* Release */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  select
                  id="release"
                  label="Release"
                  name="release"
                  value={release}
                  autoComplete="release"
                  disabled={viewPage}
                  onChange={(e) => {
                    const selectedRelease = e.target.value;
                    setRelease(selectedRelease);
                    releaseUuid.setNewValue(selectedRelease);
                  }}
                >
                  {_.map(releases, (rl) => (
                    <MenuItem
                      key={`release-${rl.release_uuid}-${rl.name}`}
                      value={rl.release_uuid}
                    >
                      {rl.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Complexity */}
              <Grid item xs={12}>
                <Typography gutterBottom>Complexity</Typography>
                <Slider
                  aria-label="Complexity"
                  defaultValue={complexity}
                  step={1}
                  min={1}
                  max={5}
                  getAriaValueText={valuetext}
                  valueLabelDisplay="auto"
                  marks={complexityMarkers}
                  onChange={(e) => {
                    const complexityObj = e.target.value;
                    setComplexity(complexityObj);
                    complexityValue.setNewValue(complexityObj.value);
                  }}
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} md={8}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  select
                  id="status"
                  label="Status"
                  name="status"
                  value={status}
                  autoComplete="status"
                  disabled={viewPage}
                  onChange={(e) => {
                    const stat = e.target.value;
                    setStatus(stat);
                    statusID.setNewValue(stat.status_uuid);
                    setColID(stat.status_tracking_id);
                  }}
                >
                  {_.map(statuses, (sts) => (
                    <MenuItem
                      key={`status-${sts.status_uuid}-${sts.name}`}
                      value={sts}
                    >
                      {sts.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Priority */}
              <Grid item xs={12} md={4}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  select
                  id="priority "
                  label="Priority"
                  name="priority"
                  autoComplete="priority"
                  error={
                    formError.priority
                    && formError.priority.error
                  }
                  helperText={
                    formError.priority
                      ? formError.priority.message
                      : ''
                  }
                  onBlur={(e) => handleBlur(e, 'required', priority)}
                  {...priority.bind}
                  disabled={viewPage}
                >
                  {_.map(PRIORITIES, (prty, idx) => (
                    <MenuItem
                      key={`priority-${idx}`}
                      value={prty}
                    >
                      {prty}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {/* Tags */}
            {!_.isEmpty(tagList) && (
              <Grid item xs={12}>
                <Autocomplete
                  fullWidth
                  multiple
                  filterSelectedOptions
                  id="tags"
                  options={tagList}
                  value={tags}
                  onChange={(e, newValue) => setTags(newValue)}
                  renderTags={(value, getTagProps) => (
                    _.map(value, (option, index) => (
                      <Chip
                        variant="default"
                        label={option}
                        {...getTagProps({ index })}
                      />
                    ))
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Tags"
                      margin="normal"
                    />
                  )}
                  disabled={viewPage}
                />
              </Grid>
            )}

            {/* Assignees */}
            {!_.isEmpty(assigneeData) && (
              <Grid item xs={12} md={8}>
                <Autocomplete
                  fullWidth
                  multiple
                  filterSelectedOptions
                  id="assignees"
                  options={assigneeData}
                  value={assignees}
                  onChange={(e, newValue) => setAssignees(newValue)}
                  renderTags={(value, getAssigneeProps) => (
                    _.map(value, (option, index) => (
                      <Chip
                        variant="default"
                        label={option}
                        {...getAssigneeProps({ index })}
                      />
                    ))
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Assignees"
                      margin="normal"
                    />
                  )}
                  disabled={viewPage}
                />
              </Grid>
            )}

            {/* User Stories */}
            {!_.isEmpty(userTypes) && (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                onClick={requestUserStories}
                className={classes.submit}
              >
                Generate User Stories
              </Button>
            )}
            {!_.isEmpty(userTypes) && _.map(userTypes, (ut, index) => (
              <TextField
                key={`${ut}-${index}`}
                variant="outlined"
                margin="normal"
                fullWidth
                id={`${ut}-user-story`}
                label={`User Story for ${_.capitalize(ut)}`}
                name={`${ut}-user-story`}
                value={userStories[ut]}
                autoComplete={`${ut}-user-story`}
                disabled={viewPage}
                onChange={(e) => {
                  setUserStories({ ...userStories, [ut]: e.target.value })
                }}
              />
            ))}

            <Grid container spacing={3} className={classes.buttonContainer}>
              <Grid item xs={12} sm={4}>
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={handleClose}
                  className={classes.submit}
                >
                  Cancel
                </Button>
              </Grid>

              {!viewPage && (
                <Grid item xs={12} sm={4}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    className={classes.submit}
                    disabled={submitDisabled()}
                  >
                    {buttonText}
                  </Button>
                </Grid>
              )}
            </Grid>
          </form>
        </FormModal>
      )}
    </>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  loading: state.productReducer.loading || state.releaseReducer.loading,
  statuses: state.releaseReducer.statuses,
  products: state.productReducer.products,
  credentials: state.productReducer.credentials,
  features: state.releaseReducer.features,
  releases: state.releaseReducer.releases,
  user_stories: state.releaseReducer.user_stories,
});

export default connect(mapStateToProps)(AddFeatures);
