import {
  put, takeLatest, all, call,
} from 'redux-saga/effects';
import { httpService } from '@modules/http/http.service';
import { showAlert } from '@redux/alert/actions/alert.actions';
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

const devpartnerEndpoint = 'devpartner/';

function* allDevTeams(payload) {
  try {
    const devteams = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${devpartnerEndpoint}devteam/?join=true`,
    );
    yield put({ type: ALL_DEV_TEAMS_SUCCESS, data: devteams.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch all Dev Teams!',
        }),
      ),
      yield put({
        type: ALL_DEV_TEAMS_FAILURE,
        error,
      }),
    ];
  }
}

function* getDevTeam(payload) {
  try {
    const devteam = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${devpartnerEndpoint}devteam/?join=true&dev_team_uuid=${payload.dev_team_uuid}`,
    );
    yield put({ type: GET_DEV_TEAM_SUCCESS, data: devteam.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch Dev Team!',
        }),
      ),
      yield put({
        type: GET_DEV_TEAM_FAILURE,
        error,
      }),
    ];
  }
}

function* allTimesheetHours(payload) {
  try {
    const hours = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${devpartnerEndpoint}timesheet_hour/?join=true`,
    );
    yield put({ type: ALL_TIMESHEET_HOURS_SUCCESS, data: hours.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch all Timesheet Hours!',
        }),
      ),
      yield put({
        type: ALL_TIMESHEET_HOURS_FAILURE,
        error,
      }),
    ];
  }
}

function* getTimesheetHour(payload) {
  try {
    const hour = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${devpartnerEndpoint}timesheet_hour/?join=true&timesheet_hour_uuid=${payload.timesheet_hour_uuid}`,
    );
    yield put({ type: GET_TIMESHEET_HOUR_SUCCESS, data: hour.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch Timesheet Hour!',
        }),
      ),
      yield put({
        type: GET_TIMESHEET_HOUR_FAILURE,
        error,
      }),
    ];
  }
}

function* allTimesheets(payload) {
  try {
    const sheets = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${devpartnerEndpoint}timesheet/?join=true`,
    );
    yield put({ type: ALL_TIMESHEETS_SUCCESS, data: sheets.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch all Timesheets!',
        }),
      ),
      yield put({
        type: ALL_TIMESHEETS_FAILURE,
        error,
      }),
    ];
  }
}

function* getTimesheet(payload) {
  try {
    const sheet = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${devpartnerEndpoint}timesheet/?join=true&timesheet_uuid=${payload.timesheet_uuid}`,
    );
    yield put({ type: GET_TIMESHEET_SUCCESS, data: sheet.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch Timesheet!',
        }),
      ),
      yield put({
        type: GET_TIMESHEET_FAILURE,
        error,
      }),
    ];
  }
}

// Watchers
function* watchGetAllDevTeams() {
  yield takeLatest(ALL_DEV_TEAMS, allDevTeams);
}

function* watchGetDevTeam() {
  yield takeLatest(GET_DEV_TEAM, getDevTeam);
}

function* watchGetAllTimesheetHours() {
  yield takeLatest(ALL_TIMESHEET_HOURS, allTimesheetHours);
}

function* watchGetTimesheetHour() {
  yield takeLatest(GET_TIMESHEET_HOUR, getTimesheetHour);
}

function* watchGetAllTimesheets() {
  yield takeLatest(ALL_TIMESHEETS, allTimesheets);
}

function* watchGetTimesheet() {
  yield takeLatest(GET_TIMESHEET, getTimesheet);
}

export default function* devpartnerSaga() {
  yield all([
    watchGetAllDevTeams(),
    watchGetAllTimesheetHours(),
    watchGetAllTimesheets(),
    watchGetDevTeam(),
    watchGetTimesheetHour(),
    watchGetTimesheet(),
  ]);
}
