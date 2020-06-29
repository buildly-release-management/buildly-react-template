import { put, takeLatest, all, call } from "redux-saga/effects";
import { oauthService } from "../../../modules/oauth/oauth.service";
import { httpService } from "../../../modules/http/http.service";
import { environment } from "environment";
import { routes } from "../../../routes/routesConstants";
import { showAlert } from "../../alert/actions/alert.actions";
import {
  FILTER_SHIPMENT,
  ADD_SHIPMENT,
  DELETE_SHIPMENT,
  EDIT_SHIPMENT,
  GET_SHIPMENTS_SUCCESS,
  GET_SHIPMENTS_FAILURE,
  getShipmentDetails,
  ADD_SHIPMENT_FAILURE,
  EDIT_SHIPMENT_FAILURE,
  DELETE_SHIPMENT_FAILURE,
  GET_SHIPMENTS,
} from "../actions/shipment.actions";

const shipmentApiEndPoint = "shipment/";

function* getShipmentList() {
  try {
    const data = yield call(
      httpService.makeRequest,
      "get",
      `${environment.API_URL}${shipmentApiEndPoint}shipment/`,
      null,
      true
    );
    yield [yield put({ type: GET_SHIPMENTS_SUCCESS, data: data.data })];
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
        type: GET_SHIPMENTS_FAILURE,
        error: error,
      }),
    ];
  }
}

function* deleteShipment(payload) {
  let { itemId } = payload;
  try {
    yield call(
      httpService.makeRequest,
      "delete",
      `${environment.API_URL}${shipmentApiEndPoint}shipment/${itemId}/`,
      null,
      true
    );
    yield [
      yield put(
        showAlert({
          type: "success",
          open: true,
          message: "Shipment deleted successfully!",
        })
      ),
      yield put(getShipmentDetails()),
    ];
  } catch (error) {
    console.log("error", error);
    yield [
      yield put(
        showAlert({
          type: "error",
          open: true,
          message: "Error in deleting Shipment!",
        })
      ),
      yield put({
        type: DELETE_SHIPMENT_FAILURE,
        error: error,
      }),
    ];
  }
}

function* editShipment(action) {
  let { payload, history, redirectTo } = action;
  try {
    let data = yield call(
      httpService.makeRequest,
      "put",
      `${environment.API_URL}${shipmentApiEndPoint}shipment/${payload.id}/`,
      payload,
      true
    );
    yield [
      yield put(getShipmentDetails()),
      yield put(
        showAlert({
          type: "success",
          open: true,
          message: "Shipment successfully Edited!",
        })
      ),
      yield call(history.push, redirectTo),
    ];
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: "error",
          open: true,
          message: "Error in Updating Shipment!",
        })
      ),
      yield put({
        type: EDIT_SHIPMENT_FAILURE,
        error: error,
      }),
    ];
  }
}

function* addShipment(action) {
  let { history, payload, redirectTo } = action;
  try {
    let data = yield call(
      httpService.makeRequest,
      "post",
      `${environment.API_URL}${shipmentApiEndPoint}shipment/`,
      payload,
      true
    );
    yield [
      yield put(
        showAlert({
          type: "success",
          open: true,
          message: "Successfully Added Shipment",
        })
      ),
      yield put(getShipmentDetails()),
      yield call(history.push, redirectTo),
    ];
  } catch (error) {
    console.log("error", error);
    yield [
      yield put(
        showAlert({
          type: "error",
          open: true,
          message: "Error in creating Shipment",
        })
      ),
      yield put({
        type: ADD_SHIPMENT_FAILURE,
        error: error,
      }),
    ];
  }
}

function* filterShipment(payload) {
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

function* watchGetShipment() {
  yield takeLatest(GET_SHIPMENTS, getShipmentList);
}

function* watchFilterShipment() {
  yield takeLatest(FILTER_SHIPMENT, filterShipment);
}

function* watchAddShipment() {
  yield takeLatest(ADD_SHIPMENT, addShipment);
}

function* watchDeleteShipment() {
  yield takeLatest(DELETE_SHIPMENT, deleteShipment);
}

function* watchEditShipment() {
  yield takeLatest(EDIT_SHIPMENT, editShipment);
}

export default function* shipmentSaga() {
  yield all([
    watchFilterShipment(),
    watchGetShipment(),
    watchAddShipment(),
    watchDeleteShipment(),
    watchEditShipment(),
  ]);
}
