// Dev Partner Action types
export const ALL_DEV_TEAMS = 'DEVPARTNER/ALL_DEV_TEAMS';
export const ALL_DEV_TEAMS_SUCCESS = 'DEVPARTNER/ALL_DEV_TEAMS_SUCCESS';
export const ALL_DEV_TEAMS_FAILURE = 'DEVPARTNER/ALL_DEV_TEAMS_FAILURE';

export const GET_DEV_TEAM = 'DEVPARTNER/GET_DEV_TEAM';
export const GET_DEV_TEAM_SUCCESS = 'DEVPARTNER/GET_DEV_TEAM_SUCCESS';
export const GET_DEV_TEAM_FAILURE = 'DEVPARTNER/GET_DEV_TEAM_FAILURE';

export const ALL_TIMESHEET_HOURS = 'DEVPARTNER/ALL_TIMESHEET_HOURS';
export const ALL_TIMESHEET_HOURS_SUCCESS = 'DEVPARTNER/ALL_TIMESHEET_HOURS_SUCCESS';
export const ALL_TIMESHEET_HOURS_FAILURE = 'DEVPARTNER/ALL_TIMESHEET_HOURS_FAILURE';

export const GET_TIMESHEET_HOUR = 'DEVPARTNER/GET_TIMESHEET_HOUR';
export const GET_TIMESHEET_HOUR_SUCCESS = 'DEVPARTNER/GET_TIMESHEET_HOUR_SUCCESS';
export const GET_TIMESHEET_HOUR_FAILURE = 'DEVPARTNER/GET_TIMESHEET_HOUR_FAILURE';

export const ALL_TIMESHEETS = 'DEVPARTNER/ALL_TIMESHEETS';
export const ALL_TIMESHEETS_SUCCESS = 'DEVPARTNER/ALL_TIMESHEETS_SUCCESS';
export const ALL_TIMESHEETS_FAILURE = 'DEVPARTNER/ALL_TIMESHEETS_FAILURE';

export const GET_TIMESHEET = 'DEVPARTNER/GET_TIMESHEET';
export const GET_TIMESHEET_SUCCESS = 'DEVPARTNER/GET_TIMESHEET_SUCCESS';
export const GET_TIMESHEET_FAILURE = 'DEVPARTNER/GET_TIMESHEET_FAILURE';

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
