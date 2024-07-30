// Product Action types
export const GET_CREDENTIAL = 'PRODUCT/GET_CREDENTIAL';
export const GET_CREDENTIAL_SUCCESS = 'PRODUCT/GET_CREDENTIAL_SUCCESS';
export const GET_CREDENTIAL_FAILURE = 'PRODUCT/GET_CREDENTIAL_FAILURE';

export const CREATE_CREDENTIAL = 'PRODUCT/CREATE_CREDENTIAL';
export const CREATE_CREDENTIAL_SUCCESS = 'PRODUCT/CREATE_CREDENTIAL_SUCCESS';
export const CREATE_CREDENTIAL_FAILURE = 'PRODUCT/CREATE_CREDENTIAL_FAILURE';

export const UPDATE_CREDENTIAL = 'PRODUCT/UPDATE_CREDENTIAL';
export const UPDATE_CREDENTIAL_SUCCESS = 'PRODUCT/UPDATE_CREDENTIAL_SUCCESS';
export const UPDATE_CREDENTIAL_FAILURE = 'PRODUCT/UPDATE_CREDENTIAL_FAILURE';

export const DELETE_CREDENTIAL = 'PRODUCT/DELETE_CREDENTIAL';
export const DELETE_CREDENTIAL_SUCCESS = 'PRODUCT/DELETE_CREDENTIAL_SUCCESS';
export const DELETE_CREDENTIAL_FAILURE = 'PRODUCT/DELETE_CREDENTIAL_FAILURE';

export const ALL_PRODUCT_TEAMS = 'PRODUCT/ALL_PRODUCT_TEAMS';
export const ALL_PRODUCT_TEAMS_SUCCESS = 'PRODUCT/ALL_PRODUCT_TEAMS_SUCCESS';
export const ALL_PRODUCT_TEAMS_FAILURE = 'PRODUCT/ALL_PRODUCT_TEAMS_FAILURE';

export const GET_PRODUCT_TEAM = 'PRODUCT/GET_PRODUCT_TEAM';
export const GET_PRODUCT_TEAM_SUCCESS = 'PRODUCT/GET_PRODUCT_TEAM_SUCCESS';
export const GET_PRODUCT_TEAM_FAILURE = 'PRODUCT/GET_PRODUCT_TEAM_FAILURE';

export const CREATE_PRODUCT_TEAM = 'PRODUCT/CREATE_PRODUCT_TEAM';
export const CREATE_PRODUCT_TEAM_SUCCESS = 'PRODUCT/CREATE_PRODUCT_TEAM_SUCCESS';
export const CREATE_PRODUCT_TEAM_FAILURE = 'PRODUCT/CREATE_PRODUCT_TEAM_FAILURE';

export const UPDATE_PRODUCT_TEAM = 'PRODUCT/UPDATE_PRODUCT_TEAM';
export const UPDATE_PRODUCT_TEAM_SUCCESS = 'PRODUCT/UPDATE_PRODUCT_TEAM_SUCCESS';
export const UPDATE_PRODUCT_TEAM_FAILURE = 'PRODUCT/UPDATE_PRODUCT_TEAM_FAILURE';

export const DELETE_PRODUCT_TEAM = 'PRODUCT/DELETE_PRODUCT_TEAM';
export const DELETE_PRODUCT_TEAM_SUCCESS = 'PRODUCT/DELETE_PRODUCT_TEAM_SUCCESS';
export const DELETE_PRODUCT_TEAM_FAILURE = 'PRODUCT/DELETE_PRODUCT_TEAM_FAILURE';

export const GET_PRODUCT = 'PRODUCT/GET_PRODUCT';
export const GET_PRODUCT_SUCCESS = 'PRODUCT/GET_PRODUCT_SUCCESS';
export const GET_PRODUCT_FAILURE = 'PRODUCT/GET_PRODUCT_FAILURE';

export const GET_THIRD_PARTY_TOOL = 'PRODUCT/GET_THIRD_PARTY_TOOL';
export const GET_THIRD_PARTY_TOOL_SUCCESS = 'PRODUCT/GET_THIRD_PARTY_TOOL_SUCCESS';
export const GET_THIRD_PARTY_TOOL_FAILURE = 'PRODUCT/GET_THIRD_PARTY_TOOL_FAILURE';

export const CREATE_THIRD_PARTY_TOOL = 'PRODUCT/CREATE_THIRD_PARTY_TOOL';
export const CREATE_THIRD_PARTY_TOOL_SUCCESS = 'PRODUCT/CREATE_THIRD_PARTY_TOOL_SUCCESS';
export const CREATE_THIRD_PARTY_TOOL_FAILURE = 'PRODUCT/CREATE_THIRD_PARTY_TOOL_FAILURE';

export const UPDATE_THIRD_PARTY_TOOL = 'PRODUCT/UPDATE_THIRD_PARTY_TOOL';
export const UPDATE_THIRD_PARTY_TOOL_SUCCESS = 'PRODUCT/UPDATE_THIRD_PARTY_TOOL_SUCCESS';
export const UPDATE_THIRD_PARTY_TOOL_FAILURE = 'PRODUCT/UPDATE_THIRD_PARTY_TOOL_FAILURE';

export const DELETE_THIRD_PARTY_TOOL = 'PRODUCT/DELETE_THIRD_PARTY_TOOL';
export const DELETE_THIRD_PARTY_TOOL_SUCCESS = 'PRODUCT/DELETE_THIRD_PARTY_TOOL_SUCCESS';
export const DELETE_THIRD_PARTY_TOOL_FAILURE = 'PRODUCT/DELETE_THIRD_PARTY_TOOL_FAILURE';

export const GET_BOARD = 'PRODUCT/GET_BOARD';
export const GET_BOARD_SUCCESS = 'PRODUCT/GET_BOARD_SUCCESS';
export const GET_BOARD_FAILURE = 'PRODUCT/GET_BOARD_FAILURE';

export const CREATE_BOARD = 'PRODUCT/CREATE_BOARD';
export const CREATE_BOARD_SUCCESS = 'PRODUCT/CREATE_BOARD_SUCCESS';
export const CREATE_BOARD_FAILURE = 'PRODUCT/CREATE_BOARD_FAILURE';

/**
 * Get a Credential
 * @param {uuid} credential_uuid
 */
export const getCredential = (credential_uuid) => ({
  type: GET_CREDENTIAL,
  credential_uuid,
});

/**
 * Create a Credential
 * @param {Object} data
 */
export const createCredential = (data) => ({
  type: CREATE_CREDENTIAL,
  data,
});

/**
 * Update a Credential
 * @param {Object} data
 */
export const updateCredential = (data) => ({
  type: UPDATE_CREDENTIAL,
  data,
});

/**
 * Delete a Credential
 * @param {uuid} credential_uuid
 */
export const deleteCredential = (credential_uuid) => ({
  type: DELETE_CREDENTIAL,
  credential_uuid,
});

/**
 * Get all Product Teams
 */
export const getAllProductTeams = () => ({ type: ALL_PRODUCT_TEAMS });

/**
 * Get a Product Team
 * @param {uuid} productteam_uuid
 */
export const getProductTeam = (productteam_uuid) => ({
  type: GET_PRODUCT_TEAM,
  productteam_uuid,
});

/**
 * Create a Product Team
 * @param {Object} data
 */
export const createProductTeam = (data) => ({
  type: CREATE_PRODUCT_TEAM,
  data,
});

/**
 * Update a Product Team
 * @param {Object} data
 */
export const updateProductTeam = (data) => ({
  type: UPDATE_PRODUCT_TEAM,
  data,
});

/**
 * Delete a Product Team
 * @param {uuid} productteam_uuid
 */
export const deleteProductTeam = (productteam_uuid) => ({
  type: DELETE_PRODUCT_TEAM,
  productteam_uuid,
});

/**
 * Get a Product
 * @param {uuid} product_uuid
 */
export const getProduct = (product_uuid) => ({
  type: GET_PRODUCT,
  product_uuid,
});

/**
 * Get a Third Party Tool
 * @param {uuid} thirdpartytool_uuid
 */
export const getThirdPartyTool = (thirdpartytool_uuid) => ({
  type: GET_THIRD_PARTY_TOOL,
  thirdpartytool_uuid,
});

/**
 * Create a Third Party Tool
 * @param {Object} data
 */
export const createThirdPartyTool = (data) => ({
  type: CREATE_THIRD_PARTY_TOOL,
  data,
});

/**
 * Update a Third Party Tool
 * @param {Object} data
 */
export const updateThirdPartyTool = (data) => ({
  type: UPDATE_THIRD_PARTY_TOOL,
  data,
});

/**
 * Delete a Third Party Tool
 * @param {uuid} thirdpartytool_uuid
 */
export const deleteThirdPartyTool = (thirdpartytool_uuid) => ({
  type: DELETE_THIRD_PARTY_TOOL,
  thirdpartytool_uuid,
});

/**
 * Get board details
 * @param {uuid} product_uuid
 */
export const getBoard = (product_uuid) => ({
  type: GET_BOARD,
  product_uuid,
});

/**
 * Create a board
 * @param {Object} data
 * @param {Array} statusData
 */
export const createBoard = (data, statusData) => ({
  type: CREATE_BOARD,
  data,
  statusData,
});
