import _ from 'lodash';
import {
  ALL_FEEDBACKS,
  ALL_FEEDBACKS_SUCCESS,
  ALL_FEEDBACKS_FAILURE,
  GET_RELEASE,
  GET_RELEASE_SUCCESS,
  GET_RELEASE_FAILURE,
  GET_COMMENT,
  GET_COMMENT_SUCCESS,
  GET_COMMENT_FAILURE,
  GET_FEATURE,
  GET_FEATURE_SUCCESS,
  GET_FEATURE_FAILURE,
  GET_FEEDBACK,
  GET_FEEDBACK_SUCCESS,
  GET_FEEDBACK_FAILURE,
  GET_ISSUE,
  GET_ISSUE_SUCCESS,
  GET_ISSUE_FAILURE,
  GET_STATUS,
  GET_STATUS_SUCCESS,
  GET_STATUS_FAILURE,
  CREATE_RELEASE,
  CREATE_RELEASE_SUCCESS,
  CREATE_RELEASE_FAILURE,
  CREATE_FEEDBACK,
  CREATE_FEEDBACK_SUCCESS,
  CREATE_FEEDBACK_FAILURE,
  UPDATE_RELEASE,
  UPDATE_RELEASE_SUCCESS,
  UPDATE_RELEASE_FAILURE,
  UPDATE_COMMENT,
  UPDATE_COMMENT_SUCCESS,
  UPDATE_COMMENT_FAILURE,
  UPDATE_FEEDBACK,
  UPDATE_FEEDBACK_SUCCESS,
  UPDATE_FEEDBACK_FAILURE,
  UPDATE_STATUS,
  UPDATE_STATUS_SUCCESS,
  UPDATE_STATUS_FAILURE,
  DELETE_RELEASE,
  DELETE_RELEASE_SUCCESS,
  DELETE_RELEASE_FAILURE,
  DELETE_COMMENT,
  DELETE_COMMENT_SUCCESS,
  DELETE_COMMENT_FAILURE,
  DELETE_FEEDBACK,
  DELETE_FEEDBACK_SUCCESS,
  DELETE_FEEDBACK_FAILURE,
  DELETE_STATUS,
  DELETE_STATUS_SUCCESS,
  DELETE_STATUS_FAILURE,
} from '../actions/release.actions';

const initialState = {
  loading: false,
  loaded: false,
  error: null,
  releases: [],
  comments: [],
  features: [],
  feedbacks: [],
  issues: [],
  statuses: [],
  dataSynced: false,
};

// Reducer
export default (state = initialState, action) => {
  switch (action.type) {
    case ALL_FEEDBACKS:
    case GET_RELEASE:
    case GET_COMMENT:
    case GET_FEATURE:
    case GET_FEEDBACK:
    case GET_ISSUE:
    case GET_STATUS:
    case CREATE_RELEASE:
    case CREATE_FEEDBACK:
    case UPDATE_RELEASE:
    case UPDATE_COMMENT:
    case UPDATE_FEEDBACK:
    case UPDATE_STATUS:
    case DELETE_RELEASE:
    case DELETE_COMMENT:
    case DELETE_FEEDBACK:
    case DELETE_STATUS:
      return {
        ...state,
        loading: true,
        loaded: false,
        error: null,
        dataSynced: false,
      };

    case ALL_FEEDBACKS_FAILURE:
    case GET_RELEASE_FAILURE:
    case GET_COMMENT_FAILURE:
    case GET_FEATURE_FAILURE:
    case GET_FEEDBACK_FAILURE:
    case GET_ISSUE_FAILURE:
    case GET_STATUS_FAILURE:
    case CREATE_RELEASE_FAILURE:
    case CREATE_FEEDBACK_FAILURE:
    case UPDATE_RELEASE_FAILURE:
    case UPDATE_COMMENT_FAILURE:
    case UPDATE_FEEDBACK_FAILURE:
    case UPDATE_STATUS_FAILURE:
    case DELETE_RELEASE_FAILURE:
    case DELETE_COMMENT_FAILURE:
    case DELETE_FEEDBACK_FAILURE:
    case DELETE_STATUS_FAILURE:
      return {
        ...state,
        loading: false,
        loaded: true,
        error: action.error,
      };

    case GET_RELEASE_SUCCESS:
    case CREATE_RELEASE_SUCCESS:
    case UPDATE_RELEASE_SUCCESS: {
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

    case DELETE_RELEASE_SUCCESS: {
      const rels = _.filter(state.releases, (rel) => (rel.release_uuid !== action.release_uuid));

      return {
        ...state,
        loading: false,
        loaded: true,
        releases: rels,
      };
    }

    case GET_COMMENT_SUCCESS:
    case UPDATE_COMMENT_SUCCESS: {
      const found = _.find(
        state.comments,
        { comment_uuid: action.data.comment_uuid },
      );
      const comments = found
        ? _.map(state.comments, (comment) => (
          comment.comment_uuid === action.data.comment_uuid
            ? action.data
            : comment
        ))
        : [...state.comments, action.data];

      return {
        ...state,
        loading: false,
        loaded: true,
        comments,
      };
    }

    case DELETE_COMMENT_SUCCESS: {
      const comms = _.filter(state.comments, (comm) => (comm.comment_uuid !== action.comment_uuid));

      return {
        ...state,
        loading: false,
        loaded: true,
        comments: comms,
      };
    }

    case GET_FEATURE_SUCCESS: {
      const found = _.find(
        state.features,
        { feature_uuid: action.data.feature_uuid },
      );
      const features = found
        ? _.map(state.features, (feature) => (
          feature.feature_uuid === action.data.feature_uuid
            ? action.data
            : feature
        ))
        : [...state.features, action.data];

      return {
        ...state,
        loading: false,
        loaded: true,
        features,
      };
    }

    case ALL_FEEDBACKS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        feedbacks: action.data,
      };

    case GET_FEEDBACK_SUCCESS:
    case CREATE_FEEDBACK_SUCCESS:
    case UPDATE_FEEDBACK_SUCCESS: {
      const found = _.find(
        state.feedbacks,
        { feedback_uuid: action.data.feedback_uuid },
      );
      const feedbacks = found
        ? _.map(state.feedbacks, (feedback) => (
          feedback.feedback_uuid === action.data.feedback_uuid
            ? action.data
            : feedback
        ))
        : [...state.feedbacks, action.data];

      return {
        ...state,
        loading: false,
        loaded: true,
        feedbacks,
      };
    }

    case DELETE_FEEDBACK_SUCCESS: {
      const fbs = _.filter(state.feedbacks, (fb) => (fb.feedback_uuid !== action.feedback_uuid));

      return {
        ...state,
        loading: false,
        loaded: true,
        feedbacks: fbs,
      };
    }

    case GET_ISSUE_SUCCESS: {
      const found = _.find(
        state.issues,
        { issue_uuid: action.data.issue_uuid },
      );
      const issues = found
        ? _.map(state.issues, (issue) => (
          issue.issue_uuid === action.data.issue_uuid
            ? action.data
            : issue
        ))
        : [...state.issues, action.data];

      return {
        ...state,
        loading: false,
        loaded: true,
        issues,
      };
    }

    case GET_STATUS_SUCCESS:
    case UPDATE_STATUS_SUCCESS: {
      const found = _.find(
        state.statuses,
        { product_uuid: action.data.product_uuid },
      );
      const statuses = found
        ? _.map(state.statuses, (status) => (
          status.product_uuid === action.data.product_uuid
            ? action.data
            : status
        ))
        : [...state.statuses, action.data];

      return {
        ...state,
        loading: false,
        loaded: true,
        statuses,
      };
    }

    case DELETE_STATUS_SUCCESS: {
      const sts = _.filter(state.statuses, (st) => (st.status_uuid !== action.status_uuid));

      return {
        ...state,
        loading: false,
        loaded: true,
        statuses: sts,
      };
    }

    default:
      return state;
  }
};
