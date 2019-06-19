import { put, takeLatest, all, call } from 'redux-saga/effects';
import { httpService } from '../../../modules/http/http.service';
import { environment } from 'environment';

import {
    CRUD_CREATE,
    CRUD_CREATE_COMMIT, CRUD_CREATE_FAIL,
    CRUD_DELETE,
    CRUD_DELETE_COMMIT,
    CRUD_DELETE_FAIL,
    CRUD_LOAD_DATA,
    CRUD_LOAD_DATA_COMMIT,
    CRUD_LOAD_DATA_FAIL, CRUD_UPDATE, CRUD_UPDATE_COMMIT, CRUD_UPDATE_FAIL
} from "midgard/modules/crud/redux/crud.actions";

/**
 * this is here to handle asynchronous actions and will be triggered when CRUD_LOAD_DATA action is dispatched
 * @param {Observable} action - the current action
 */
function* crudLoadDataSaga(action) {
    try {
        const res = yield call(httpService.makeRequest, 'get', `${environment.API_URL}${action.endpoint}`, {}, true);
        yield [
            yield put({ type: CRUD_LOAD_DATA_COMMIT, data: res.data, endpoint: action.endpoint, idProp: action.idProp, dataProp:action.dataProp })
        ];
    } catch(error) {
        yield put({ type: CRUD_LOAD_DATA_FAIL,error });
    }
}

function* crudDeleteDataSaga(action) {
    try {
        const res =yield call(httpService.makeRequest, 'delete', `${environment.API_URL}${action.endpoint}${action.data[ action.idProp]}/`, {}, true);
        yield [
            yield put({ type: CRUD_DELETE_COMMIT, data: res.data? res.data:action.data, endpoint: action.endpoint, idProp: action.idProp, dataProp:action.dataProp })
        ];
    } catch(error) {
        yield put({ type: CRUD_DELETE_FAIL,error });
    }
}

function* crudUpdateDataSaga(action) {
    try {
        const res =yield call(httpService.makeRequest, 'PATCH', `${environment.API_URL}${action.endpoint}${action.data[ action.idProp]}/`, action.data, true);
        yield [
            yield put({ type: CRUD_UPDATE_COMMIT, data: res.data? res.data:action.data, endpoint: action.endpoint, idProp: action.idProp, dataProp:action.dataProp })
        ];
    } catch(error) {
        yield put({ type: CRUD_UPDATE_FAIL,error });
    }
}
function* crudCreateDataSaga(action) {
    try {
        const res =yield call(httpService.makeRequest, 'post', `${environment.API_URL}${action.endpoint}`, action.data, true);
        yield [
            yield put({ type: CRUD_CREATE_COMMIT, data: res.data? res.data:action.data, endpoint: action.endpoint, idProp: action.idProp, dataProp:action.dataProp })
        ];
    } catch(error) {
        yield put({ type: CRUD_CREATE_FAIL,error });
    }
}

function* watchCrudCreateDataSaga() {
    yield takeLatest(CRUD_CREATE, crudCreateDataSaga)
}

function* watchCrudLoadDataSaga() {
    yield takeLatest(CRUD_LOAD_DATA, crudLoadDataSaga)
}

function* watchCrudDeleteDataSaga() {
    yield takeLatest(CRUD_DELETE, crudDeleteDataSaga)
}

function* watchCrudUpdateDataSaga() {
    yield takeLatest(CRUD_UPDATE, crudUpdateDataSaga)
}

export default function* crudSaga() {
    yield all([
        watchCrudLoadDataSaga(),
        watchCrudDeleteDataSaga(),
        watchCrudUpdateDataSaga(),
        watchCrudCreateDataSaga()
    ]);
}


