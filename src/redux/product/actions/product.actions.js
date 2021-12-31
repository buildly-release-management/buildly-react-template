// Product Action types
export const SAVE_PRODUCT_FORM_DATA = 'PRODUCT/SAVE_PRODUCT_FORM_DATA';

export const ALL_CREDENTIALS = 'PRODUCT/ALL_CREDENTIALS';
export const ALL_CREDENTIALS_SUCCESS = 'PRODUCT/ALL_CREDENTIALS_SUCCESS';
export const ALL_CREDENTIALS_FAILURE = 'PRODUCT/ALL_CREDENTIALS_FAILURE';

export const GET_CREDENTIAL = 'PRODUCT/GET_CREDENTIAL';
export const GET_CREDENTIAL_SUCCESS = 'PRODUCT/GET_CREDENTIAL_SUCCESS';
export const GET_CREDENTIAL_FAILURE = 'PRODUCT/GET_CREDENTIAL_FAILURE';

export const ALL_PRODUCT_TEAMS = 'PRODUCT/ALL_PRODUCT_TEAMS';
export const ALL_PRODUCT_TEAMS_SUCCESS = 'PRODUCT/ALL_PRODUCT_TEAMS_SUCCESS';
export const ALL_PRODUCT_TEAMS_FAILURE = 'PRODUCT/ALL_PRODUCT_TEAMS_FAILURE';

export const GET_PRODUCT_TEAM = 'PRODUCT/GET_PRODUCT_TEAM';
export const GET_PRODUCT_TEAM_SUCCESS = 'PRODUCT/GET_PRODUCT_TEAM_SUCCESS';
export const GET_PRODUCT_TEAM_FAILURE = 'PRODUCT/GET_PRODUCT_TEAM_FAILURE';

export const ALL_PRODUCTS = 'PRODUCT/ALL_PRODUCTS';
export const ALL_PRODUCTS_SUCCESS = 'PRODUCT/ALL_PRODUCTS_SUCCESS';
export const ALL_PRODUCTS_FAILURE = 'PRODUCT/ALL_PRODUCTS_FAILURE';

export const GET_PRODUCT = 'PRODUCT/GET_PRODUCT';
export const GET_PRODUCT_SUCCESS = 'PRODUCT/GET_PRODUCT_SUCCESS';
export const GET_PRODUCT_FAILURE = 'PRODUCT/GET_PRODUCT_FAILURE';

export const ALL_RELEASES = 'PRODUCT/ALL_RELEASES';
export const ALL_RELEASES_SUCCESS = 'PRODUCT/ALL_RELEASES_SUCCESS';
export const ALL_RELEASES_FAILURE = 'PRODUCT/ALL_RELEASES_FAILURE';

export const GET_RELEASE = 'PRODUCT/GET_RELEASE';
export const GET_RELEASE_SUCCESS = 'PRODUCT/GET_RELEASE_SUCCESS';
export const GET_RELEASE_FAILURE = 'PRODUCT/GET_RELEASE_FAILURE';

export const ALL_THIRD_PARTY_TOOLS = 'PRODUCT/ALL_THIRD_PARTY_TOOLS';
export const ALL_THIRD_PARTY_TOOLS_SUCCESS = 'PRODUCT/ALL_THIRD_PARTY_TOOLS_SUCCESS';
export const ALL_THIRD_PARTY_TOOLS_FAILURE = 'PRODUCT/ALL_THIRD_PARTY_TOOLS_FAILURE';

export const GET_THIRD_PARTY_TOOL = 'PRODUCT/GET_THIRD_PARTY_TOOL';
export const GET_THIRD_PARTY_TOOL_SUCCESS = 'PRODUCT/GET_THIRD_PARTY_TOOL_SUCCESS';
export const GET_THIRD_PARTY_TOOL_FAILURE = 'PRODUCT/GET_THIRD_PARTY_TOOL_FAILURE';

/**
 * Save Product Form Data
 * @param {Object} formData
 */
export const saveProductFormData = (formData) => ({
  type: SAVE_PRODUCT_FORM_DATA,
  formData,
});

/**
 * Get all Credentials
 */
export const getAllCredentials = () => ({ type: ALL_CREDENTIALS });

/**
 * Get a Credential
 * @param {uuid} credential_uuid
 */
export const getCredential = (credential_uuid) => ({
  type: GET_CREDENTIAL,
  credential_uuid,
});

/**
 * Get all Product Teams
 */
export const getAllProductTeams = () => ({ type: ALL_PRODUCT_TEAMS });

/**
 * Get a Product Team
 * @param {uuid} product_team_uuid
 */
export const getProductTeam = (product_team_uuid) => ({
  type: GET_PRODUCT_TEAM,
  product_team_uuid,
});

/**
 * Get all Products
 */
export const getAllProducts = () => ({ type: ALL_PRODUCTS });

/**
 * Get a Product
 * @param {uuid} product_uuid
 */
export const getProduct = (product_uuid) => ({
  type: GET_PRODUCT,
  product_uuid,
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
 * Get all Third Party Tools
 */
export const getAllThirdPartyTools = () => ({ type: ALL_THIRD_PARTY_TOOLS });

/**
 * Get a Third Party Tool
 * @param {uuid} third_party_tool_uuid
 */
export const getThirdPartyTool = (third_party_tool_uuid) => ({
  type: GET_THIRD_PARTY_TOOL,
  third_party_tool_uuid,
});