export const GET_ISSUES = 'RELEASE/GET_ISSUES';
export const GET_ISSUES_SUCCESS = 'RELEASE/GET_ISSUES_SUCCESS';
export const GET_ISSUES_FAILURE = 'RELEASE/GET_ISSUES_FAILURE';

export const ADD_ISSUE = 'RELEASE/ADD_ISSUE';
export const ADD_ISSUE_SUCCESS = 'RELEASE/ADD_ISSUE_SUCCESS';
export const ADD_ISSUE_FAILURE = 'RELEASE/ADD_ISSUE_FAILURE';

export const UPDATE_ISSUE = 'RELEASE/UPDATE_ISSUE';
export const UPDATE_ISSUE_SUCCESS = 'RELEASE/UPDATE_ISSUE_SUCCESS';
export const UPDATE_ISSUE_FAILURE = 'RELEASE/UPDATE_ISSUE_FAILURE';

export const DELETE_ISSUE = 'RELEASE/DELETE_ISSUE';
export const DELETE_ISSUE_SUCCESS = 'RELEASE/DELETE_ISSUE_SUCCESS';
export const DELETE_ISSUE_FAILURE = 'RELEASE/DELETE_ISSUE_FAILURE';

/**
 * Get Issues
 * @param {String} project_uuid
 */
export const getIssues = (project_uuid) => ({ type: GET_ISSUES, project_uuid });

/**
   * Add Issue
   * @param {Object} payload
   * @param {Object} history
   * @param {String} redirectTo
   */
export const addIssue = (payload, history, redirectTo) => ({
  type: ADD_ISSUE,
  payload,
  history,
  redirectTo,
});

/**
     * Update Issue
     * @param {Object} payload
     * @param {Object} history
     * @param {String} redirectTo
     */
export const updateIssue = (payload, history, redirectTo) => ({
  type: UPDATE_ISSUE,
  payload,
  history,
  redirectTo,
});

/**
     * Delete Issue
     * @param {Number} issue_uuid

     */
export const deleteIssue = (
  issue_uuid,
) => ({
  type: DELETE_ISSUE,
  issue_uuid,
});
