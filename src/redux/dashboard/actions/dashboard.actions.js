// Dashboard action types
export const ADD_REQUIREMENT = 'DASHBOARD/ADD_REQUIREMENT';
export const EDIT_REQUIREMENT = 'DASHBOARD/EDIT_REQUIREMENT';
export const DELETE_REQUIREMENT = 'DASHBOARD/DELETE_REQUIREMENT';

export const ADD_ISSUE = 'DASHBOARD/ADD_ISSUE';
export const EDIT_ISSUE = 'DASHBOARD/EDIT_ISSUE';
export const DELETE_ISSUE = 'DASHBOARD/DELETE_ISSUE';

/**
 * Add new requirement
 * @param {Object} data
 */
export const addRequirement = (data) => ({
  type: ADD_REQUIREMENT,
  data,
});

/**
 * Edit requirement
 * @param {Object} data
 */
export const editRequirement = (data) => ({
  type: EDIT_REQUIREMENT,
  data,
});

/**
 * Delete requirement
 * @param {Number} id
 */
export const deleteRequirement = (id) => ({
  type: DELETE_REQUIREMENT,
  id,
});

/**
 * Add new issue
 * @param {Object} data
 */
export const addIssue = (data) => ({
  type: ADD_ISSUE,
  data,
});

/**
 * Edit issue
 * @param {Object} data
 */
export const editIssue = (data) => ({
  type: EDIT_ISSUE,
  data,
});

/**
 * Delete issue
 * @param {Number} id
 */
export const deleteIssue = (id) => ({
  type: DELETE_ISSUE,
  id,
});
