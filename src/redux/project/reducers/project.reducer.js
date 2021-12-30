import _ from 'lodash';
import {
  SAVE_PRODUCT_FORM_DATA,
  ALL_RELEASES,
  ALL_RELEASES_SUCCESS,
  ALL_RELEASES_FAILURE,
  GET_RELEASE,
  GET_RELEASE_SUCCESS,
  GET_RELEASE_FAILURE,
  ADD_RELEASE,
  ADD_RELEASE_SUCCESS,
  ADD_RELEASE_FAILURE,
  UPDATE_RELEASE,
  UPDATE_RELEASE_SUCCESS,
  UPDATE_RELEASE_FAILURE,
  DELETE_RELEASE,
  DELETE_RELEASE_SUCCESS,
  DELETE_RELEASE_FAILURE,
} from '../actions/project.actions';

const initialState = {
  loading: false,
  loaded: false,
  error: null,
  releases: null,
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

    case ALL_RELEASES:
    case GET_RELEASE:
    case ADD_RELEASE:
    case UPDATE_RELEASE:
    case DELETE_RELEASE:
      return {
        ...state,
        loading: true,
        loaded: false,
        error: null,
      };

    case ALL_RELEASES_FAILURE:
    case GET_RELEASE_FAILURE:
    case ADD_RELEASE_FAILURE:
    case UPDATE_RELEASE_FAILURE:
    case DELETE_RELEASE_FAILURE:
      return {
        ...state,
        loading: false,
        loaded: true,
        error: action.error,
      };

    case ALL_RELEASES_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        releases: action.data,
      };

    case GET_RELEASE_SUCCESS:
    case UPDATE_RELEASE_SUCCESS: {
      const releaseList = _.map(state.releases, (release) => (
        release.release_uuid === action.data.release_uuid
          ? action.data
          : release
      ));

      return {
        ...state,
        loading: false,
        loaded: true,
        releases: releaseList,
      };
    }

    case ADD_RELEASE_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        release: [...state.releases, action.data],
      };

    case DELETE_RELEASE_SUCCESS: {
      const releaseList = state.releases;
      _.remove(releaseList, { release_uuid: action.release_uuid });

      return {
        ...state,
        loading: false,
        loaded: true,
        releases: releaseList,
      };
    }

    default:
      return state;
  }
};
