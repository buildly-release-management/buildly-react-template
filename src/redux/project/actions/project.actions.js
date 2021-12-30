// Project Action types
export const SAVE_PRODUCT_FORM_DATA = 'PROJECT_TOOL/SAVE_PRODUCT_FORM_DATA';

export const ALL_RELEASES = 'PROJECT_TOOL/ALL_RELEASES';
export const ALL_RELEASES_SUCCESS = 'PROJECT_TOOL/ALL_RELEASES_SUCCESS';
export const ALL_RELEASES_FAILURE = 'PROJECT_TOOL/ALL_RELEASES_FAILURE';

export const GET_RELEASE = 'PROJECT_TOOL/GET_RELEASE';
export const GET_RELEASE_SUCCESS = 'PROJECT_TOOL/GET_RELEASE_SUCCESS';
export const GET_RELEASE_FAILURE = 'PROJECT_TOOL/GET_RELEASE_FAILURE';

export const ADD_RELEASE = 'PROJECT_TOOL/ADD_RELEASE';
export const ADD_RELEASE_SUCCESS = 'PROJECT_TOOL/ADD_RELEASE_SUCCESS';
export const ADD_RELEASE_FAILURE = 'PROJECT_TOOL/ADD_RELEASE_FAILURE';

export const UPDATE_RELEASE = 'PROJECT_TOOL/UPDATE_RELEASE';
export const UPDATE_RELEASE_SUCCESS = 'PROJECT_TOOL/UPDATE_RELEASE_SUCCESS';
export const UPDATE_RELEASE_FAILURE = 'PROJECT_TOOL/UPDATE_RELEASE_FAILURE';

export const DELETE_RELEASE = 'PROJECT_TOOL/DELETE_RELEASE';
export const DELETE_RELEASE_SUCCESS = 'PROJECT_TOOL/DELETE_RELEASE_SUCCESS';
export const DELETE_RELEASE_FAILURE = 'PROJECT_TOOL/DELETE_RELEASE_FAILURE';

/**
 * Save PRODUCT Form Data
 * @param {Object} formData
 */
export const saveProductFormData = (formData) => ({
  type: SAVE_PRODUCT_FORM_DATA,
  formData,
});

/**
 * Get all Releases
 */
export const getAllReleases = () => ({ type: ALL_RELEASES });

/**
 * Get a Release
 * @param {uuid} release_uuid
 */
export const getRelease = (release_uuid) => ({
  type: GET_RELEASE,
  release_uuid,
});

/**
 * Add Release
 * @param {Object} payload
 * @param {Object} history
 * @param {String} redirectTo
 */
export const addRelease = (payload, history, redirectTo) => ({
  type: ADD_RELEASE,
  payload,
  history,
  redirectTo,
});

/**
 * Update Release
 * @param {Object} payload
 * @param {Object} history
 * @param {String} redirectTo
 */
export const updateRelease = (payload, history, redirectTo) => ({
  type: UPDATE_RELEASE,
  payload,
  history,
  redirectTo,
});

/**
 * Delete Release
 * @param {uuid} release_uuid
 */
export const deleteRelease = (release_uuid) => ({
  type: DELETE_RELEASE,
  release_uuid,
});
