import React, { useState, useContext, useEffect } from 'react';
import _ from 'lodash';
import moment from 'moment-timezone';
import { useQuery } from 'react-query';
import makeStyles from '@mui/styles/makeStyles';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  LinearProgress,
  Tooltip,
  Avatar,
  Fab,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clone as CloneIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { UserContext } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { getAllBusinessTasksQuery } from '@react-query/queries/businessTasks/getAllBusinessTasksQuery';
import { useDeleteBusinessTaskMutation } from '@react-query/mutations/businessTasks/businessTaskMutations';
import { 
  getStatusColor, 
  getPriorityColor, 
  getCategoryIcon,
  STANDARD_TASK_CATEGORIES 
} from '@utils/businessTaskConstants';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
  },
  taskCard: {
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(1),
    '&:hover': {
      boxShadow: theme.shadows[4],
    },
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(1),
  },
  taskTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
  },
  taskMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
    flexWrap: 'wrap',
  },
  overdueIndicator: {
    color: theme.palette.error.main,
    fontWeight: 'bold',
  },
  progressSection: {
    marginTop: theme.spacing(1),
  },
  assigneeAvatar: {
    width: 24,
    height: 24,
    fontSize: '0.75rem',
  },
  fab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  filterChip: {
    margin: theme.spacing(0.5),
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
}));

const BusinessTasksList = ({ 
  productUuid, 
  releaseUuid, 
  userUuid, 
  title = 'Business Tasks',
  showAddButton = true,
  onAddTask,
  onEditTask,
  filters = {}
}) => {
  const classes = useStyles();
  const { displayAlert } = useAlert();
  const user = useContext(UserContext);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskFilters, setTaskFilters] = useState({ product_uuid: productUuid, ...filters });

  // Update filters when props change
  useEffect(() => {
    const newFilters = { product_uuid: productUuid, ...filters };
    if (releaseUuid) newFilters.release_uuid = releaseUuid;
    if (userUuid) newFilters.assigned_to_user_uuid = userUuid;
    setTaskFilters(newFilters);
  }, [productUuid, releaseUuid, userUuid, filters]);

  // Fetch business tasks
  const { data: tasks = [], isLoading, refetch } = useQuery(
    ['businessTasks', taskFilters],
    () => getAllBusinessTasksQuery(taskFilters, displayAlert),
    { 
      refetchOnWindowFocus: false,
      enabled: !!productUuid 
    }
  );

  // Delete mutation
  const { mutate: deleteTask } = useDeleteBusinessTaskMutation(displayAlert);

  const handleMenuClick = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleEditTask = () => {
    if (onEditTask && selectedTask) {
      onEditTask(selectedTask);
    }
    handleMenuClose();
  };

  const handleDeleteTask = () => {
    if (selectedTask) {
      deleteTask(selectedTask.task_uuid);
    }
    handleMenuClose();
  };

  const getCategoryDisplay = (task) => {
    if (task.custom_category_name) {
      return {
        label: task.custom_category_name,
        icon: '🏷️'
      };
    }
    
    const standardCategory = STANDARD_TASK_CATEGORIES.find(c => c.value === task.category);
    return standardCategory || { label: 'Other', icon: '📦' };
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const days = moment(dueDate).diff(moment(), 'days');
    return days;
  };

  const isOverdue = (task) => {
    return task.is_overdue || (task.due_date && moment(task.due_date).isBefore(moment()));
  };

  if (isLoading) {
    return (
      <Box className={classes.container}>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <Typography variant="h6" gutterBottom>
        {title} ({tasks.length})
      </Typography>

      {tasks.length === 0 ? (
        <Box className={classes.emptyState}>
          <AssignmentIcon style={{ fontSize: 64, color: '#ccc' }} />
          <Typography variant="h6" gutterBottom>
            No business tasks found
          </Typography>
          <Typography variant="body2">
            {showAddButton ? 'Create your first business task to get started.' : 'No tasks match the current filters.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {tasks.map((task) => {
            const category = getCategoryDisplay(task);
            const daysUntilDue = getDaysUntilDue(task.due_date);
            const taskIsOverdue = isOverdue(task);

            return (
              <Grid item xs={12} md={6} lg={4} key={task.task_uuid}>
                <Card className={classes.taskCard}>
                  <CardContent>
                    <Box className={classes.taskHeader}>
                      <Box flex={1}>
                        <Typography variant="h6" className={classes.taskTitle}>
                          {category.icon} {task.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {task.description}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, task)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    <Box className={classes.taskMeta}>
                      <Chip
                        size="small"
                        label={task.priority}
                        style={{ 
                          backgroundColor: getPriorityColor(task.priority),
                          color: 'white',
                          textTransform: 'capitalize'
                        }}
                      />
                      <Chip
                        size="small"
                        label={task.status?.replace('_', ' ')}
                        style={{ 
                          backgroundColor: getStatusColor(task.status),
                          color: 'white',
                          textTransform: 'capitalize'
                        }}
                      />
                      <Chip
                        size="small"
                        label={category.label}
                        variant="outlined"
                        className={classes.filterChip}
                      />
                    </Box>

                    {/* Progress */}
                    {task.progress_percentage > 0 && (
                      <Box className={classes.progressSection}>
                        <Typography variant="caption" color="text.secondary">
                          Progress: {task.progress_percentage}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={task.progress_percentage}
                          style={{ marginTop: 4 }}
                        />
                      </Box>
                    )}

                    {/* Due Date */}
                    {task.due_date && (
                      <Box display="flex" alignItems="center" mt={1}>
                        <ScheduleIcon fontSize="small" color="action" />
                        <Typography 
                          variant="caption" 
                          color={taskIsOverdue ? 'error' : 'text.secondary'}
                          className={taskIsOverdue ? classes.overdueIndicator : ''}
                          sx={{ ml: 0.5 }}
                        >
                          {taskIsOverdue ? 'Overdue' : daysUntilDue === 0 ? 'Due today' : 
                           daysUntilDue === 1 ? 'Due tomorrow' : 
                           daysUntilDue > 0 ? `Due in ${daysUntilDue} days` : 
                           `${Math.abs(daysUntilDue)} days overdue`}
                        </Typography>
                        {taskIsOverdue && (
                          <Tooltip title="This task is overdue">
                            <WarningIcon color="error" fontSize="small" sx={{ ml: 0.5 }} />
                          </Tooltip>
                        )}
                      </Box>
                    )}

                    {/* Assignee */}
                    <Box display="flex" alignItems="center" mt={1}>
                      <Avatar className={classes.assigneeAvatar}>
                        {task.assigned_to_username ? task.assigned_to_username.charAt(0).toUpperCase() : '?'}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        Assigned to {task.assigned_to_username || 'Unknown User'}
                      </Typography>
                    </Box>

                    {/* Release Info */}
                    {task.release_version && (
                      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                        🚀 Release: {task.release_version}
                      </Typography>
                    )}

                    {/* Feature Name */}
                    {task.feature_name && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        🎯 Feature: {task.feature_name}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditTask}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Task
        </MenuItem>
        <MenuItem onClick={handleDeleteTask}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Task
        </MenuItem>
      </Menu>

      {/* Add Task FAB */}
      {showAddButton && onAddTask && (
        <Fab
          color="primary"
          aria-label="add task"
          className={classes.fab}
          onClick={onAddTask}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
};

export default BusinessTasksList;
