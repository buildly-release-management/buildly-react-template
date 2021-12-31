import _ from 'lodash';
import {
  ALL_DECISIONS,
  ALL_DECISIONS_SUCCESS,
  ALL_DECISIONS_FAILURE,
  ALL_FEATURES,
  ALL_FEATURES_SUCCESS,
  ALL_FEATURES_FAILURE,
  ALL_FEEDBACKS,
  ALL_FEEDBACKS_SUCCESS,
  ALL_FEEDBACKS_FAILURE,
  ALL_ISSUES,
  ALL_ISSUES_SUCCESS,
  ALL_ISSUES_FAILURE,
  ALL_KANBAN_STATUSES,
  ALL_KANBAN_STATUSES_SUCCESS,
  ALL_KANBAN_STATUSES_FAILURE,
  GET_DECISION,
  GET_DECISION_SUCCESS,
  GET_DECISION_FAILURE,
  GET_FEATURE,
  GET_FEATURE_SUCCESS,
  GET_FEATURE_FAILURE,
  GET_FEEDBACK,
  GET_FEEDBACK_SUCCESS,
  GET_FEEDBACK_FAILURE,
  GET_ISSUE,
  GET_ISSUE_SUCCESS,
  GET_ISSUE_FAILURE,
  GET_KANBAN_STATUS,
  GET_KANBAN_STATUS_SUCCESS,
  GET_KANBAN_STATUS_FAILURE,
} from '../actions/decision.actions';

const initialState = {
  loading: false,
  loaded: false,
  error: null,
  decisions: [],
  features: [],
  feedbacks: [],
  issues: [],
  kanbanStatuses: [],
};

// Reducer
export default (state = initialState, action) => {
  switch (action.type) {
    case ALL_DECISIONS:
    case ALL_FEATURES:
    case ALL_FEEDBACKS:
    case ALL_ISSUES:
    case ALL_KANBAN_STATUSES:
    case GET_DECISION:
    case GET_FEATURE:
    case GET_FEEDBACK:
    case GET_ISSUE:
    case GET_KANBAN_STATUS:
      return {
        ...state,
        loading: true,
        loaded: false,
        error: null,
      };

    case ALL_DECISIONS_FAILURE:
    case ALL_FEATURES_FAILURE:
    case ALL_FEEDBACKS_FAILURE:
    case ALL_ISSUES_FAILURE:
    case ALL_KANBAN_STATUSES_FAILURE:
    case GET_DECISION_FAILURE:
    case GET_FEATURE_FAILURE:
    case GET_FEEDBACK_FAILURE:
    case GET_ISSUE_FAILURE:
    case GET_KANBAN_STATUS_FAILURE:
      return {
        ...state,
        loading: false,
        loaded: true,
        error: action.error,
      };

    case ALL_DECISIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        decisions: action.data,
      };

    case GET_DECISION_SUCCESS: {
      const found = _.find(
        state.decisions,
        { decision_uuid: action.data.decision_uuid },
      );
      const decisions = found
        ? _.map(state.decisions, (decision) => (
          decision.decision_uuid === action.data.decision_uuid
            ? action.data
            : decision
        ))
        : [...state.decisions, action.data];

      return {
        ...state,
        loading: false,
        loaded: true,
        decisions,
      };
    }

    case ALL_FEATURES_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        features: action.data,
      };

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

    case GET_FEEDBACK_SUCCESS: {
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

    case ALL_ISSUES_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        issues: action.data,
      };

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

    case ALL_KANBAN_STATUSES_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        kanbanStatuses: action.data,
      };

    case GET_KANBAN_STATUS_SUCCESS: {
      const found = _.find(
        state.kanbanStatuses,
        { kanban_status_uuid: action.data.kanban_status_uuid },
      );
      const kanbanStatuses = found
        ? _.map(state.kanbanStatuses, (status) => (
          status.kanban_status_uuid === action.data.kanban_status_uuid
            ? action.data
            : status
        ))
        : [...state.kanbanStatuses, action.data];

      return {
        ...state,
        loading: false,
        loaded: true,
        kanbanStatuses,
      };
    }

    default:
      return state;
  }
};
