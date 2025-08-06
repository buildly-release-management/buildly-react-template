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
  Slider,
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
import { getCurrentUserUuid } from '@utils/userUuid';
import { getAllTaskCategoriesQuery } from '@react-query/queries/businessTasks/getAllTaskCategoriesQuery';
import { getAllReleaseQuery } from '@react-query/queries/release/getAllReleaseQuery';
import { useCreateBusinessTaskMutation, useUpdateBusinessTaskMutation } from '@react-query/mutations/businessTasks/businessTaskMutations';
import { 
  TASK_PRIORITIES, 
  TASK_STATUSES, 
  STANDARD_TASK_CATEGORIES, 
  RECURRENCE_PATTERNS,
  RISK_LEVELS,
  getPriorityColor 
} from '@utils/businessTaskConstants';

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
  categoryChip: {
    margin: theme.spacing(0.5),
  },
  progressSection: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
}));

const AddBusinessTask = ({ history, location }) => {
  const classes = useStyles();
  const redirectTo = location.state && location.state.from;
  const editPage = location.state && location.state.type === 'edit';
  const editData = (editPage && location.state.data) || {};
  const buttonText = editPage ? 'Save Task' : 'Create Task';
  const formTitle = editPage ? 'Edit Business Task' : 'Create Business Task';

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const user = useContext(UserContext);
  const organization = user?.organization;
  const organizationUuid = organization?.organization_uuid;
  const { displayAlert } = useAlert();

  useEffect(() => {
    // Validate user context is available
    if (!user) {
      // User context not available
    }
  }, [user]);

  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);
  const { product_uuid, release_uuid } = location && location.state;

  // Form fields
  const title = useInput((editData && editData.title) || '', { required: true });
  const [description, setDescription] = useState((editData && editData.description) || '');
  const [selectedCategory, setSelectedCategory] = useState((editData && editData.category) || '');
  const [selectedCustomCategory, setSelectedCustomCategory] = useState((editData && editData.custom_category) || null);
  const [priority, setPriority] = useState((editData && editData.priority) || 'medium');
  const [status, setStatus] = useState((editData && editData.status) || 'not_started');
  const [assignedToUser, setAssignedToUser] = useState((editData && editData.assigned_to_user_uuid) || null);
  const [selectedRelease, setSelectedRelease] = useState((editData && editData.release_uuid) || release_uuid || '');
  const [releaseVersion, setReleaseVersion] = useState((editData && editData.release_version) || '');
  const [featureName, setFeatureName] = useState((editData && editData.feature_name) || '');
  const [milestone, setMilestone] = useState((editData && editData.milestone) || '');
  
  const [dueDate, setDueDate] = useState(
    editData && editData.due_date ? moment(editData.due_date) : null
  );
  const [estimatedHours, setEstimatedHours] = useState((editData && editData.estimated_hours) || '');
  const [actualHours, setActualHours] = useState((editData && editData.actual_hours) || '');
  
  // Advanced fields
  const [businessValue, setBusinessValue] = useState((editData && editData.business_value) || '');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState((editData && editData.acceptance_criteria) || '');
  const [successMetrics, setSuccessMetrics] = useState((editData && editData.success_metrics) || '');
  const [stakeholderEmails, setStakeholderEmails] = useState((editData && editData.stakeholder_emails) || []);
  const [tags, setTags] = useState((editData && editData.tags) || []);
  
  // Progress and risk fields
  const [progressPercentage, setProgressPercentage] = useState((editData && editData.progress_percentage) || 0);
  const [riskLevel, setRiskLevel] = useState((editData && editData.risk_level) || 'medium');
  const [riskDescription, setRiskDescription] = useState((editData && editData.risk_description) || '');
  const [blockers, setBlockers] = useState((editData && editData.blockers) || '');
  
  // Recurring task fields
  const [isRecurring, setIsRecurring] = useState((editData && editData.is_recurring) || false);
  const [recurrencePattern, setRecurrencePattern] = useState((editData && editData.recurrence_pattern) || '');
  const [requiresApproval, setRequiresApproval] = useState((editData && editData.requires_approval) || false);
  
  const [formError, setFormError] = useState({});

  // React queries
  const { data: taskCategoriesResponse, isLoading: isCategoriesLoading } = useQuery(
    ['taskCategories', organizationUuid],
    () => getAllTaskCategoriesQuery(organizationUuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !!organizationUuid }
  );

  // Ensure taskCategories is always an array
  const taskCategories = Array.isArray(taskCategoriesResponse) 
    ? taskCategoriesResponse 
    : taskCategoriesResponse?.results || [];

  const { data: releases, isLoading: isReleasesLoading } = useQuery(
    ['allReleases', product_uuid],
    () => getAllReleaseQuery(product_uuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !!product_uuid }
  );

  // Fetch organization members for user assignment
  const { data: organizationMembers = [], isLoading: isMembersLoading } = useOrganizationMembers();

  // Mutations
  const { mutate: createBusinessTaskMutation, isLoading: isCreatingTask } = useCreateBusinessTaskMutation(product_uuid, displayAlert);
  const { mutate: updateBusinessTaskMutation, isLoading: isUpdatingTask } = useUpdateBusinessTaskMutation(displayAlert);

  // Success handlers for mutations
  const handleCreateSuccess = () => {
    setFormModal(false);
    history.push(redirectTo);
  };

  const handleUpdateSuccess = () => {
    setFormModal(false);
    history.push(redirectTo);
  };

  const closeFormModal = () => {
    const dataHasChanged = (
      title.hasChanged() ||
      description !== (editData?.description || '') ||
      selectedCategory !== (editData?.category || '') ||
      priority !== (editData?.priority || 'medium') ||
      status !== (editData?.status || 'not_started')
    );

    if (dataHasChanged) {
      setConfirmModal(true);
    } else {
      setFormModal(false);
      history.push(redirectTo);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Required field validation
    const userUuidResult = getCurrentUserUuid(user);
    if (!title.isValid || !description.trim() || !product_uuid || !userUuidResult.uuid || !userUuidResult.isValid || !assignedToUser || (!selectedCategory && !selectedCustomCategory) || !priority || !status) {
      displayAlert('error', 'Missing required business task fields. Please complete all required fields.');
      return;
    }
    const taskData = {
      product_uuid,
      title: title.value.trim(),
      description: description.trim(),
      category: selectedCategory || 'general',
      priority: priority || 'medium',
      status: status || 'not_started',
      assigned_by_user_uuid: userUuidResult.uuid,
      assigned_to_user_uuid: assignedToUser,
      start_date: new Date().toISOString(),
      progress_percentage: progressPercentage || 0,
      risk_level: riskLevel || 'low',
      is_recurring: Boolean(isRecurring),
      requires_approval: Boolean(requiresApproval),
    };
    // Add optional fields only if they have values
    if (selectedCustomCategory) taskData.custom_category = selectedCustomCategory;
    if (selectedRelease) taskData.release_uuid = selectedRelease;
    if (releaseVersion) taskData.release_version = releaseVersion;
    if (featureName) taskData.feature_name = featureName;
    if (milestone) taskData.milestone = milestone;
    if (dueDate) taskData.due_date = dueDate.toISOString();
    if (estimatedHours) taskData.estimated_hours = parseFloat(estimatedHours);
    if (actualHours) taskData.actual_hours = parseFloat(actualHours);
    if (businessValue) taskData.business_value = businessValue;
    if (acceptanceCriteria) taskData.acceptance_criteria = acceptanceCriteria;
    if (successMetrics) taskData.success_metrics = successMetrics;
    if (stakeholderEmails.length > 0) taskData.stakeholder_emails = stakeholderEmails;
    if (tags.length > 0) taskData.tags = tags;
    if (riskDescription) taskData.risk_description = riskDescription;
    if (blockers) taskData.blockers = blockers;
    if (isRecurring && recurrencePattern) taskData.recurrence_pattern = recurrencePattern;
    // Log payload for debugging
    console.log('Submitting business task payload:', taskData);
    if (editPage) {
      updateBusinessTaskMutation({ 
        taskUuid: editData.task_uuid, 
        taskData 
      }, {
        onSuccess: handleUpdateSuccess
      });
    } else {
      createBusinessTaskMutation(taskData, {
        onSuccess: handleCreateSuccess
      });
    }
  };

  const handleBlur = (e, validation, input) => {
    const validateObj = validators(validation, input);
    const prevState = { ...formError };
    if (validateObj && validateObj.error) {
      setFormError({
        ...prevState,
        [e.target.id]: validateObj,
      });
    } else {
      setFormError({
        ...prevState,
        [e.target.id]: {
          error: false,
          message: '',
        },
      });
    }
  };

  const submitDisabled = () => {
    return (
      !title.value ||
      !description ||
      (!selectedCategory && !selectedCustomCategory) ||
      !assignedToUser ||
      isCreatingTask ||
      isUpdatingTask
    );
  };

  return (
    <>
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={closeFormModal}
          title={formTitle}
          titleClass={classes.formTitle}
          maxWidth="lg"
          wantConfirm
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={() => history.push(redirectTo)}
        >
          {(isCreatingTask || isUpdatingTask || isCategoriesLoading || isReleasesLoading || isMembersLoading) && (
            <Loader open={isCreatingTask || isUpdatingTask || isCategoriesLoading || isReleasesLoading || isMembersLoading} />
          )}
          
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <Grid container spacing={isDesktop ? 2 : 0}>
              
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                  📋 Basic Information
                </Typography>
              </Grid>

              {/* Title */}
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="title"
                    label="Task Title"
                    name="title"
                    autoComplete="title"
                    error={formError.title && formError.title.error}
                    helperText={formError.title ? formError.title.message : ''}
                    onBlur={(e) => handleBlur(e, 'required', title)}
                    {...title.bind}
                  />
                  <AIFormHelper
                    fieldType="business-task-title"
                    onSuggestion={(suggestion) => title.setValue(suggestion)}
                    size="small"
                  />
                </Box>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <Box display="flex" alignItems="flex-start">
                  <SmartInput
                    onEditorValueChange={setDescription}
                    value={description}
                    inputLabel="Task Description"
                    required
                  />
                  <AIFormHelper
                    fieldType="business-task-description"
                    onSuggestion={(suggestion) => setDescription(suggestion)}
                    size="small"
                    context={{ taskTitle: title.value }}
                  />
                </Box>
              </Grid>

              {/* Category Selection */}
              <Grid item xs={12} md={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  select
                  id="category"
                  label="Standard Category"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    if (e.target.value) setSelectedCustomCategory(null);
                  }}
                  helperText="Select a standard category or use custom category below"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {STANDARD_TASK_CATEGORIES.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Custom Category */}
              <Grid item xs={12} md={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  select
                  id="customCategory"
                  label="Custom Category"
                  value={selectedCustomCategory || ''}
                  onChange={(e) => {
                    setSelectedCustomCategory(e.target.value);
                    if (e.target.value) setSelectedCategory('');
                  }}
                  helperText="Organization-specific categories"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {taskCategories && taskCategories.length > 0 && taskCategories.map((category) => (
                    <MenuItem key={category.category_uuid} value={category.category_uuid}>
                      <Chip
                        size="small"
                        label={category.name}
                        style={{ backgroundColor: category.color, color: 'white' }}
                        className={classes.categoryChip}
                      />
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Priority and Status */}
              <Grid item xs={12} md={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  select
                  id="priority"
                  label="Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  {TASK_PRIORITIES.map((priorityOption) => (
                    <MenuItem key={priorityOption.value} value={priorityOption.value}>
                      <Chip
                        size="small"
                        label={priorityOption.label}
                        style={{ backgroundColor: priorityOption.color, color: 'white' }}
                      />
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  select
                  id="status"
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {TASK_STATUSES.map((statusOption) => (
                    <MenuItem key={statusOption.value} value={statusOption.value}>
                      <Chip
                        size="small"
                        label={statusOption.label}
                        style={{ backgroundColor: statusOption.color, color: 'white' }}
                      />
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Assignment */}
              <Grid item xs={12} md={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  select
                  id="assignedUser"
                  label="Assign To"
                  value={assignedToUser || ''}
                  onChange={(e) => setAssignedToUser(e.target.value)}
                  error={!assignedToUser}
                  helperText={!assignedToUser ? 'Please select a user to assign this task' : ''}
                >
                  <MenuItem value="">
                    <em>Select User</em>
                  </MenuItem>
                  {organizationMembers.map((member) => (
                    <MenuItem key={member.core_user_uuid || member.id} value={member.core_user_uuid || member.id}>
                      👤 {member.first_name && member.last_name 
                        ? `${member.first_name} ${member.last_name}` 
                        : member.username || member.email
                      }
                      {member.email && member.first_name && (
                        <span style={{ color: '#666', fontSize: '0.9em', marginLeft: '8px' }}>
                          ({member.email})
                        </span>
                      )}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Due Date */}
              <Grid item xs={12} md={6}>
                <DatePickerComponent
                  label="Due Date"
                  selectedDate={dueDate}
                  hasTime
                  handleDateChange={setDueDate}
                />
              </Grid>

              {/* Release Assignment */}
              <Grid item xs={12} md={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  select
                  id="selectedRelease"
                  label="Assign to Release"
                  value={selectedRelease || ''}
                  onChange={(e) => setSelectedRelease(e.target.value)}
                  helperText="Select a release to assign this task to"
                >
                  <MenuItem value="">
                    <em>No Release Selected</em>
                  </MenuItem>
                  {releases && releases.length > 0 && releases.map((release) => (
                    <MenuItem key={release.release_uuid} value={release.release_uuid}>
                      📦 {release.name || release.tag_name} 
                      {release.release_date && (
                        <span style={{ color: '#666', fontSize: '0.9em', marginLeft: '8px' }}>
                          ({new Date(release.release_date).toLocaleDateString()})
                        </span>
                      )}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Release Version */}
              {selectedRelease && (
                <Grid item xs={12} md={6}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    id="releaseVersion"
                    label="Release Version"
                    value={releaseVersion}
                    onChange={(e) => setReleaseVersion(e.target.value)}
                    placeholder="e.g., v1.2.0"
                    helperText="Optional: Specify version number for this release"
                  />
                </Grid>
              )}

              {/* Progress Section */}
              {editPage && (
                <Grid item xs={12}>
                  <Box className={classes.progressSection}>
                    <Typography variant="h6" gutterBottom>
                      📈 Progress Tracking
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography gutterBottom>Progress: {progressPercentage}%</Typography>
                        <Slider
                          value={progressPercentage}
                          onChange={(e, newValue) => setProgressPercentage(newValue)}
                          aria-labelledby="progress-slider"
                          valueLabelDisplay="auto"
                          step={5}
                          marks
                          min={0}
                          max={100}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          variant="outlined"
                          margin="normal"
                          fullWidth
                          type="number"
                          inputProps={{ step: 0.5, min: 0 }}
                          id="actualHours"
                          label="Actual Hours"
                          value={actualHours}
                          onChange={(e) => setActualHours(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              )}

              {/* Submit Buttons */}
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
                  disabled={submitDisabled()}
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

export default AddBusinessTask;
