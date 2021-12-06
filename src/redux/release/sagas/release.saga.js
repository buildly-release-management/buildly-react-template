import {
  put, takeLatest, all, call,
} from 'redux-saga/effects';
import { httpService } from '@modules/http/http.service';
import { showAlert } from '@redux/alert/actions/alert.actions';
import {
  GET_ISSUES,
  GET_ISSUES_SUCCESS,
  GET_ISSUES_FAILURE,
  ADD_ISSUE,
  ADD_ISSUE_FAILURE,
  UPDATE_ISSUE,
  UPDATE_ISSUE_FAILURE,
  DELETE_ISSUE,
  DELETE_ISSUE_FAILURE,
} from '../actions/release.actions';

const releaseEndpoint = 'release/';

function* getIssues(payload) {
  try {
    const data = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${devPartnerEndpoint}issue/?project_uuid=${payload.project_uuid}`,
    );
    yield put({ type: GET_ISSUES_SUCCESS, data: data.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch Issues!',
        }),
      ),
      yield put({
        type: GET_ISSUES_FAILURE,
        error,
      }),
    ];
  }
}

function* addIssue(action) {
  const { payload } = action;
  try {
    const data = yield call(
      httpService.makeRequest,
      'post',
      `${window.env.API_URL}${devPartnerEndpoint}issue/`,
      payload,
    );

    if (data && data.data) {
      yield [
        yield put(getIssues(data.data.issue_uuid)),
        yield put(
          showAlert({
            type: 'success',
            open: true,
            message: 'Successfully Added Issue',
          }),
        ),

      ];
    }
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t Add Issue due to some error!',
        }),
      ),
      yield put({
        type: ADD_ISSUE_FAILURE,
        error,
      }),
    ];
  }
}

function* updateIssue(action) {
  const { payload } = action;
  try {
    const data = yield call(
      httpService.makeRequest,
      'patch',
      `${window.env.API_URL}${devPartnerEndpoint}issue/${payload.issue_uuid}/`,
      payload,
    );
    if (data && data.data) {
      yield [
        yield put(getIssues(payload.issue_uuid)),
        yield put(
          showAlert({
            type: 'success',
            open: true,
            message: 'Successfully Edited Issue',
          }),
        ),
      ];
    }
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t Edit Issue due to some error!',
        }),
      ),
      yield put({
        type: UPDATE_ISSUE_FAILURE,
        error,
      }),
    ];
  }
}

function* deleteIssue(payload) {
  try {
    yield call(
      httpService.makeRequest,
      'delete',
      `${window.env.API_URL}${devPartnerEndpoint}issue/${payload.issue_uuid}/`,
    );
    yield [
      yield put(
        showAlert({
          type: 'success',
          open: true,
          message: 'Issue deleted successfully!',
        }),
      ),
      yield put(getIssues(payload.project_uuid)),
    ];
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Error in deleting issue!',
        }),
      ),
      yield put({
        type: DELETE_ISSUE_FAILURE,
        error,
      }),
    ];
  }
}

function* watchGetIssues() {
  yield takeLatest(GET_ISSUES, getIssues);
}

function* watchAddIssue() {
  yield takeLatest(ADD_ISSUE, addIssue);
}

function* watchUpdateIssue() {
  yield takeLatest(UPDATE_ISSUE, updateIssue);
}

function* watchDeleteIssue() {
  yield takeLatest(DELETE_ISSUE, deleteIssue);
}

export default function* releaseSaga() {
  yield all([
    watchGetIssues(),
    watchAddIssue(),
    watchUpdateIssue(),
    watchDeleteIssue(),
  ]);
}
