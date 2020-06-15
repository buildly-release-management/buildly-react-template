import {
  ADD_CUSTODIANS,
  ADD_CUSTODIANS_SUCCESS,
  ADD_CUSTODIANS_FAILURE,
  GET_CUSTODIANS,
  GET_CUSTODIANS_FAILURE,
  GET_CUSTODIANS_SUCCESS,
  EDIT_CUSTODIANS,
  EDIT_CUSTODIANS_SUCCESS,
  EDIT_CUSTODIANS_FAILURE,
  DELETE_CUSTODIANS,
  DELETE_CUSTODIANS_FAILURE,
  DELETE_CUSTODIANS_SUCCESS,
  SEARCH,
  SEARCH_SUCCESS,
  searchCustodianSuccess,
  GET_CUSTODIAN_TYPE_SUCCESS,
  GET_CUSTODIAN_TYPE_FAILURE,
  GET_CUSTODIAN_TYPE,
  GET_CONTACT,
  GET_CONTACT_SUCCESS,
  GET_CONTACT_FAILURE,
  getContact,
  getCustodians,
} from "../actions/custodian.actions";
import { put, takeLatest, all, call } from "redux-saga/effects";
import { oauthService } from "../../../modules/oauth/oauth.service";
import { httpService } from "../../../modules/http/http.service";
import { environment } from "environment";
import { routes } from "../../../routes/routesConstants";
import { showAlert } from "../../alert/actions/alert.actions";

const custodainEnvironment = window.environment || {
  API_URL: "http://localhost:8083/",
  OAUTH_CLIENT_ID: "wkXLlC9h3k0jxIx7oLllxpFVU89Dxgi7O8FYZyfX",
  OAUTH_TOKEN_URL: "http://localhost:8080/oauth/token/",
  production: false,
};

function* getCustodiansList() {
  try {
    const data = yield call(
      httpService.makeRequest,
      "get",
      `${custodainEnvironment.API_URL}custodian/`,
      null,
      true
    );
    yield [yield put({ type: GET_CUSTODIANS_SUCCESS, data: data.data })];
  } catch (error) {
    console.log("error", error);
    yield [
      yield put(
        showAlert({
          type: "error",
          open: true,
          message: "Couldn't load data due to some error!",
        })
      ),
      yield put({
        type: GET_CUSTODIANS_FAILURE,
        error: error,
      }),
    ];
  }
}

function* getCustodianType() {
  try {
    const data = yield call(
      httpService.makeRequest,
      "get",
      `${custodainEnvironment.API_URL}custodian_type/`,
      null,
      true
    );
    yield [
      yield put({
        type: GET_CUSTODIAN_TYPE_SUCCESS,
        data: data.data,
      }),
    ];
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: "error",
          open: true,
          message: "Couldn't load data due to some error!",
        })
      ),
      yield put({
        type: GET_CUSTODIAN_TYPE_FAILURE,
        error: error,
      }),
    ];
  }
}

function* deleteCustodian(payload) {
  let { custodianId, contactObjId } = payload;
  try {
    yield call(
      httpService.makeRequest,
      "delete",
      `${custodainEnvironment.API_URL}custodian/${custodianId}/`,
      null,
      true
    );
    yield call(
      httpService.makeRequest,
      "delete",
      `${custodainEnvironment.API_URL}contact/${contactObjId}/`,
      null,
      true
    );
    yield [
      yield put(
        showAlert({
          type: "success",
          open: true,
          message: "Custodian deleted successfully!",
        })
      ),
      yield put(getCustodians()),
    ];
  } catch (error) {
    console.log("error", error);
    yield [
      yield put(
        showAlert({
          type: "error",
          open: true,
          message: "Error in deleting CUstodian!",
        })
      ),
      yield put({
        type: DELETE_CUSTODIANS_FAILURE,
        error: error,
      }),
    ];
  }
}

function* editCustodian(action) {
  let { payload, history } = action;
  try {
    let contactData = yield call(
      httpService.makeRequest,
      "put",
      `${custodainEnvironment.API_URL}contact/${payload.contact_obj.id}/`,
      payload.contact_obj,
      true
    );
    if (contactData && contactData.data) {
      let contactInfo = contactData.data.url;
      let custodianPayload = {
        name: payload.name,
        custodian_type: payload.custodian_type,
        contact_data: [contactInfo],
        id: payload.id,
      };
      let data = yield call(
        httpService.makeRequest,
        "put",
        `${custodainEnvironment.API_URL}custodian/${payload.id}/`,
        custodianPayload,
        true
      );
      if (data && data.data) {
        yield [
          yield put(getCustodians()),
          yield put(getContact()),
          yield put(
            showAlert({
              type: "success",
              open: true,
              message: "Custodian successfully Edited!",
            })
          ),
          yield call(history.push, routes.CUSTODIANS),
        ];
      }
    }
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: "error",
          open: true,
          message: "Couldn't edit Custodian!",
        })
      ),
      yield put({
        type: EDIT_CUSTODIANS_FAILURE,
        error: error,
      }),
    ];
  }
}

function* addCustodian(action) {
  let { history, payload } = action;
  try {
    let contactData = yield call(
      httpService.makeRequest,
      "post",
      `${custodainEnvironment.API_URL}contact/`,
      payload.contact_obj,
      true
    );
    if (contactData && contactData.data) {
      let contactInfo = contactData.data.url;
      let custodianPayload = {
        name: payload.name,
        custodian_type: payload.custodian_type,
        contact_data: [contactInfo],
      };
      let data = yield call(
        httpService.makeRequest,
        "post",
        `${custodainEnvironment.API_URL}custodian/`,
        custodianPayload,
        true
      );
      if (data && data.data) {
        yield [
          yield put(
            showAlert({
              type: "success",
              open: true,
              message: "Successfully Added Custodian",
            })
          ),
          yield put(getCustodians()),
          yield put(getContact()),
          yield call(history.push, routes.CUSTODIANS),
        ];
      }
    }
  } catch (error) {
    console.log("error", error);
    yield [
      yield put(
        showAlert({
          type: "error",
          open: true,
          message: "Error in creating custodian",
        })
      ),
      yield put({
        type: ADD_CUSTODIANS_FAILURE,
        error: error,
      }),
    ];
  }
}

function* searchCustodian(payload) {
  try {
    if (!payload.searchItem) {
      yield put({ type: SEARCH_SUCCESS, data: [] });
    } else {
      let data = payload.searchList.filter((item) => {
        return (
          item.name.includes(payload.searchItem.trim()) ||
          item.id.toString().includes(payload.searchItem)
        );
      });
      yield put({ type: SEARCH_SUCCESS, data });
    }
  } catch (error) {
    // yield put({ type: UPDATE_USER_FAIL, error: "Updating user fields failed" });
  }
}

function* getContactInfo() {
  try {
    const data = yield call(
      httpService.makeRequest,
      "get",
      `${custodainEnvironment.API_URL}contact/`,
      null,
      true
    );
    yield [yield put({ type: GET_CONTACT_SUCCESS, data: data.data })];
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: "error",
          open: true,
          message: "Couldn't load contact info!",
        })
      ),
      yield put({
        type: GET_CONTACT_FAILURE,
        error: error,
      }),
    ];
  }
}

function* watchGetCustodian() {
  yield takeLatest(GET_CUSTODIANS, getCustodiansList);
}

function* watchSearchCustodian() {
  yield takeLatest(SEARCH, searchCustodian);
}

function* watchGetCustodianType() {
  yield takeLatest(GET_CUSTODIAN_TYPE, getCustodianType);
}

function* watchAddCustodian() {
  yield takeLatest(ADD_CUSTODIANS, addCustodian);
}

function* watchDeleteCustodian() {
  yield takeLatest(DELETE_CUSTODIANS, deleteCustodian);
}

function* watchEditCustodian() {
  yield takeLatest(EDIT_CUSTODIANS, editCustodian);
}

function* watchGetContact() {
  yield takeLatest(GET_CONTACT, getContactInfo);
}

export default function* custodianSaga() {
  yield all([
    watchSearchCustodian(),
    watchGetCustodian(),
    watchGetCustodianType(),
    watchAddCustodian(),
    watchDeleteCustodian(),
    watchEditCustodian(),
    watchGetContact(),
  ]);
}
