import _ from 'lodash';
import {
  SAVE_PRODUCT_FORM_DATA,
  CLEAR_PRODUCT_RELATED_PRODUCT_DATA,
  ALL_CREDENTIALS,
  ALL_CREDENTIALS_SUCCESS,
  ALL_CREDENTIALS_FAILURE,
  ALL_PRODUCT_TEAMS,
  ALL_PRODUCT_TEAMS_SUCCESS,
  ALL_PRODUCT_TEAMS_FAILURE,
  ALL_PRODUCTS,
  ALL_PRODUCTS_SUCCESS,
  ALL_PRODUCTS_FAILURE,
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
  GET_THIRD_PARTY_TOOL,
  GET_THIRD_PARTY_TOOL_SUCCESS,
  GET_THIRD_PARTY_TOOL_FAILURE,
  GET_BOARD,
  GET_BOARD_SUCCESS,
  GET_BOARD_FAILURE,
  CREATE_CREDENTIAL,
  CREATE_CREDENTIAL_SUCCESS,
  CREATE_CREDENTIAL_FAILURE,
  CREATE_PRODUCT_TEAM,
  CREATE_PRODUCT_TEAM_SUCCESS,
  CREATE_PRODUCT_TEAM_FAILURE,
  CREATE_PRODUCT,
  CREATE_PRODUCT_SUCCESS,
  CREATE_PRODUCT_FAILURE,
  CREATE_THIRD_PARTY_TOOL,
  CREATE_THIRD_PARTY_TOOL_SUCCESS,
  CREATE_THIRD_PARTY_TOOL_FAILURE,
  CREATE_BOARD,
  CREATE_BOARD_SUCCESS,
  CREATE_BOARD_FAILURE,
  UPDATE_CREDENTIAL,
  UPDATE_CREDENTIAL_SUCCESS,
  UPDATE_CREDENTIAL_FAILURE,
  UPDATE_PRODUCT_TEAM,
  UPDATE_PRODUCT_TEAM_SUCCESS,
  UPDATE_PRODUCT_TEAM_FAILURE,
  UPDATE_PRODUCT,
  UPDATE_PRODUCT_SUCCESS,
  UPDATE_PRODUCT_FAILURE,
  UPDATE_THIRD_PARTY_TOOL,
  UPDATE_THIRD_PARTY_TOOL_SUCCESS,
  UPDATE_THIRD_PARTY_TOOL_FAILURE,
  DELETE_CREDENTIAL,
  DELETE_CREDENTIAL_SUCCESS,
  DELETE_CREDENTIAL_FAILURE,
  DELETE_PRODUCT_TEAM,
  DELETE_PRODUCT_TEAM_SUCCESS,
  DELETE_PRODUCT_TEAM_FAILURE,
  DELETE_PRODUCT,
  DELETE_PRODUCT_SUCCESS,
  DELETE_PRODUCT_FAILURE,
  DELETE_THIRD_PARTY_TOOL,
  DELETE_THIRD_PARTY_TOOL_SUCCESS,
  DELETE_THIRD_PARTY_TOOL_FAILURE,
  VALIDATE_CREDENTIAL,
  VALIDATE_CREDENTIAL_SUCCESS,
  VALIDATE_CREDENTIAL_FAILURE,
  ADD_DOC_IDENTIFIER,
  ADD_DOC_IDENTIFIER_SUCCESS,
  ADD_DOC_IDENTIFIER_FAILURE,
} from '../actions/product.actions';

const initialState = {
  loading: false,
  loaded: false,
  error: null,
  credentials: [],
  productTeams: [],
  products: [],
  thirdPartyTools: [],
  boards: {},
  productFormData: null,
  featureCredValid: false,
  issueCredValid: false,
};

// Reducer
export default (state = initialState, action) => {
  switch (action.type) {
    case SAVE_PRODUCT_FORM_DATA: {
      let updatedState = {
        ...state,
        loading: false,
        loaded: true,
        productFormData: action.formData,
      };
      if (!action.formData) {
        updatedState = { ...updatedState, featureCredValid: false, issueCredValid: false };
      }
      return updatedState;
    }

    case CLEAR_PRODUCT_RELATED_PRODUCT_DATA:
      return {
        ...state,
        loading: false,
        loaded: true,
        credentials: [],
        boards: {},
        productFormData: null,
        featureCredValid: false,
        issueCredValid: false,
      };

    case ALL_CREDENTIALS:
    case ALL_PRODUCT_TEAMS:
    case ALL_PRODUCTS:
    case ALL_THIRD_PARTY_TOOLS:
    case GET_CREDENTIAL:
    case GET_PRODUCT_TEAM:
    case GET_PRODUCT:
    case GET_BOARD:
    case GET_THIRD_PARTY_TOOL:
    case CREATE_CREDENTIAL:
    case CREATE_PRODUCT_TEAM:
    case CREATE_PRODUCT:
    case CREATE_THIRD_PARTY_TOOL:
    case CREATE_BOARD:
    case UPDATE_CREDENTIAL:
    case UPDATE_PRODUCT_TEAM:
    case UPDATE_PRODUCT:
    case UPDATE_THIRD_PARTY_TOOL:
    case DELETE_CREDENTIAL:
    case DELETE_PRODUCT_TEAM:
    case DELETE_PRODUCT:
    case DELETE_THIRD_PARTY_TOOL:
    case VALIDATE_CREDENTIAL:
    case ADD_DOC_IDENTIFIER:
      return {
        ...state,
        loading: true,
        loaded: false,
        error: null,
      };

    case ALL_CREDENTIALS_FAILURE:
    case ALL_PRODUCT_TEAMS_FAILURE:
    case ALL_PRODUCTS_FAILURE:
    case ALL_THIRD_PARTY_TOOLS_FAILURE:
    case GET_CREDENTIAL_FAILURE:
    case GET_PRODUCT_TEAM_FAILURE:
    case GET_PRODUCT_FAILURE:
    case GET_BOARD_FAILURE:
    case GET_THIRD_PARTY_TOOL_FAILURE:
    case CREATE_CREDENTIAL_FAILURE:
    case CREATE_PRODUCT_TEAM_FAILURE:
    case CREATE_PRODUCT_FAILURE:
    case CREATE_THIRD_PARTY_TOOL_FAILURE:
    case CREATE_BOARD_FAILURE:
    case UPDATE_CREDENTIAL_FAILURE:
    case UPDATE_PRODUCT_TEAM_FAILURE:
    case UPDATE_PRODUCT_FAILURE:
    case UPDATE_THIRD_PARTY_TOOL_FAILURE:
    case DELETE_CREDENTIAL_FAILURE:
    case DELETE_PRODUCT_TEAM_FAILURE:
    case DELETE_PRODUCT_FAILURE:
    case DELETE_THIRD_PARTY_TOOL_FAILURE:
    case VALIDATE_CREDENTIAL_FAILURE:
    case ADD_DOC_IDENTIFIER_FAILURE:
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

    case GET_CREDENTIAL_SUCCESS:
    case CREATE_CREDENTIAL_SUCCESS:
    case UPDATE_CREDENTIAL_SUCCESS: {
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

    case DELETE_CREDENTIAL_SUCCESS: {
      const creds = _.filter(state.credentials, (cred) => (
        cred.credential_uuid !== action.credential_uuid
      ));

      return {
        ...state,
        loading: false,
        loaded: true,
        credentials: creds,
      };
    }

    case ALL_PRODUCT_TEAMS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        productTeams: action.data,
      };

    case GET_PRODUCT_TEAM_SUCCESS:
    case CREATE_PRODUCT_TEAM_SUCCESS:
    case UPDATE_PRODUCT_TEAM_SUCCESS: {
      const found = _.find(
        state.productTeams,
        { productteam_uuid: action.data.productteam_uuid },
      );
      const productTeams = found
        ? _.map(state.productTeams, (team) => (
          team.productteam_uuid === action.data.productteam_uuid
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

    case DELETE_PRODUCT_TEAM_SUCCESS: {
      const pts = _.filter(state.productTeams, (pt) => (
        pt.productteam_uuid !== action.productteam_uuid
      ));

      return {
        ...state,
        loading: false,
        loaded: true,
        productTeams: pts,
      };
    }

    case ALL_PRODUCTS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        products: action.data,
      };

    case GET_PRODUCT_SUCCESS:
    case CREATE_PRODUCT_SUCCESS:
    case UPDATE_PRODUCT_SUCCESS: {
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

    case DELETE_PRODUCT_SUCCESS: {
      const prods = _.filter(state.products, (prod) => (prod.product_uuid !== action.product_uuid));

      return {
        ...state,
        loading: false,
        loaded: true,
        products: prods,
      };
    }

    case ALL_THIRD_PARTY_TOOLS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        thirdPartyTools: action.data,
      };

    case GET_THIRD_PARTY_TOOL_SUCCESS:
    case CREATE_THIRD_PARTY_TOOL_SUCCESS:
    case UPDATE_THIRD_PARTY_TOOL_SUCCESS: {
      const found = _.find(
        state.thirdPartyTools,
        { thirdpartytool_uuid: action.data.thirdpartytool_uuid },
      );
      const thirdPartyTools = found
        ? _.map(state.thirdPartyTools, (tool) => (
          tool.thirdpartytool_uuid === action.data.thirdpartytool_uuid
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

    case DELETE_THIRD_PARTY_TOOL_SUCCESS: {
      const tpts = _.filter(state.thirdPartyTools, (tp) => (
        tp.thirdpartytool_uuid !== action.thirdpartytool_uuid
      ));

      return {
        ...state,
        loading: false,
        loaded: true,
        thirdPartyTools: tpts,
      };
    }

    case GET_BOARD_SUCCESS:
    case CREATE_BOARD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        boards: action.data,
      };

    case VALIDATE_CREDENTIAL_SUCCESS: {
      let updatedState;
      if (_.toLower(action.tool) === 'feature') {
        updatedState = {
          ...state,
          loading: false,
          loaded: true,
          featureCredValid: true,
        };
      }
      if (_.toLower(action.tool) === 'issue') {
        updatedState = {
          ...state,
          loading: false,
          loaded: true,
          issueCredValid: true,
        };
      }

      return updatedState;
    }

    case ADD_DOC_IDENTIFIER_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        productFormData: action.productFormData,
      };

    default:
      return state;
  }
};
