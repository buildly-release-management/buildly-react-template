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
import { devLog } from '@utils/devLogger';
import { useInput } from '@hooks/useInput';
import useOrganizationMembers from '@hooks/useOrganizationMembers';
import { validators } from '@utils/validators';
import { UserContext } from '@context/User.context';
import SmartInput from '@components/SmartInput/SmartInput';
import { getCurrentUserUuid } from '@utils/userUuid';
import { getAllTaskCategoriesQuery, useGetAllTaskCategories } from '@react-query/queries/businessTasks/getAllTaskCategoriesQuery';
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
  const [priority, setPriority] = useState((editData && editData.priority) || 'medium');
  const [status, setStatus] = useState((editData && editData.status) || 'not_started');
  const [assignedToUser, setAssignedToUser] = useState(() => {
    // For edit mode, use existing assignment
    if (editData && editData.assigned_to_user_uuid) {
      return editData.assigned_to_user_uuid;
    }
    // For new tasks, we'll set this in useEffect when data is available
    return null;
  });
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
  const [categoryError, setCategoryError] = useState('');

  // React queries
  const { data: taskCategoriesResponse, isLoading: isCategoriesLoading } = useGetAllTaskCategories(organizationUuid, displayAlert);

  // Ensure taskCategories is always an array with fallback to standard categories
  const taskCategories = Array.isArray(taskCategoriesResponse) 
    ? taskCategoriesResponse 
    : taskCategoriesResponse?.results || STANDARD_TASK_CATEGORIES;

  const { data: releases, isLoading: isReleasesLoading } = useQuery(
    ['allReleases', product_uuid],
    () => getAllReleaseQuery(product_uuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !!product_uuid }
  );

  // Fetch organization members for user assignment
  const { data: organizationMembers = [], isLoading: isMembersLoading } = useOrganizationMembers();

  // Effect to set default assignedToUser when data is available
  useEffect(() => {
    // Only set if not in edit mode and no user is currently assigned
    if (!editPage && !assignedToUser && user && organizationMembers.length > 0) {
      const userUuidResult = getCurrentUserUuid(user);
      if (userUuidResult.isValid) {
        // Check if the current user is in the organization members list
        const currentUserInMembers = organizationMembers.find(member => 
          (member.core_user_uuid === userUuidResult.uuid) || 
          (member.id === userUuidResult.uuid)
        );
        if (currentUserInMembers) {
          setAssignedToUser(userUuidResult.uuid);
          devLog.log('Auto-assigned task to current user:', userUuidResult.uuid);
        } else {
          devLog.log('Current user not found in organization members, leaving assignment blank');
        }
      }
    }
  }, [user, organizationMembers, editPage, assignedToUser]);

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
    
    // Debug logging to help identify the issue
    devLog.log('Form validation debug:', {
      title: { value: title.value, trimmed: title.value.trim(), isEmpty: !title.value.trim() },
      description: { value: description, trimmed: description.trim(), isEmpty: !description.trim() },
      product_uuid: { value: product_uuid, exists: !!product_uuid },
      assignedToUser: { value: assignedToUser, exists: !!assignedToUser },
      user: { context: user, hasUuid: !!getCurrentUserUuid(user).uuid }
    });
    
    // Required field validation - only validate fields that are actually required by the API
    const userUuidResult = getCurrentUserUuid(user);
    if (!title.value.trim() || !description.trim() || !selectedCategory || !product_uuid || !assignedToUser) {
      // More specific error message
      const missingFields = [];
      if (!title.value.trim()) {missingFields.push('Task Title');}
      if (!description.trim()) {missingFields.push('Description');}
      if (!selectedCategory) {missingFields.push('Category');}
      if (!product_uuid) {missingFields.push('Product Selection');}
      if (!assignedToUser) {missingFields.push('User Assignment');}
      
      setCategoryError(!selectedCategory ? 'Please select a category' : '');
      displayAlert('error', `Missing required business task fields: ${missingFields.join(', ')}. Please complete all required fields.`);
      return;
    }
    // Check if user UUID is available for assigned_by_user_uuid
    if (!userUuidResult.uuid || !userUuidResult.isValid) {
      displayAlert('error', 'Unable to determine current user for task assignment.');
      return;
    }

    // Create a clean task data object with only valid, non-null values
    const taskData = {
      product_uuid: product_uuid,
      title: title.value.trim(),
      description: description.trim(),
      category: selectedCategory || 'project_management',
      priority: priority || 'medium',
      status: status || 'not_started',
      assigned_by_user_uuid: userUuidResult.uuid,
      assigned_to_user_uuid: assignedToUser,
      start_date: new Date().toISOString(),
      progress_percentage: progressPercentage ? parseInt(progressPercentage, 10) : 0,
      risk_level: riskLevel || 'low',
      is_recurring: Boolean(isRecurring),
      requires_approval: Boolean(requiresApproval),
    };

    // Only add optional fields if they have valid values - avoid sending undefined/null
    if (selectedRelease && selectedRelease.trim()) {
      taskData.release_uuid = selectedRelease.trim();
    }
    if (releaseVersion && releaseVersion.trim()) {
      taskData.release_version = releaseVersion.trim();
    }
    if (featureName && featureName.trim()) {
      taskData.feature_name = featureName.trim();
    }
    if (milestone && milestone.trim()) {
      taskData.milestone = milestone.trim();
    }
    if (dueDate) {
      taskData.due_date = dueDate.toISOString();
    }
    if (estimatedHours && !isNaN(parseFloat(estimatedHours)) && parseFloat(estimatedHours) > 0) {
      taskData.estimated_hours = parseFloat(estimatedHours);
    }
    if (actualHours && !isNaN(parseFloat(actualHours)) && parseFloat(actualHours) >= 0) {
      taskData.actual_hours = parseFloat(actualHours);
    }
    if (businessValue && businessValue.trim()) {
      taskData.business_value = businessValue.trim();
    }
    if (acceptanceCriteria && acceptanceCriteria.trim()) {
      taskData.acceptance_criteria = acceptanceCriteria.trim();
    }
    if (successMetrics && successMetrics.trim()) {
      taskData.success_metrics = successMetrics.trim();
    }
    if (stakeholderEmails && Array.isArray(stakeholderEmails) && stakeholderEmails.length > 0) {
      taskData.stakeholder_emails = stakeholderEmails.filter(email => email && email.trim());
    }
    if (tags && Array.isArray(tags) && tags.length > 0) {
      taskData.tags = tags.filter(tag => tag && tag.trim());
    }
    if (riskDescription && riskDescription.trim()) {
      taskData.risk_description = riskDescription.trim();
    }
    if (blockers && blockers.trim()) {
      taskData.blockers = blockers.trim();
    }
    if (isRecurring && recurrencePattern && recurrencePattern.trim()) {
      taskData.recurrence_pattern = recurrencePattern.trim();
    }

    // Ensure no undefined values are present
    Object.keys(taskData).forEach(key => {
      if (taskData[key] === undefined || taskData[key] === null) {
        delete taskData[key];
      }
    });

    // Log payload for debugging
    devLog.log('Submitting business task payload:', taskData);
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
      !title.value.trim() ||
      !description.trim() ||
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
                  required
                  fullWidth
                  select
                  id="category"
                  label="Category"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCategoryError('');
                  }}
                  error={!!categoryError}
                  helperText={categoryError || "Select a task category"}
                >
                  <MenuItem value="">
                    <em>Select Category</em>
                  </MenuItem>
                  {STANDARD_TASK_CATEGORIES.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.icon} {category.label}
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
