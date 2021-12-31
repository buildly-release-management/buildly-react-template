// Decision Action types
export const ALL_DECISIONS = 'PROJECT_TOOL/ALL_DECISIONS';
export const ALL_DECISIONS_SUCCESS = 'PROJECT_TOOL/ALL_DECISIONS_SUCCESS';
export const ALL_DECISIONS_FAILURE = 'PROJECT_TOOL/ALL_DECISIONS_FAILURE';

export const GET_DECISION = 'PROJECT_TOOL/GET_DECISION';
export const GET_DECISION_SUCCESS = 'PROJECT_TOOL/GET_DECISION_SUCCESS';
export const GET_DECISION_FAILURE = 'PROJECT_TOOL/GET_DECISION_FAILURE';

export const ALL_FEATURES = 'PROJECT_TOOL/ALL_FEATURES';
export const ALL_FEATURES_SUCCESS = 'PROJECT_TOOL/ALL_FEATURES_SUCCESS';
export const ALL_FEATURES_FAILURE = 'PROJECT_TOOL/ALL_FEATURES_FAILURE';

export const GET_FEATURE = 'PROJECT_TOOL/GET_FEATURE';
export const GET_FEATURE_SUCCESS = 'PROJECT_TOOL/GET_FEATURE_SUCCESS';
export const GET_FEATURE_FAILURE = 'PROJECT_TOOL/GET_FEATURE_FAILURE';

export const ALL_FEEDBACKS = 'PROJECT_TOOL/ALL_FEEDBACKS';
export const ALL_FEEDBACKS_SUCCESS = 'PROJECT_TOOL/ALL_FEEDBACKS_SUCCESS';
export const ALL_FEEDBACKS_FAILURE = 'PROJECT_TOOL/ALL_FEEDBACKS_FAILURE';

export const GET_FEEDBACK = 'PROJECT_TOOL/GET_FEEDBACK';
export const GET_FEEDBACK_SUCCESS = 'PROJECT_TOOL/GET_FEEDBACK_SUCCESS';
export const GET_FEEDBACK_FAILURE = 'PROJECT_TOOL/GET_FEEDBACK_FAILURE';

export const ALL_ISSUES = 'PROJECT_TOOL/ALL_ISSUES';
export const ALL_ISSUES_SUCCESS = 'PROJECT_TOOL/ALL_ISSUES_SUCCESS';
export const ALL_ISSUES_FAILURE = 'PROJECT_TOOL/ALL_ISSUES_FAILURE';

export const GET_ISSUE = 'PROJECT_TOOL/GET_ISSUE';
export const GET_ISSUE_SUCCESS = 'PROJECT_TOOL/GET_ISSUE_SUCCESS';
export const GET_ISSUE_FAILURE = 'PROJECT_TOOL/GET_ISSUE_FAILURE';

export const ALL_KANBAN_STATUSES = 'PROJECT_TOOL/ALL_KANBAN_STATUSES';
export const ALL_KANBAN_STATUSES_SUCCESS = 'PROJECT_TOOL/ALL_KANBAN_STATUSES_SUCCESS';
export const ALL_KANBAN_STATUSES_FAILURE = 'PROJECT_TOOL/ALL_KANBAN_STATUSES_FAILURE';

export const GET_KANBAN_STATUS = 'PROJECT_TOOL/GET_KANBAN_STATUS';
export const GET_KANBAN_STATUS_SUCCESS = 'PROJECT_TOOL/GET_KANBAN_STATUS_SUCCESS';
export const GET_KANBAN_STATUS_FAILURE = 'PROJECT_TOOL/GET_KANBAN_STATUS_FAILURE';

/**
 * Get all Decisions
 */
export const getAllDecisions = () => ({ type: ALL_DECISIONS });

/**
 * Get a Decision
 * @param {uuid} decision_uuid
 */
export const getDecision = (decision_uuid) => ({
  type: GET_DECISION,
  decision_uuid,
});

/**
 * Get all Features
 */
export const getAllFeatures = () => ({ type: ALL_FEATURES });

/**
 * Get a Feature
 * @param {uuid} feature_uuid
 */
export const getFeature = (feature_uuid) => ({
  type: GET_FEATURE,
  feature_uuid,
});

/**
 * Get all Feedbacks
 */
export const getAllFeedbacks = () => ({ type: ALL_FEEDBACKS });

/**
 * Get a Feedback
 * @param {uuid} feedback_uuid
 */
export const getFeedback = (feedback_uuid) => ({
  type: GET_FEEDBACK,
  feedback_uuid,
});

/**
 * Get all Issues
 */
export const getAllIssues = () => ({ type: ALL_ISSUES });

/**
 * Get an Issue
 * @param {uuid} issue_uuid
 */
export const getIssue = (issue_uuid) => ({
  type: GET_ISSUE,
  issue_uuid,
});

/**
 * Get all Kanban Statuses
 */
export const getAllKanbanStatuses = () => ({ type: ALL_KANBAN_STATUSES });

/**
 * Get a Kanban Status
 * @param {uuid} kanban_status_uuid
 */
export const getKanbanStatus = (kanban_status_uuid) => ({
  type: GET_KANBAN_STATUS,
  kanban_status_uuid,
});
