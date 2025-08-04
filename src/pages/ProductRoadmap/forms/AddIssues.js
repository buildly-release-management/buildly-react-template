/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, useContext } from 'react';
import _ from 'lodash';
import moment from 'moment-timezone';
import { useQuery } from 'react-query';
import makeStyles from '@mui/styles/makeStyles';
import {
  useTheme,
  useMediaQuery,
  Grid,
  TextField,
  Button,
  MenuItem,
  Autocomplete,
  Chip,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import DatePickerComponent from '@components/DatePicker/DatePicker';
import FormModal from '@components/Modal/FormModal';
import Loader from '@components/Loader/Loader';
import AIFormHelper from '@components/AIFormHelper/AIFormHelper';
import useAlert from '@hooks/useAlert';
import { useInput } from '@hooks/useInput';
import useOrganizationMembers from '@hooks/useOrganizationMembers';
import { validators } from '@utils/validators';
import { UserContext } from '@context/User.context';
import SmartInput from '@components/SmartInput/SmartInput';
import { getAllProductQuery } from '@react-query/queries/product/getAllProductQuery';
import { getAllCredentialQuery } from '@react-query/queries/product/getAllCredentialQuery';
import { getAllStatusQuery } from '@react-query/queries/release/getAllStatusQuery';
import { getAllFeatureQuery } from '@react-query/queries/release/getAllFeatureQuery';
import { useCreateIssueMutation } from '@react-query/mutations/release/createIssueMutation';
import { useUpdateIssueMutation } from '@react-query/mutations/release/updateIssueMutation';
import { hasGlobalAdminRights } from '@utils/permissions';
import { ISSUETYPES } from '../ProductRoadmapConstants';

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

const AddIssues = ({ history, location }) => {
  const classes = useStyles();
  const redirectTo = location.state && location.state.from;
  const editPage = location.state && location.state.type === 'edit';
  const editData = (editPage && location.state.data) || {};
  const buttonText = editPage ? 'Save' : 'Add Issue';
  const formTitle = editPage ? 'Edit Issue' : 'Add Issue';

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const user = useContext(UserContext);
  const organization = user.organization.organization_uuid;
  const user_profile = _.toLower(user.user_type);
  const isSuperAdmin = hasGlobalAdminRights(user);
  const { displayAlert } = useAlert();

  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);
  const { product_uuid } = location && location.state;

  const [description, setDescription] = useState((editData && editData.description) || '');
  const name = useInput((editData && editData.name) || '', { required: true });

  const featureUuid = useInput((editData && editData.feature) || '');
  const [feature, setFeatureValue] = useState(featureUuid.value);

  const type = useInput((editData && editData.issue_type) || '', { required: true });
  const [startDate, handleStartDateChange] = useState(moment(
    (editData && editData.start_date) || moment(),
  ));
  const [endDate, handleEndDateChange] = useState(moment(
    (editData && editData.end_date) || moment(),
  ));
  const [tagList, setTagList] = useState([]);
  const [tags, setTags] = useState((editData && editData.tags) || []);
  const estimate = useInput((editData && editData.estimate) || '');
  const complexity = useInput((editData && editData.complexity) || 0);
  const [assignees, setAssignees] = useState(
    (editData && editData.issue_detail && _.map(editData.issue_detail.assignees))
    || [],
  );
  const [assignedDeveloper, setAssignedDeveloper] = useState(
    (editData && editData.assigned_developer_uuid) || null
  );
  const [productTeamMember, setProductTeamMember] = useState(
    (editData && editData.product_team_uuid) || null
  );
  const [developerGithubUsername, setDeveloperGithubUsername] = useState(
    (editData && editData.developer_github_username) || ''
  );
  const [hasGithubProfile, setHasGithubProfile] = useState(
    (editData && editData.has_github_profile) || false
  );
  const [assigneeData, setAssigneeData] = useState([]);
  const [repoList, setRepoList] = useState([]);

  // Fetch organization members for user assignment
  const { data: organizationMembers = [], isLoading: isMembersLoading } = useOrganizationMembers();

  const repo = useInput((editData && editData.repository) || '', { required: true });
  const statusID = useInput((editData && editData.status) || '');
  const [status, setStatus] = useState('');
  const [colID, setColID] = useState((editData && status?.status_tracking_id) || '');
  const [formError, setFormError] = useState({});

  // react query
  const { data: statusData, isLoading: isAllStatusLoading } = useQuery(
    ['allStatuses', product_uuid],
    () => getAllStatusQuery(product_uuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(product_uuid) && !_.isEqual(_.toNumber(product_uuid), 0) },
  );
  const { data: productData, isLoading: isAllProductLoading } = useQuery(
    ['allProducts', organization],
    () => getAllProductQuery(organization, displayAlert),
    { refetchOnWindowFocus: false },
  );
  const { data: featureData, isLoading: isAllFeatureLoading } = useQuery(
    ['allFeatures', product_uuid],
    () => getAllFeatureQuery(product_uuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(product_uuid) && !_.isEqual(_.toNumber(product_uuid), 0) },
  );
  const { data: credentialData, isLoading: isAllCredentialLoading } = useQuery(
    ['allCredentials', product_uuid],
    () => getAllCredentialQuery(product_uuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(product_uuid) && !_.isEqual(_.toNumber(product_uuid), 0) },
  );

  useEffect(() => {
    const prod = _.find(productData, { product_uuid });
    const externalAssigneeOptions = _.map(prod?.issue_tool_detail?.user_list) || [];
    
    // Convert organization members to the same format as external assignees
    const orgMemberOptions = organizationMembers.map(member => ({
      user_id: member.user_uuid,
      username: member.username,
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      source: 'organization' // Mark as organization member
    }));
    
    // Merge external and organization users, preferring organization members for duplicates
    const combinedOptions = [...orgMemberOptions];
    externalAssigneeOptions.forEach(extUser => {
      const existingUser = combinedOptions.find(user => 
        user.email === extUser.email || user.username === extUser.username
      );
      if (!existingUser) {
        combinedOptions.push({ ...extUser, source: 'external' });
      }
    });

    setRepoList(prod?.issue_tool_detail?.repository_list || []);
    setAssigneeData(combinedOptions);
    console.log('AddIssues: Updated assignee data with organization members:', combinedOptions.length);
  }, [productData, organizationMembers]);

  useEffect(() => {
    if (editData) {
      const sts = _.find(statusData, { status_uuid: editData.status });
      setStatus(sts);
      setColID(sts?.status_tracking_id);
    }
  }, [statusData]);

  const closeFormModal = () => {
    const dataHasChanged = (
      name.hasChanged()
      || featureUuid.hasChanged()
      || type.hasChanged()
      || statusID.hasChanged()
      || repo.hasChanged()
      || !!((editData && editData.start_date) && !_.isEqual(moment(editData.start_date).format('L'), moment(startDate).format('L')))
      || !!((editData && editData.end_date) && !_.isEqual(moment(editData.end_date).format('L'), moment(endDate).format('L')))
      || (!editPage && (!_.isEmpty(tags) || !_.isEmpty(assignees)))
      || !!(editPage && editData && !_.isEqual(editData.tags, tags))
      || !!(editPage && editData && editData.issue_detail && !_.isEqual(editData.issue_detail.assignees, assignees))
    );

    if (dataHasChanged) {
      setConfirmModal(true);
    } else {
      setFormModal(false);
      history.push(redirectTo);
    }
  };

  const { mutate: createIssueMutation, isLoading: isCreatingIssueLoading } = useCreateIssueMutation(product_uuid, history, redirectTo, displayAlert);
  const { mutate: updateIssueMutation, isLoading: isUpdatingIssueLoading } = useUpdateIssueMutation(product_uuid, history, redirectTo, displayAlert);

  const handleSubmit = (event) => {
    event.preventDefault();
    const dateTime = new Date();
    const issueCred = _.find(credentialData, (cred) => (_.toLower(cred.auth_detail.tool_type) === 'issue'));
    const formData = {
      ...editData,
      edit_date: dateTime,
      name: name.value,
      description,
      feature,
      issue_type: type.value,
      start_date: startDate,
      end_date: endDate,
      status: statusID.value,
      tags,
      product_uuid,
      estimate: estimate.value,
      complexity: Number(complexity.value),
      repository: repo.value,
      column_id: colID,
      // New UUID-based assignment fields
      assigned_developer_uuid: assignedDeveloper,
      product_team_uuid: productTeamMember,
      developer_github_username: developerGithubUsername,
      has_github_profile: hasGithubProfile,
      issue_detail: {
        ...(editData.issue_detail || {}),
        assignees, // Keep legacy assignees for backward compatibility
      },
      ...issueCred?.auth_detail,
    };
    if (editPage) {
      // eslint-disable-next-line no-prototype-builtins
      if (formData.hasOwnProperty('name')) {
        delete formData.assignees;
      }
      updateIssueMutation(formData);
    } else {
      formData.create_date = dateTime;
      createIssueMutation(formData);
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

  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (
      !name.value
      || !description
      || !feature
      || !type.value
      || !statusID.value
      || (!_.isEmpty(repoList) && !repo.value)
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

  return (
    <>
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={closeFormModal}
          title={formTitle}
          titleClass={classes.formTitle}
          maxWidth="md"
          wantConfirm
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={(e) => history.push(redirectTo)}
        >
          {(isCreatingIssueLoading || isUpdatingIssueLoading || isAllStatusLoading || isAllProductLoading || isAllFeatureLoading || isAllCredentialLoading)
          && <Loader open={isCreatingIssueLoading || isUpdatingIssueLoading || isAllStatusLoading || isAllProductLoading || isAllFeatureLoading || isAllCredentialLoading} />}
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <Grid container spacing={isDesktop ? 2 : 0}>
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
                    onBlur={(e) => handleBlur(e, 'required', name)}
                    {...name.bind}
                  />
                  <AIFormHelper
                    fieldType="issue-title"
                    onSuggestion={(suggestion) => name.setValue(suggestion)}
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" alignItems="flex-start">
                  <SmartInput
                    onEditorValueChange={setDescription}
                    value={description}
                    inputLabel="Description"
                    required
                  />
                  <AIFormHelper
                    fieldType="issue-description"
                    onSuggestion={(suggestion) => setDescription(suggestion)}
                    size="small"
                    context={{ issueTitle: name.value }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  select
                  id="feature"
                  label="Feature"
                  name="feature"
                  autoComplete="feature"
                  value={feature}
                  onChange={(e) => {
                    const selectedFeature = e.target.value;
                    setFeatureValue(selectedFeature);
                    featureUuid.setNewValue(selectedFeature);
                  }}
                >
                  {_.map(featureData, (feat) => (
                    <MenuItem
                      key={`feature-${feat.feature_uuid}-${feat.name}`}
                      value={feat.feature_uuid}
                    >
                      {feat.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  select
                  id="type"
                  label="Issue Type"
                  name="type"
                  autoComplete="type"
                  error={
                    formError.type
                    && formError.type.error
                  }
                  helperText={
                    formError.type
                      ? formError.type.message
                      : ''
                  }
                  onBlur={(e) => handleBlur(e, 'required', type)}
                  {...type.bind}
                >
                  {_.map(ISSUETYPES, (tp, idx) => (
                    <MenuItem
                      key={`issue-type-${idx}`}
                      value={tp}
                    >
                      {tp}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {!_.isEmpty(repoList) && (
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    select
                    id="repo"
                    label="Repository"
                    name="repo"
                    autoComplete="repo"
                    value={repo.value}
                    onChange={(e) => {
                      const repository = e.target.value;
                      repo.setNewValue(repository);
                      const repoLabels = _.find(repoList, (item) => item.id === repository);
                      setTagList(repoLabels.labels || []);
                    }}
                  >
                    {_.map(repoList, (rep) => (
                      <MenuItem
                        key={`rep-${rep.id}-${rep.name}`}
                        value={rep.id}
                      >
                        {rep.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <DatePickerComponent
                  label="Start Date"
                  selectedDate={startDate}
                  hasTime
                  handleDateChange={handleStartDateChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePickerComponent
                  label="End Date"
                  selectedDate={endDate}
                  hasTime
                  handleDateChange={handleEndDateChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  select
                  id="status"
                  label="Status"
                  name="status"
                  autoComplete="status"
                  value={status}
                  onChange={(e) => {
                    const stat = e.target.value;
                    setStatus(stat);
                    statusID.setNewValue(stat?.status_uuid);
                    setColID(stat?.status_tracking_id);
                  }}
                >
                  {_.map(statusData, (sts) => (
                    <MenuItem
                      key={`status-${sts.status_uuid}-${sts.name}`}
                      value={sts}
                    >
                      {sts.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {!_.isEmpty(repo) && (
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
                  />
                </Grid>
              )}
              {!_.isEmpty(assigneeData) && (isSuperAdmin || _.isEqual(user_profile, 'developer')) && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                      Task Assignment
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Assign this task to specific team members using the new UUID-based assignment system
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      fullWidth
                      id="assigned-developer"
                      name="assigned-developer"
                      options={assigneeData.filter(user => 
                        user.user_type === 'Developer' || 
                        user.role?.toLowerCase().includes('developer') ||
                        user.role?.toLowerCase().includes('engineer') ||
                        user.username?.toLowerCase().includes('dev')
                      )}
                      value={assigneeData.find(user => user.user_id === assignedDeveloper) || null}
                      getOptionLabel={(option) => `👨‍💻 ${option.username} ${option.role ? `(${option.role})` : ''}`}
                      onChange={(e, newValue) => {
                        setAssignedDeveloper(newValue ? newValue.user_id : null);
                        // Auto-detect GitHub profile
                        if (newValue && newValue.username) {
                          setDeveloperGithubUsername(newValue.username);
                          setHasGithubProfile(true);
                        } else {
                          setDeveloperGithubUsername('');
                          setHasGithubProfile(false);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          label="👨‍💻 Assigned Developer"
                          placeholder="Select primary developer"
                          helperText="Primary developer responsible for implementation"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      fullWidth
                      id="product-team-member"
                      name="product-team-member"
                      options={assigneeData.filter(user => 
                        user.user_type === 'Product Team' || 
                        user.role?.toLowerCase().includes('product') ||
                        user.role?.toLowerCase().includes('manager') ||
                        user.role?.toLowerCase().includes('owner')
                      )}
                      value={assigneeData.find(user => user.user_id === productTeamMember) || null}
                      getOptionLabel={(option) => `📋 ${option.username} ${option.role ? `(${option.role})` : ''}`}
                      onChange={(e, newValue) => {
                        setProductTeamMember(newValue ? newValue.user_id : null);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          label="📋 Product Team Member"
                          placeholder="Select product team member"
                          helperText="Product team member for oversight and approval"
                        />
                      )}
                    />
                  </Grid>

                  {/* GitHub Integration Fields */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      id="developer-github-username"
                      label="GitHub Username"
                      name="developer-github-username"
                      value={developerGithubUsername}
                      onChange={(e) => {
                        setDeveloperGithubUsername(e.target.value);
                        setHasGithubProfile(!!e.target.value);
                      }}
                      placeholder="developer-github-username"
                      helperText="GitHub username for repository access and tracking"
                      InputProps={{
                        startAdornment: <span style={{ marginRight: '8px' }}>🐱</span>
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={hasGithubProfile}
                          onChange={(e) => setHasGithubProfile(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Developer has GitHub profile"
                      sx={{ mt: 2 }}
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
                      💡 <strong>New Assignment System:</strong> Use specific developer and product team assignments for better tracking. 
                      GitHub integration enables automatic repository access and commit tracking for assigned developers.
                    </Typography>
                  </Grid>
                </>
              )}
              
              {/* Fallback for existing single assignment field */}
              {!_.isEmpty(assigneeData) && (isSuperAdmin || _.isEqual(user_profile, 'developer')) && 
               assigneeData.every(user => !user.user_type && !user.role) && (
                <Grid item xs={12}>
                  <Autocomplete
                    fullWidth
                    multiple
                    filterSelectedOptions
                    id="assignees"
                    name="assignees"
                    options={assigneeData}
                    value={assignees.map(assigneeId => assigneeData.find(u => u.user_id === assigneeId)).filter(Boolean)}
                    getOptionLabel={(option) => option.username}
                    onChange={(e, newValue) => setAssignees(_.map(newValue, 'user_id'))}
                    renderTags={(value, getAssigneeProps) => (
                      _.map(value, (option, index) => (
                        <Chip
                          variant="default"
                          label={option.username}
                          {...getAssigneeProps({ index })}
                        />
                      ))
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        fullWidth
                        label="Assignees"
                        {...assignees.bind}
                      />
                    )}
                  />
                </Grid>
              )}
              {editPage && (
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    disabled
                    id="estimate"
                    label="Estimate"
                    name="estimate"
                    autoComplete="estimate"
                    helperText={
                      formError.estimate
                        ? formError.estimate.message
                        : ''
                    }
                    {...estimate.bind}
                  />
                </Grid>
              )}
              {editPage && (
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    disabled
                    type="number"
                    id="complexity"
                    label="Complexity"
                    name="complexity"
                    autoComplete="complexity"
                    helperText={
                      formError.complexity
                        ? formError.complexity.message
                        : ''
                    }
                    {...complexity.bind}
                  />
                </Grid>
              )}
            </Grid>
            <Grid container spacing={isDesktop ? 3 : 0} justifyContent="center">
              <Grid item xs={12} sm={4}>
                <Button
                  type="button"
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={closeFormModal}
                  className={classes.submit}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  disabled={
                    isCreatingIssueLoading
                    || isUpdatingIssueLoading
                    || isAllStatusLoading
                    || isAllProductLoading
                    || isAllFeatureLoading
                    || isAllCredentialLoading
                    || submitDisabled()
                  }
                >
                  {buttonText}
                </Button>
              </Grid>
            </Grid>
          </form>
        </FormModal>
      )}
    </>
  );
};

export default AddIssues;
