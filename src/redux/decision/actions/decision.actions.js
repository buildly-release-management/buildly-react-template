// Decision Action types
export const ALL_DECISIONS = 'DECISION/ALL_DECISIONS';
export const ALL_DECISIONS_SUCCESS = 'DECISION/ALL_DECISIONS_SUCCESS';
export const ALL_DECISIONS_FAILURE = 'DECISION/ALL_DECISIONS_FAILURE';

export const GET_DECISION = 'DECISION/GET_DECISION';
export const GET_DECISION_SUCCESS = 'DECISION/GET_DECISION_SUCCESS';
export const GET_DECISION_FAILURE = 'DECISION/GET_DECISION_FAILURE';

export const ALL_FEATURES = 'DECISION/ALL_FEATURES';
export const ALL_FEATURES_SUCCESS = 'DECISION/ALL_FEATURES_SUCCESS';
export const ALL_FEATURES_FAILURE = 'DECISION/ALL_FEATURES_FAILURE';

export const GET_FEATURE = 'DECISION/GET_FEATURE';
export const GET_FEATURE_SUCCESS = 'DECISION/GET_FEATURE_SUCCESS';
export const GET_FEATURE_FAILURE = 'DECISION/GET_FEATURE_FAILURE';

export const ALL_FEEDBACKS = 'DECISION/ALL_FEEDBACKS';
export const ALL_FEEDBACKS_SUCCESS = 'DECISION/ALL_FEEDBACKS_SUCCESS';
export const ALL_FEEDBACKS_FAILURE = 'DECISION/ALL_FEEDBACKS_FAILURE';

export const GET_FEEDBACK = 'DECISION/GET_FEEDBACK';
export const GET_FEEDBACK_SUCCESS = 'DECISION/GET_FEEDBACK_SUCCESS';
export const GET_FEEDBACK_FAILURE = 'DECISION/GET_FEEDBACK_FAILURE';

export const ALL_ISSUES = 'DECISION/ALL_ISSUES';
export const ALL_ISSUES_SUCCESS = 'DECISION/ALL_ISSUES_SUCCESS';
export const ALL_ISSUES_FAILURE = 'DECISION/ALL_ISSUES_FAILURE';

export const GET_ISSUE = 'DECISION/GET_ISSUE';
export const GET_ISSUE_SUCCESS = 'DECISION/GET_ISSUE_SUCCESS';
export const GET_ISSUE_FAILURE = 'DECISION/GET_ISSUE_FAILURE';

export const ALL_STATUSES = 'DECISION/ALL_STATUSES';
export const ALL_STATUSES_SUCCESS = 'DECISION/ALL_STATUSES_SUCCESS';
export const ALL_STATUSES_FAILURE = 'DECISION/ALL_STATUSES_FAILURE';

export const GET_STATUS = 'DECISION/GET_STATUS';
export const GET_STATUS_SUCCESS = 'DECISION/GET_STATUS_SUCCESS';
export const GET_STATUS_FAILURE = 'DECISION/GET_STATUS_FAILURE';

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
 * Get all Statuses
 */
export const getAllStatuses = () => ({ type: ALL_STATUSES });

/**
 * Get a Status
 * @param {uuid} status_uuid
 */
export const getStatus = (status_uuid) => ({
  type: GET_STATUS,
  status_uuid,
});
