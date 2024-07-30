// Release Action types
export const GET_RELEASE = 'RELEASE/GET_RELEASE';
export const GET_RELEASE_SUCCESS = 'RELEASE/GET_RELEASE_SUCCESS';
export const GET_RELEASE_FAILURE = 'RELEASE/GET_RELEASE_FAILURE';

export const CREATE_RELEASE = 'RELEASE/CREATE_RELEASE';
export const CREATE_RELEASE_SUCCESS = 'RELEASE/CREATE_RELEASE_SUCCESS';
export const CREATE_RELEASE_FAILURE = 'RELEASE/CREATE_RELEASE_FAILURE';

export const UPDATE_RELEASE = 'RELEASE/UPDATE_RELEASE';
export const UPDATE_RELEASE_SUCCESS = 'RELEASE/UPDATE_RELEASE_SUCCESS';
export const UPDATE_RELEASE_FAILURE = 'RELEASE/UPDATE_RELEASE_FAILURE';

export const DELETE_RELEASE = 'RELEASE/DELETE_RELEASE';
export const DELETE_RELEASE_SUCCESS = 'RELEASE/DELETE_RELEASE_SUCCESS';
export const DELETE_RELEASE_FAILURE = 'RELEASE/DELETE_RELEASE_FAILURE';

export const GET_COMMENT = 'RELEASE/GET_COMMENT';
export const GET_COMMENT_SUCCESS = 'RELEASE/GET_COMMENT_SUCCESS';
export const GET_COMMENT_FAILURE = 'RELEASE/GET_COMMENT_FAILURE';

export const UPDATE_COMMENT = 'RELEASE/UPDATE_COMMENT';
export const UPDATE_COMMENT_SUCCESS = 'RELEASE/UPDATE_COMMENT_SUCCESS';
export const UPDATE_COMMENT_FAILURE = 'RELEASE/UPDATE_COMMENT_FAILURE';

export const DELETE_COMMENT = 'RELEASE/DELETE_COMMENT';
export const DELETE_COMMENT_SUCCESS = 'RELEASE/DELETE_COMMENT_SUCCESS';
export const DELETE_COMMENT_FAILURE = 'RELEASE/DELETE_COMMENT_FAILURE';

export const GET_FEATURE = 'RELEASE/GET_FEATURE';
export const GET_FEATURE_SUCCESS = 'RELEASE/GET_FEATURE_SUCCESS';
export const GET_FEATURE_FAILURE = 'RELEASE/GET_FEATURE_FAILURE';

export const ALL_FEEDBACKS = 'RELEASE/ALL_FEEDBACKS';
export const ALL_FEEDBACKS_SUCCESS = 'RELEASE/ALL_FEEDBACKS_SUCCESS';
export const ALL_FEEDBACKS_FAILURE = 'RELEASE/ALL_FEEDBACKS_FAILURE';

export const GET_FEEDBACK = 'RELEASE/GET_FEEDBACK';
export const GET_FEEDBACK_SUCCESS = 'RELEASE/GET_FEEDBACK_SUCCESS';
export const GET_FEEDBACK_FAILURE = 'RELEASE/GET_FEEDBACK_FAILURE';

export const CREATE_FEEDBACK = 'RELEASE/CREATE_FEEDBACK';
export const CREATE_FEEDBACK_SUCCESS = 'RELEASE/CREATE_FEEDBACK_SUCCESS';
export const CREATE_FEEDBACK_FAILURE = 'RELEASE/CREATE_FEEDBACK_FAILURE';

export const UPDATE_FEEDBACK = 'RELEASE/UPDATE_FEEDBACK';
export const UPDATE_FEEDBACK_SUCCESS = 'RELEASE/UPDATE_FEEDBACK_SUCCESS';
export const UPDATE_FEEDBACK_FAILURE = 'RELEASE/UPDATE_FEEDBACK_FAILURE';

export const DELETE_FEEDBACK = 'RELEASE/DELETE_FEEDBACK';
export const DELETE_FEEDBACK_SUCCESS = 'RELEASE/DELETE_FEEDBACK_SUCCESS';
export const DELETE_FEEDBACK_FAILURE = 'RELEASE/DELETE_FEEDBACK_FAILURE';

export const GET_ISSUE = 'RELEASE/GET_ISSUE';
export const GET_ISSUE_SUCCESS = 'RELEASE/GET_ISSUE_SUCCESS';
export const GET_ISSUE_FAILURE = 'RELEASE/GET_ISSUE_FAILURE';

export const GET_STATUS = 'RELEASE/GET_STATUS';
export const GET_STATUS_SUCCESS = 'RELEASE/GET_STATUS_SUCCESS';
export const GET_STATUS_FAILURE = 'RELEASE/GET_STATUS_FAILURE';

export const UPDATE_STATUS = 'RELEASE/UPDATE_STATUS';
export const UPDATE_STATUS_SUCCESS = 'RELEASE/UPDATE_STATUS_SUCCESS';
export const UPDATE_STATUS_FAILURE = 'RELEASE/UPDATE_STATUS_FAILURE';

export const DELETE_STATUS = 'RELEASE/DELETE_STATUS';
export const DELETE_STATUS_SUCCESS = 'RELEASE/DELETE_STATUS_SUCCESS';
export const DELETE_STATUS_FAILURE = 'RELEASE/DELETE_STATUS_FAILURE';

/**
 * Get a Release
 * @param {uuid} release_uuid
 */
export const getRelease = (release_uuid) => ({
  type: GET_RELEASE,
  release_uuid,
});

/**
 * Create a Release
 * @param {Object} data
 */
export const createRelease = (data) => ({
  type: CREATE_RELEASE,
  data,
});

/**
 * Update a Release
 * @param {Object} data
 */
export const updateRelease = (data) => ({
  type: UPDATE_RELEASE,
  data,
});

/**
 * Delete a Release
 * @param {uuid} release_uuid
 */
export const deleteRelease = (release_uuid) => ({
  type: DELETE_RELEASE,
  release_uuid,
});

/**
 * Get a Comment
 * @param {uuid} comment_uuid
 */
export const getComment = (comment_uuid) => ({
  type: GET_COMMENT,
  comment_uuid,
});

/**
 * Update a Comment
 * @param {Object} data
 */
export const updateComment = (data) => ({
  type: UPDATE_COMMENT,
  data,
});

/**
 * Delete a Comment
 * @param {uuid} comment_uuid
 */
export const deleteComment = (comment_uuid) => ({
  type: DELETE_COMMENT,
  comment_uuid,
});

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
 * Create a Feedback
 * @param {Object} data
 */
export const createFeedback = (data) => ({
  type: CREATE_FEEDBACK,
  data,
});

/**
 * Update a Feedback
 * @param {Object} data
 */
export const updateFeedback = (data) => ({
  type: UPDATE_FEEDBACK,
  data,
});

/**
 * Delete a Feedback
 * @param {uuid} feedback_uuid
 */
export const deleteFeedback = (feedback_uuid) => ({
  type: DELETE_FEEDBACK,
  feedback_uuid,
});

/**
 * Get an Issue
 * @param {uuid} issue_uuid
 */
export const getIssue = (issue_uuid) => ({
  type: GET_ISSUE,
  issue_uuid,
});

/**
 * Get a Status
 * @param {uuid} product_uuid
 */
export const getStatus = (product_uuid) => ({
  type: GET_STATUS,
  product_uuid,
});

/**
 * Update a Status
 * @param {Object} data
 */
export const updateStatus = (data) => ({
  type: UPDATE_STATUS,
  data,
});

/**
 * Delete a Status
 * @param {uuid} status_uuid
 */
export const deleteStatus = (status_uuid) => ({
  type: DELETE_STATUS,
  status_uuid,
});
