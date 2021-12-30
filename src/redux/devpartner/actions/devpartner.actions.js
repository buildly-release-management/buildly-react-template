// Dev Partner Action types
export const ALL_DEV_TEAMS = 'PROJECT_TOOL/ALL_DEV_TEAMS';
export const ALL_DEV_TEAMS_SUCCESS = 'PROJECT_TOOL/ALL_DEV_TEAMS_SUCCESS';
export const ALL_DEV_TEAMS_FAILURE = 'PROJECT_TOOL/ALL_DEV_TEAMS_FAILURE';

export const GET_DEV_TEAM = 'PROJECT_TOOL/GET_DEV_TEAM';
export const GET_DEV_TEAM_SUCCESS = 'PROJECT_TOOL/GET_DEV_TEAM_SUCCESS';
export const GET_DEV_TEAM_FAILURE = 'PROJECT_TOOL/GET_DEV_TEAM_FAILURE';

export const ALL_TIMESHEET_HOURS = 'PROJECT_TOOL/ALL_TIMESHEET_HOURS';
export const ALL_TIMESHEET_HOURS_SUCCESS = 'PROJECT_TOOL/ALL_TIMESHEET_HOURS_SUCCESS';
export const ALL_TIMESHEET_HOURS_FAILURE = 'PROJECT_TOOL/ALL_TIMESHEET_HOURS_FAILURE';

export const GET_TIMESHEET_HOUR = 'PROJECT_TOOL/GET_TIMESHEET_HOUR';
export const GET_TIMESHEET_HOUR_SUCCESS = 'PROJECT_TOOL/GET_TIMESHEET_HOUR_SUCCESS';
export const GET_TIMESHEET_HOUR_FAILURE = 'PROJECT_TOOL/GET_TIMESHEET_HOUR_FAILURE';

export const ALL_TIMESHEETS = 'PROJECT_TOOL/ALL_TIMESHEETS';
export const ALL_TIMESHEETS_SUCCESS = 'PROJECT_TOOL/ALL_TIMESHEETS_SUCCESS';
export const ALL_TIMESHEETS_FAILURE = 'PROJECT_TOOL/ALL_TIMESHEETS_FAILURE';

export const GET_TIMESHEET = 'PROJECT_TOOL/GET_TIMESHEET';
export const GET_TIMESHEET_SUCCESS = 'PROJECT_TOOL/GET_TIMESHEET_SUCCESS';
export const GET_TIMESHEET_FAILURE = 'PROJECT_TOOL/GET_TIMESHEET_FAILURE';

/**
 * Get all Dev Teams
 */
export const getAllDevTeams = () => ({ type: ALL_DEV_TEAMS });

/**
 * Get a Dev Team
 * @param {uuid} dev_team_uuid
 */
export const getDevTeam = (dev_team_uuid) => ({
  type: GET_DEV_TEAM,
  dev_team_uuid,
});

/**
 * Get all Timesheet Hours
 */
export const getAllTimesheetHours = () => ({ type: ALL_TIMESHEET_HOURS });

/**
 * Get a Timesheet Hour
 * @param {uuid} timesheet_hour_uuid
 */
export const getTimesheetHour = (timesheet_hour_uuid) => ({
  type: GET_TIMESHEET_HOUR,
  timesheet_hour_uuid,
});

/**
 * Get all Timesheets
 */
export const getAllTimesheets = () => ({ type: ALL_TIMESHEETS });

/**
 * Get a Timesheet
 * @param {uuid} timesheet_uuid
 */
export const getTimesheet = (timesheet_uuid) => ({
  type: GET_TIMESHEET,
  timesheet_uuid,
});
