import * as actions from '../actions/devpartner.actions';
import * as reducer from './devpartner.reducer';

const initialState = {
  loading: false,
  loaded: false,
  error: null,
  devTeams: null,
  timesheets: null,
  timesheetHours: null,
};

describe('Get all dev teams reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_DEV_TEAMS },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get all dev teams success reducer', () => {
    const data = [{
      dev_team_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    }];

    expect(reducer.default(
      initialState,
      { type: actions.ALL_DEV_TEAMS_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      devTeams: data,
    });
  });

  it('get all dev teams fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_DEV_TEAMS_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get a dev team reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_DEV_TEAM },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get a dev team success reducer', () => {
    const data = {
      dev_team_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.GET_DEV_TEAM_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      devTeams: [data],
    });
  });

  it('get a dev team fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_DEV_TEAM_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get all timesheet hours reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_TIMESHEET_HOURS },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get all timesheet hours success reducer', () => {
    const data = [{
      timesheet_hour_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    }];

    expect(reducer.default(
      initialState,
      { type: actions.ALL_TIMESHEET_HOURS_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      timesheetHours: data,
    });
  });

  it('get all timesheet hours fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_TIMESHEET_HOURS_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get a timesheet hour reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_TIMESHEET_HOUR },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get a timesheet hour success reducer', () => {
    const data = {
      timesheet_hour_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.GET_TIMESHEET_HOUR_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      timesheetHours: [data],
    });
  });

  it('get a timesheet hour fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_TIMESHEET_HOUR_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get all timesheets reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_TIMESHEETS },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get all timesheets success reducer', () => {
    const data = [{
      timesheet_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    }];

    expect(reducer.default(
      initialState,
      { type: actions.ALL_TIMESHEETS_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      timesheets: data,
    });
  });

  it('get all timesheets fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_TIMESHEETS_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get a timesheet reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_TIMESHEET },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get a timesheet success reducer', () => {
    const data = {
      timesheet_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.GET_TIMESHEET_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      timesheets: [data],
    });
  });

  it('get a timesheet fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_TIMESHEET_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});
