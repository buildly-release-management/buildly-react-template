import {
  put, takeLatest, all, call,
} from 'redux-saga/effects';
import { httpService } from '@modules/http/http.service';
import { showAlert } from '@redux/alert/actions/alert.actions';
import {
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

const projectEndpoint = 'projecttool/';

function* allReleases(payload) {
  try {
    const releases = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${projecttoolEndpoint}release?join=true`,
    );
    yield put({ type: ALL_RELEASES_SUCCESS, data: releases.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch all Releases!',
        }),
      ),
      yield put({
        type: ALL_RELEASES_FAILURE,
        error,
      }),
    ];
  }
}

function* getRelease(payload) {
  try {
    const release = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${projecttoolEndpoint}release?join-true&release_uuid=${payload.release_uuid}`,
    );
    yield put({ type: GET_RELEASE_SUCCESS, data: release.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch Release!',
        }),
      ),
      yield put({
        type: GET_RELEASE_FAILURE,
        error,
      }),
    ];
  }
}

function* addRelease(action) {
  const { payload } = action;
  try {
    const release = yield call(
      httpService.makeRequest,
      'post',
      `${window.env.API_URL}${projecttoolEndpoint}release?join=true`,
      payload,
    );

    yield [
      yield put({ type: ADD_RELEASE_SUCCESS, data: release.data }),
      yield put(
        showAlert({
          type: 'success',
          open: true,
          message: 'Successfully Added Release',
        }),
      ),
    ];
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t add Release due to some error!',
        }),
      ),
      yield put({
        type: ADD_RELEASE_FAILURE,
        error,
      }),
    ];
  }
}

function* updateRelease(action) {
  const { payload } = action;
  try {
    const release = yield call(
      httpService.makeRequest,
      'patch',
      `${window.env.API_URL}${projecttoolEndpoint}release/${payload.release_uuid}?join=true`,
      payload,
    );

    yield [
      yield put({ type: UPDATE_RELEASE_SUCCESS, data: release.data }),
      yield put(
        showAlert({
          type: 'success',
          open: true,
          message: 'Successfully Edited Release',
        }),
      ),
    ];
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t edit Release due to some error!',
        }),
      ),
      yield put({
        type: UPDATE_RELEASE_FAILURE,
        error,
      }),
    ];
  }
}

function* deleteRelease(payload) {
  try {
    yield call(
      httpService.makeRequest,
      'delete',
      `${window.env.API_URL}${projecttoolEndpoint}release/${payload.release_uuid}?join=true`,
    );
    yield [
      yield put({ type: DELETE_RELEASE_SUCCESS, release_uuid: payload.release_uuid }),
      yield put(
        showAlert({
          type: 'success',
          open: true,
          message: 'Release deleted successfully!',
        }),
      ),
    ];
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Error in deleting release!',
        }),
      ),
      yield put({
        type: DELETE_RELEASE_FAILURE,
        error,
      }),
    ];
  }
}

// Watchers
function* watchGetAllReleases() {
  yield takeLatest(ALL_RELEASES, allReleases);
}

function* watchGetRelease() {
  yield takeLatest(GET_RELEASE, getRelease);
}

function* watchAddRelease() {
  yield takeLatest(ADD_RELEASE, addRelease);
}

function* watchUpdateRelease() {
  yield takeLatest(UPDATE_RELEASE, updateRelease);
}

function* watchDeleteRelease() {
  yield takeLatest(DELETE_RELEASE, deleteRelease);
}


export default function* projectSaga() {
  yield all([
    watchGetAllReleases(),
    watchGetRelease(),
    watchAddRelease(),
    watchUpdateRelease(),
    watchDeleteRelease(),
  ]);
}
