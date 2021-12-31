import _ from 'lodash';
import {
  SAVE_PRODUCT_FORM_DATA,
  ALL_CREDENTIALS,
  ALL_CREDENTIALS_SUCCESS,
  ALL_CREDENTIALS_FAILURE,
  ALL_PRODUCT_TEAMS,
  ALL_PRODUCT_TEAMS_SUCCESS,
  ALL_PRODUCT_TEAMS_FAILURE,
  ALL_PRODUCTS,
  ALL_PRODUCTS_SUCCESS,
  ALL_PRODUCTS_FAILURE,
  ALL_RELEASES,
  ALL_RELEASES_SUCCESS,
  ALL_RELEASES_FAILURE,
  ALL_THIRD_PARTY_TOOLS,
  ALL_THIRD_PARTY_TOOLS_SUCCESS,
  ALL_THIRD_PARTY_TOOLS_FAILURE,
  GET_CREDENTIAL,
  GET_CREDENTIAL_SUCCESS,
  GET_CREDENTIAL_FAILURE,
  GET_PRODUCT_TEAM,
  GET_PRODUCT_TEAM_SUCCESS,
  GET_PRODUCT_TEAM_FAILURE,
  GET_PRODUCT,
  GET_PRODUCT_SUCCESS,
  GET_PRODUCT_FAILURE,
  GET_RELEASE,
  GET_RELEASE_SUCCESS,
  GET_RELEASE_FAILURE,
  GET_THIRD_PARTY_TOOL,
  GET_THIRD_PARTY_TOOL_SUCCESS,
  GET_THIRD_PARTY_TOOL_FAILURE,
} from '../actions/product.actions';

const initialState = {
  loading: false,
  loaded: false,
  error: null,
  credentials: [],
  productTeams: [],
  products: [],
  releases: [],
  thirdPartyTools: [],
  productFormData: null,
};

// Reducer
export default (state = initialState, action) => {
  switch (action.type) {
    case SAVE_PRODUCT_FORM_DATA:
      return {
        ...state,
        productFormData: action.formData,
      };

    case ALL_CREDENTIALS:
    case ALL_PRODUCT_TEAMS:
    case ALL_PRODUCTS:
    case ALL_RELEASES:
    case ALL_THIRD_PARTY_TOOLS:
    case GET_CREDENTIAL:
    case GET_PRODUCT_TEAM:
    case GET_PRODUCT:
    case GET_RELEASE:
    case GET_THIRD_PARTY_TOOL:
      return {
        ...state,
        loading: true,
        loaded: false,
        error: null,
      };

    case ALL_CREDENTIALS_FAILURE:
    case ALL_PRODUCT_TEAMS_FAILURE:
    case ALL_PRODUCTS_FAILURE:
    case ALL_RELEASES_FAILURE:
    case ALL_THIRD_PARTY_TOOLS_FAILURE:
    case GET_CREDENTIAL_FAILURE:
    case GET_PRODUCT_TEAM_FAILURE:
    case GET_PRODUCT_FAILURE:
    case GET_RELEASE_FAILURE:
    case GET_THIRD_PARTY_TOOL_FAILURE:
      return {
        ...state,
        loading: false,
        loaded: true,
        error: action.error,
      };

    case ALL_CREDENTIALS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        credentials: action.data,
      };

    case GET_CREDENTIAL_SUCCESS: {
      const found = _.find(
        state.credentials,
        { credential_uuid: action.data.credential_uuid },
      );
      const credentials = found
        ? _.map(state.credentials, (cred) => (
          cred.credential_uuid === action.data.credential_uuid
            ? action.data
            : cred
        ))
        : [...state.credentials, action.data];

      return {
        ...state,
        loading: false,
        loaded: true,
        credentials,
      };
    }

    case ALL_PRODUCT_TEAMS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        productTeams: action.data,
      };

    case GET_PRODUCT_TEAM_SUCCESS: {
      const found = _.find(
        state.productTeams,
        { product_team_uuid: action.data.product_team_uuid },
      );
      const productTeams = found
        ? _.map(state.productTeams, (team) => (
          team.product_team_uuid === action.data.product_team_uuid
            ? action.data
            : team
        ))
        : [...state.productTeams, action.data];

      return {
        ...state,
        loading: false,
        loaded: true,
        productTeams,
      };
    }

    case ALL_PRODUCTS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        products: action.data,
      };

    case GET_PRODUCT_SUCCESS: {
      const found = _.find(
        state.products,
        { product_uuid: action.data.product_uuid },
      );
      const products = found
        ? _.map(state.products, (product) => (
          product.product_uuid === action.data.product_uuid
            ? action.data
            : product
        ))
        : [...state.products, action.data];

      return {
        ...state,
        loading: false,
        loaded: true,
        products,
      };
    }

    case ALL_RELEASES_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        releases: action.data,
      };

    case GET_RELEASE_SUCCESS: {
      const found = _.find(
        state.releases,
        { release_uuid: action.data.release_uuid },
      );
      const releases = found
        ? _.map(state.releases, (release) => (
          release.release_uuid === action.data.release_uuid
            ? action.data
            : release
        ))
        : [...state.releases, action.data];

      return {
        ...state,
        loading: false,
        loaded: true,
        releases,
      };
    }

    case ALL_THIRD_PARTY_TOOLS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        thirdPartyTools: action.data,
      };

    case GET_THIRD_PARTY_TOOL_SUCCESS: {
      const found = _.find(
        state.thirdPartyTools,
        { third_party_tool_uuid: action.data.third_party_tool_uuid },
      );
      const thirdPartyTools = found
        ? _.map(state.thirdPartyTools, (tool) => (
          tool.third_party_tool_uuid === action.data.third_party_tool_uuid
            ? action.data
            : tool
        ))
        : [...state.thirdPartyTools, action.data];

      return {
        ...state,
        loading: false,
        loaded: true,
        thirdPartyTools,
      };
    }

    default:
      return state;
  }
};
