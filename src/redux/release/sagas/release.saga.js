import _ from 'lodash';
import {
  put, takeLatest, all, call,
} from 'redux-saga/effects';
import { httpService } from '@modules/http/http.service';
import { showAlert } from '@redux/alert/actions/alert.actions';
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
import { getProduct } from '../../product/actions/product.actions';

function* getRelease(payload) {
  try {
    const release = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}release/release/${payload.release_uuid}/`,
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

function* createRelease(payload) {
  try {
    const release = yield call(
      httpService.makeRequest,
      'post',
      `${window.env.API_URL}release/release/`,
      payload.data,
    );
    yield put({ type: CREATE_RELEASE_SUCCESS, data: release.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t create Release!',
        }),
      ),
      yield put({
        type: CREATE_RELEASE_FAILURE,
        error,
      }),
    ];
  }
}

function* updateRelease(payload) {
  try {
    const release = yield call(
      httpService.makeRequest,
      'put',
      `${window.env.API_URL}release/release/${payload.data.release_uuid}/`,
      payload.data,
    );
    yield put({ type: UPDATE_RELEASE_SUCCESS, data: release.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t update Release!',
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
  const { release_uuid } = payload;
  try {
    const release = yield call(
      httpService.makeRequest,
      'delete',
      `${window.env.API_URL}release/release/${release_uuid}/`,
    );
    yield put({ type: DELETE_RELEASE_SUCCESS, release_uuid });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t delete Release!',
        }),
      ),
      yield put({
        type: DELETE_RELEASE_FAILURE,
        error,
      }),
    ];
  }
}

function* getComment(payload) {
  try {
    const comment = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}release/comment/${payload.comment_uuid}/`,
    );
    yield put({ type: GET_COMMENT_SUCCESS, data: comment.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch Comment!',
        }),
      ),
      yield put({
        type: GET_COMMENT_FAILURE,
        error,
      }),
    ];
  }
}

function* updateComment(payload) {
  try {
    const comment = yield call(
      httpService.makeRequest,
      'put',
      `${window.env.API_URL}release/comment/${payload.data.comment_uuid}/`,
      payload.data,
    );
    yield put({ type: UPDATE_COMMENT_SUCCESS, data: comment.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t update Comment!',
        }),
      ),
      yield put({
        type: UPDATE_COMMENT_FAILURE,
        error,
      }),
    ];
  }
}

function* deleteComment(payload) {
  const { comment_uuid } = payload;
  try {
    const comment = yield call(
      httpService.makeRequest,
      'delete',
      `${window.env.API_URL}release/comment/${comment_uuid}/`,
    );
    yield put({ type: DELETE_COMMENT_SUCCESS, comment_uuid });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t delete Comment!',
        }),
      ),
      yield put({
        type: DELETE_COMMENT_FAILURE,
        error,
      }),
    ];
  }
}

function* getFeature(payload) {
  try {
    const feature = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}release/feature/${payload.feature_uuid}/`,
    );
    yield put({ type: GET_FEATURE_SUCCESS, data: feature.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch Feature!',
        }),
      ),
      yield put({
        type: GET_FEATURE_FAILURE,
        error,
      }),
    ];
  }
}

function* allFeedbacks(payload) {
  try {
    const feedbacks = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}release/feedback/`,
    );
    yield put({ type: ALL_FEEDBACKS_SUCCESS, data: feedbacks.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch all Feedbacks!',
        }),
      ),
      yield put({
        type: ALL_FEEDBACKS_FAILURE,
        error,
      }),
    ];
  }
}

function* getFeedback(payload) {
  try {
    const feedback = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}release/feedback/${payload.feedback_uuid}/`,
    );
    yield put({ type: GET_FEEDBACK_SUCCESS, data: feedback.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch Feedback!',
        }),
      ),
      yield put({
        type: GET_FEEDBACK_FAILURE,
        error,
      }),
    ];
  }
}

function* createFeedback(payload) {
  try {
    const feedback = yield call(
      httpService.makeRequest,
      'post',
      `${window.env.API_URL}release/feedback/`,
      payload.data,
    );
    yield put({ type: CREATE_FEEDBACK_SUCCESS, data: feedback.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t create Feedback!',
        }),
      ),
      yield put({
        type: CREATE_FEEDBACK_FAILURE,
        error,
      }),
    ];
  }
}

function* updateFeedback(payload) {
  try {
    const feedback = yield call(
      httpService.makeRequest,
      'put',
      `${window.env.API_URL}release/feedback/${payload.data.feedback_uuid}/`,
      payload.data,
    );
    yield put({ type: UPDATE_FEEDBACK_SUCCESS, data: feedback.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t update Feedback!',
        }),
      ),
      yield put({
        type: UPDATE_FEEDBACK_FAILURE,
        error,
      }),
    ];
  }
}

function* deleteFeedback(payload) {
  const { feedback_uuid } = payload;
  try {
    const feedback = yield call(
      httpService.makeRequest,
      'delete',
      `${window.env.API_URL}release/feedback/${feedback_uuid}/`,
    );
    yield put({ type: DELETE_FEEDBACK_SUCCESS, feedback_uuid });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t delete Feedback!',
        }),
      ),
      yield put({
        type: DELETE_FEEDBACK_FAILURE,
        error,
      }),
    ];
  }
}

function* getIssue(payload) {
  try {
    const issue = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}release/issue/${payload.issue_uuid}/`,
    );
    yield put({ type: GET_ISSUE_SUCCESS, data: issue.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch Issue!',
        }),
      ),
      yield put({
        type: GET_ISSUE_FAILURE,
        error,
      }),
    ];
  }
}

function* getStatus(payload) {
  try {
    const status = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}release/status/${payload.status_uuid}/`,
    );
    yield put({ type: GET_STATUS_SUCCESS, data: status.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch Status!',
        }),
      ),
      yield put({
        type: GET_STATUS_FAILURE,
        error,
      }),
    ];
  }
}

function* updateStatus(payload) {
  try {
    const status = yield call(
      httpService.makeRequest,
      'put',
      `${window.env.API_URL}release/status/${payload.data.status_uuid}/`,
      payload.data,
    );
    yield put({ type: UPDATE_STATUS_SUCCESS, data: status.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t update Status!',
        }),
      ),
      yield put({
        type: UPDATE_STATUS_FAILURE,
        error,
      }),
    ];
  }
}

function* deleteStatus(payload) {
  const { status_uuid } = payload;
  try {
    const status = yield call(
      httpService.makeRequest,
      'delete',
      `${window.env.API_URL}release/status/${status_uuid}/`,
    );
    yield put({ type: DELETE_STATUS_SUCCESS, status_uuid });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t delete Status!',
        }),
      ),
      yield put({
        type: DELETE_STATUS_FAILURE,
        error,
      }),
    ];
  }
}

// Watchers
function* watchGetRelease() {
  yield takeLatest(GET_RELEASE, getRelease);
}

function* watchCreateRelease() {
  yield takeLatest(CREATE_RELEASE, createRelease);
}

function* watchUpdateRelease() {
  yield takeLatest(UPDATE_RELEASE, updateRelease);
}

function* watchDeleteRelease() {
  yield takeLatest(DELETE_RELEASE, deleteRelease);
}

function* watchGetComment() {
  yield takeLatest(GET_COMMENT, getComment);
}

function* watchUpdateComment() {
  yield takeLatest(UPDATE_COMMENT, updateComment);
}

function* watchDeleteComment() {
  yield takeLatest(DELETE_COMMENT, deleteComment);
}

function* watchGetFeature() {
  yield takeLatest(GET_FEATURE, getFeature);
}

function* watchGetAllFeedbacks() {
  yield takeLatest(ALL_FEEDBACKS, allFeedbacks);
}

function* watchGetFeedback() {
  yield takeLatest(GET_FEEDBACK, getFeedback);
}

function* watchCreateFeedback() {
  yield takeLatest(CREATE_FEEDBACK, createFeedback);
}

function* watchUpdateFeedback() {
  yield takeLatest(UPDATE_FEEDBACK, updateFeedback);
}

function* watchDeleteFeedback() {
  yield takeLatest(DELETE_FEEDBACK, deleteFeedback);
}

function* watchGetIssue() {
  yield takeLatest(GET_ISSUE, getIssue);
}

function* watchGetStatus() {
  yield takeLatest(GET_STATUS, getStatus);
}

function* watchUpdateStatus() {
  yield takeLatest(UPDATE_STATUS, updateStatus);
}

function* watchDeleteStatus() {
  yield takeLatest(DELETE_STATUS, deleteStatus);
}

export default function* releaseSaga() {
  yield all([
    watchGetAllFeedbacks(),
    watchGetRelease(),
    watchGetComment(),
    watchGetFeature(),
    watchGetFeedback(),
    watchGetIssue(),
    watchGetStatus(),
    watchCreateRelease(),
    watchCreateFeedback(),
    watchUpdateRelease(),
    watchUpdateComment(),
    watchUpdateFeedback(),
    watchUpdateStatus(),
    watchDeleteRelease(),
    watchDeleteComment(),
    watchDeleteFeedback(),
    watchDeleteStatus(),
  ]);
}
