import * as actions from './devpartner.actions';

// Test Get All Dev Teams
describe('Get All Dev Teams action', () => {
  it('should create an action to get all dev teams', () => {
    const expectedAction = { type: actions.ALL_DEV_TEAMS };
    expect(actions.getAllDevTeams()).toEqual(expectedAction);
  });
});

// Test Get Dev Team
describe('Get Dev Team action', () => {
  it('should create an action to get dev team', () => {
    const dev_team_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.GET_DEV_TEAM,
      dev_team_uuid,
    };

    expect(actions.getDevTeam(dev_team_uuid)).toEqual(expectedAction);
  });
});

// Test Get All Timesheet Hours
describe('Get All Timesheet Hours action', () => {
  it('should create an action to get all timesheet hours', () => {
    const expectedAction = { type: actions.ALL_TIMESHEET_HOURS };
    expect(actions.getAllTimesheetHours()).toEqual(expectedAction);
  });
});

// Test Get Timesheet Hour
describe('Get Timesheet Hour action', () => {
  it('should create an action to get timesheet hour', () => {
    const timesheet_hour_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.GET_TIMESHEET_HOUR,
      timesheet_hour_uuid,
    };

    expect(actions.getTimesheetHour(timesheet_hour_uuid))
      .toEqual(expectedAction);
  });
});

// Test Get All Timesheets
describe('Get All Timesheets action', () => {
  it('should create an action to get all timesheets', () => {
    const expectedAction = { type: actions.ALL_TIMESHEETS };
    expect(actions.getAllTimesheets()).toEqual(expectedAction);
  });
});

// Test Get Timesheet
describe('Get Timesheet action', () => {
  it('should create an action to get timesheet', () => {
    const timesheet_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.GET_TIMESHEET,
      timesheet_uuid,
    };

    expect(actions.getTimesheet(timesheet_uuid)).toEqual(expectedAction);
  });
});
