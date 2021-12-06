import {
  GET_ISSUES,
  GET_ISSUES_SUCCESS,
  GET_ISSUES_FAILURE,
  ADD_ISSUE,
  ADD_ISSUE_SUCCESS,
  ADD_ISSUE_FAILURE,
  UPDATE_ISSUE,
  UPDATE_ISSUE_SUCCESS,
  UPDATE_ISSUE_FAILURE,
  DELETE_ISSUE,
  DELETE_ISSUE_SUCCESS,
  DELETE_ISSUE_FAILURE,
} from '../actions/release.actions';

const initialState = {
  loading: false,
  loaded: false,
  error: null,
  issue: null,
};

// Reducer
export default (state = initialState, action) => {
  switch (action.type) {
    case GET_ISSUES:
      return {
        ...state,
        loading: true,
        loaded: false,
        error: null,
      };

    case GET_ISSUES_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        issue: action.data,
      };

    case GET_ISSUES_FAILURE:
      return {
        ...state,
        loading: false,
        loaded: true,
        error: action.error,
      };

    case ADD_ISSUE:
      return {
        ...state,
        loading: true,
        loaded: false,
        error: null,
      };

    case ADD_ISSUE_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        issue: action.data,
      };

    case ADD_ISSUE_FAILURE:
      return {
        ...state,
        loading: false,
        loaded: true,
        error: action.error,
      };

    case UPDATE_ISSUE:
      return {
        ...state,
        loading: true,
        loaded: false,
        error: null,
      };

    case UPDATE_ISSUE_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        issue: action.data,
      };

    case UPDATE_ISSUE_FAILURE:
      return {
        ...state,
        loading: false,
        loaded: true,
        error: action.error,
      };

    case DELETE_ISSUE:
      return {
        ...state,
        loading: true,
        loaded: false,
        error: null,
      };

    case DELETE_ISSUE_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        issue: action.data,
      };

    case DELETE_ISSUE_FAILURE:
      return {
        ...state,
        loading: false,
        loaded: true,
        error: action.error,
      };

    default:
      return state;
  }
};
