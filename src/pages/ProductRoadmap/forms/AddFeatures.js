import React, { useState, useEffect, useContext } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
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
  Box,
} from '@mui/material';
import { UserContext } from '@context/User.context';
import FormModal from '@components/Modal/FormModal';
import Loader from '@components/Loader/Loader';
import SmartInput from '@components/SmartInput/SmartInput';
import AIFormHelper from '@components/AIFormHelper/AIFormHelper';
import useAlert from '@hooks/useAlert';
import { useInput } from '@hooks/useInput';
import { validators } from '@utils/validators';
import { getAllProductQuery } from '@react-query/queries/product/getAllProductQuery';
import { getAllCredentialQuery } from '@react-query/queries/product/getAllCredentialQuery';
import { getAllStatusQuery } from '@react-query/queries/release/getAllStatusQuery';
import { getAllFeatureQuery } from '@react-query/queries/release/getAllFeatureQuery';
import { getAllReleaseQuery } from '@react-query/queries/release/getAllReleaseQuery';
import { useCreateFeatureMutation } from '@react-query/mutations/release/createFeatureMutation';
import { useUpdateFeatureMutation } from '@react-query/mutations/release/updateFeatureMutation';
import { generateUserStoriesQuery } from '@react-query/queries/release/generateUserStories';
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
  userStoryButton: {
    margin: theme.spacing(3, 0, 2),
    borderRadius: '18px',
    float: 'right',
  },
}));

const AddFeatures = ({ location, history }) => {
  const classes = useStyles();
  const redirectTo = location.state && location.state.from;
  const editPage = location.state && (location.state.type === 'edit' || location.state.type === 'view');
  const editData = (editPage && location.state.data) || {};
  const { product_uuid } = location && location.state;
  const viewPage = (location.state && location.state.type === 'view') || false;
  // eslint-disable-next-line no-nested-ternary
  const formTitle = viewPage ? 'View Feature' : editPage ? 'Edit Feature' : 'Add Feature';
  const buttonText = editPage ? 'Save' : 'Add Feature';

  const user = useContext(UserContext);
  const organization = user.organization.organization_uuid;
  const { displayAlert } = useAlert();

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);

  const [formError, setFormError] = useState({});

  // form fields definition
  const name = useInput((editData && editData.name) || '', { required: true });
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

  const [userTypes, setUserTypes] = useState(
    (editData && editData.feature_detail && _.keys(editData.feature_detail.user_stories))
    || [],
  );
  const [userProfiles, setUserProfiles] = useState({});
  const [userStories, setUserStories] = useState(
    (editData && editData.feature_detail && editData.feature_detail.user_stories)
    || [],
  );
  const [userStoriesData, setUserStoriesData] = useState([]);

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

  // react query
  const { data: statuses, isLoading: isAllStatusLoading } = useQuery(
    ['allStatuses', product_uuid],
    () => getAllStatusQuery(product_uuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(product_uuid) && !_.isEqual(_.toNumber(product_uuid), 0) },
  );
  const { data: products, isLoading: isAllProductLoading } = useQuery(
    ['allProducts', organization],
    () => getAllProductQuery(organization, displayAlert),
    { refetchOnWindowFocus: false },
  );
  const { data: features, isLoading: isAllFeatureLoading } = useQuery(
    ['allFeatures', product_uuid],
    () => getAllFeatureQuery(product_uuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(product_uuid) && !_.isEqual(_.toNumber(product_uuid), 0) },
  );
  const { data: credentials, isLoading: isAllCredentialLoading } = useQuery(
    ['allCredentials', product_uuid],
    () => getAllCredentialQuery(product_uuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(product_uuid) && !_.isEqual(_.toNumber(product_uuid), 0) },
  );
  const { data: releases, isLoading: isAllReleaseLoading } = useQuery(
    ['allReleases', product_uuid],
    () => getAllReleaseQuery(product_uuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(product_uuid) && !_.isEqual(_.toNumber(product_uuid), 0) },
  );
  const { data: suggestedUserStories, isLoading: isSuggestingUserStories } = useQuery(
    ['userStories', userStoriesData],
    () => generateUserStoriesQuery(userStoriesData, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(userStoriesData) },
  );

  const { mutate: createFeatureMutation, isLoading: isCreatingFeatureLoading } = useCreateFeatureMutation(product_uuid, history, redirectTo, displayAlert);
  const { mutate: updateFeatureMutation, isLoading: isUpdatingFeatureLoading } = useUpdateFeatureMutation(product_uuid, history, redirectTo, displayAlert);

  useEffect(() => {
    const prod = _.find(products, { product_uuid });
    const productUserTypes = _.map((prod?.product_info?.user_labels || []), 'label');
    let productUserProfiles = {};

    _.forEach(prod?.product_info?.user_labels || [], (ul) => {
      productUserProfiles = {
        ...productUserProfiles,
        [ul.label]: ul.profile,
      };
    });

    setTagList(prod?.feature_tool_detail?.labels || []);
    setUserProfiles(productUserProfiles);

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

  useEffect(() => {
    if (!_.isEmpty(suggestedUserStories)) {
      setUserStories(suggestedUserStories);
    }
  }, [suggestedUserStories]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const dateTime = new Date();
    const featCred = _.find(credentials, (cred) => (_.toLower(cred.auth_detail.tool_type) === 'feature'));
    let finalUserStories = {};

    _.forEach(userTypes, (ut) => {
      finalUserStories = {
        ...finalUserStories,
        [ut]: userStories[ut],
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
        ...(editData.feature_detail || {}),
        user_stories: finalUserStories,
      },
    };

    if (editPage) {
      formData.column_id = colID;
      updateFeatureMutation(formData);
    } else {
      formData.create_date = dateTime;
      createFeatureMutation(formData);
    }
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
    || (!editPage && !_.isEmpty(tags)))
    || !!(editPage && editData && !_.isEqual((editData.tags || []), tags))
    || !!(editPage && editData && !_.isEmpty(suggestedUserStories) && !_.isEqual(editData.feature_detail.user_stories, suggestedUserStories));

    if (dataHasChanged) {
      setConfirmModal(true);
    } else {
      setFormModal(false);
      history.push(redirectTo);
    }
  };

  const requestUserStories = async () => {
    const userTypeProfiles = _.map(userTypes, (ut) => userProfiles[ut] || '');
    setUserStoriesData({ user_types: userTypes, user_profiles: userTypeProfiles, feature_uuid: editData.feature_uuid });
  };

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
          {(isCreatingFeatureLoading || isUpdatingFeatureLoading || isSuggestingUserStories || isAllStatusLoading
            || isAllProductLoading || isAllFeatureLoading || isAllCredentialLoading || isAllReleaseLoading)
          && (
          <Loader
            open={
              isCreatingFeatureLoading
              || isUpdatingFeatureLoading
              || isSuggestingUserStories
              || isAllStatusLoading
              || isAllProductLoading
              || isAllFeatureLoading
              || isAllCredentialLoading
              || isAllReleaseLoading
            }
          />
          )}
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <Grid container spacing={isDesktop ? 2 : 0}>
              {/* Name */}
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
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
                  {!viewPage && (
                    <AIFormHelper
                      fieldType="feature-title"
                      onSuggestion={(suggestion) => name.setValue(suggestion)}
                      size="small"
                    />
                  )}
                </Box>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <Box display="flex" alignItems="flex-start">
                  <SmartInput
                    onEditorValueChange={description.setNewValue}
                    value={description.value}
                    inputLabel="Description"
                  />
                  {!viewPage && (
                    <AIFormHelper
                      fieldType="feature-description"
                      onSuggestion={(suggestion) => description.setValue(suggestion)}
                      size="small"
                      context={{ featureTitle: name.value }}
                    />
                  )}
                </Box>
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

            {/* Feature Assignment Section */}
            {!_.isEmpty(credentials) && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                    Feature Assignment
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Assign this feature to team members for development and product oversight
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    id="developer-lead"
                    label="👨‍💻 Lead Developer"
                    name="developer-lead"
                    placeholder="Assign primary developer"
                    helperText="Primary developer responsible for implementation"
                    disabled={viewPage}
                    InputProps={{
                      startAdornment: <span style={{ marginRight: '8px' }}>👨‍💻</span>
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    id="product-owner"
                    label="📋 Product Owner"
                    name="product-owner"
                    placeholder="Assign product owner"
                    helperText="Product team member overseeing requirements"
                    disabled={viewPage}
                    InputProps={{
                      startAdornment: <span style={{ marginRight: '8px' }}>📋</span>
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    mt: 1, 
                    p: 2, 
                    backgroundColor: '#F8F9FA', 
                    borderRadius: 1,
                    border: '1px solid #E0E0E0'
                  }}>
                    💡 <strong>Assignment Guidelines:</strong> Assign a lead developer for technical implementation 
                    and a product owner for requirements validation. This ensures clear ownership and accountability 
                    throughout the feature development lifecycle.
                  </Typography>
                </Grid>
              </>
            )}

            {/* User Stories */}
            {!_.isEmpty(userTypes) && (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                onClick={requestUserStories}
                className={classes.userStoryButton}
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
                multiline
                maxRows={5}
                id={`${ut}-user-story`}
                label={`User Story for ${_.capitalize(ut)}`}
                name={`${ut}-user-story`}
                value={userStories[ut]}
                autoComplete={`${ut}-user-story`}
                disabled={viewPage}
                onChange={(e) => {
                  setUserStories({ ...userStories, [ut]: e.target.value });
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
                    disabled={
                      isCreatingFeatureLoading
                      || isUpdatingFeatureLoading
                      || isSuggestingUserStories
                      || isAllStatusLoading
                      || isAllProductLoading
                      || isAllFeatureLoading
                      || isAllCredentialLoading
                      || isAllReleaseLoading
                      || submitDisabled()
                    }
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

export default AddFeatures;
