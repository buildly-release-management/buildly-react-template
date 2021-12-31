import _ from 'lodash';
import {
  ALL_DEV_TEAMS,
  ALL_DEV_TEAMS_SUCCESS,
  ALL_DEV_TEAMS_FAILURE,
  ALL_TIMESHEET_HOURS,
  ALL_TIMESHEET_HOURS_SUCCESS,
  ALL_TIMESHEET_HOURS_FAILURE,
  ALL_TIMESHEETS,
  ALL_TIMESHEETS_SUCCESS,
  ALL_TIMESHEETS_FAILURE,
  GET_DEV_TEAM,
  GET_DEV_TEAM_SUCCESS,
  GET_DEV_TEAM_FAILURE,
  GET_TIMESHEET_HOUR,
  GET_TIMESHEET_HOUR_SUCCESS,
  GET_TIMESHEET_HOUR_FAILURE,
  GET_TIMESHEET,
  GET_TIMESHEET_SUCCESS,
  GET_TIMESHEET_FAILURE,
} from '../actions/devpartner.actions';

const initialState = {
  loading: false,
  loaded: false,
  error: null,
  devTeams: [],
  timesheetHours: [],
  timesheets: [],
};

// Reducer
export default (state = initialState, action) => {
  switch (action.type) {
    case ALL_DEV_TEAMS:
    case ALL_TIMESHEET_HOURS:
    case ALL_TIMESHEETS:
    case GET_DEV_TEAM:
    case GET_TIMESHEET_HOUR:
    case GET_TIMESHEET:
      return {
        ...state,
        loading: true,
        loaded: false,
        error: null,
      };

    case ALL_DEV_TEAMS_FAILURE:
    case ALL_TIMESHEET_HOURS_FAILURE:
    case ALL_TIMESHEETS_FAILURE:
    case GET_DEV_TEAM_FAILURE:
    case GET_TIMESHEET_HOUR_FAILURE:
    case GET_TIMESHEET_FAILURE:
      return {
        ...state,
        loading: false,
        loaded: true,
        error: action.error,
      };

    case ALL_DEV_TEAMS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        devTeams: action.data,
      };

    case GET_DEV_TEAM_SUCCESS: {
      const found = _.find(
        state.devTeams,
        { dev_team_uuid: action.data.dev_team_uuid },
      );
      const teams = found
        ? _.map(state.devTeams, (team) => (
          team.dev_team_uuid === action.data.dev_team_uuid
            ? action.data
            : team
        ))
        : [...state.devTeams, action.data];

      return {
        ...state,
        loading: false,
        loaded: true,
        devTeams: teams,
      };
    }

    case ALL_TIMESHEET_HOURS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        timesheetHours: action.data,
      };

    case GET_TIMESHEET_HOUR_SUCCESS: {
      const found = _.find(
        state.timesheetHours,
        { timesheet_hour_uuid: action.data.timesheet_hour_uuid },
      );
      const hours = found
        ? _.map(state.timesheetHours, (hour) => (
          hour.timesheet_hour_uuid === action.data.timesheet_hour_uuid
            ? action.data
            : hour
        ))
        : [...state.timesheetHours, action.data];

      return {
        ...state,
        loading: false,
        loaded: true,
        timesheetHours: hours,
      };
    }

    case ALL_TIMESHEETS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        timesheets: action.data,
      };

    case GET_TIMESHEET_SUCCESS: {
      const found = _.find(
        state.timesheets,
        { timesheet_uuid: action.data.timesheet_uuid },
      );
      const sheets = found
        ? _.map(state.timesheets, (sheet) => (
          sheet.timesheet_uuid === action.data.timesheet_uuid
            ? action.data
            : sheet
        ))
        : [...state.timesheets, action.data];

      return {
        ...state,
        loading: false,
        loaded: true,
        timesheets: sheets,
      };
    }

    default:
      return state;
  }
};
