import {
  put, takeLatest, all, call,
} from 'redux-saga/effects';
import { httpService } from '@modules/http/http.service';
import { showAlert } from '@redux/alert/actions/alert.actions';
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

const decisionEndpoint = 'decision/';

function* allDecisions(payload) {
  try {
    const decisions = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${decisionEndpoint}decision?join=true`,
    );
    yield put({ type: ALL_DECISIONS_SUCCESS, data: decisions.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch all Decisions!',
        }),
      ),
      yield put({
        type: ALL_DECISIONS_FAILURE,
        error,
      }),
    ];
  }
}

function* getDecision(payload) {
  try {
    const decision = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${decisionEndpoint}decision?join=true&decision_uuid=${payload.decision_uuid}`,
    );
    yield put({ type: GET_DECISION_SUCCESS, data: decision.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch Decision!',
        }),
      ),
      yield put({
        type: GET_DECISION_FAILURE,
        error,
      }),
    ];
  }
}

function* allFeatures(payload) {
  try {
    const features = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${decisionEndpoint}feature?join=true`,
    );
    yield put({ type: ALL_FEATURES_SUCCESS, data: features.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch all Features!',
        }),
      ),
      yield put({
        type: ALL_FEATURES_FAILURE,
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
      `${window.env.API_URL}${decisionEndpoint}feature?join=true&feature_uuid=${payload.feature_uuid}`,
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
      `${window.env.API_URL}${decisionEndpoint}feedback?join=true`,
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
      `${window.env.API_URL}${decisionEndpoint}feedback?join=true&feedback_uuid=${payload.feedback_uuid}`,
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

function* allIssues(payload) {
  try {
    const issues = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${decisionEndpoint}issue?join=true`,
    );
    yield put({ type: ALL_ISSUES_SUCCESS, data: issues.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch all Issues!',
        }),
      ),
      yield put({
        type: ALL_ISSUES_FAILURE,
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
      `${window.env.API_URL}${decisionEndpoint}issue?join=true&issue_uuid=${payload.issue_uuid}`,
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

function* allKanbanStatuses(payload) {
  try {
    const statuses = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${decisionEndpoint}kanbanstatus?join=true`,
    );
    yield put({ type: ALL_KANBAN_STATUSES_SUCCESS, data: statuses.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch all Kanban Statuses!',
        }),
      ),
      yield put({
        type: ALL_KANBAN_STATUSES_FAILURE,
        error,
      }),
    ];
  }
}

function* getKanbanStatus(payload) {
  try {
    const status = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${decisionEndpoint}kanbanstatus?join=true&kanban_status_uuid=${payload.kanban_status_uuid}`,
    );
    yield put({ type: GET_KANBAN_STATUS_SUCCESS, data: status.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch Kanban Status!',
        }),
      ),
      yield put({
        type: GET_KANBAN_STATUS_FAILURE,
        error,
      }),
    ];
  }
}

// Watchers
function* watchGetAllDecisions() {
  yield takeLatest(ALL_DECISIONS, allDecisions);
}

function* watchGetDecision() {
  yield takeLatest(GET_DECISION, getDecision);
}

function* watchGetAllFeatures() {
  yield takeLatest(ALL_FEATURES, allFeatures);
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

function* watchGetAllIssues() {
  yield takeLatest(ALL_ISSUES, allIssues);
}

function* watchGetIssue() {
  yield takeLatest(GET_ISSUE, getIssue);
}

function* watchGetAllKanbanStatuses() {
  yield takeLatest(ALL_KANBAN_STATUSES, allKanbanStatuses);
}

function* watchGetKanbanStatus() {
  yield takeLatest(GET_KANBAN_STATUS, getKanbanStatus);
}

export default function* projectSaga() {
  yield all([
    watchGetAllDecisions(),
    watchGetAllFeatures(),
    watchGetAllFeedbacks(),
    watchGetAllIssues(),
    watchGetAllKanbanStatuses(),
    watchGetDecision(),
    watchGetFeature(),
    watchGetFeedback(),
    watchGetIssue(),
    watchGetKanbanStatus(),
  ]);
}
