import {
  put, takeLatest, all, call,
} from 'redux-saga/effects';
import { httpService } from '@modules/http/http.service';
import { showAlert } from '@redux/alert/actions/alert.actions';
import {
  ALL_CREDENTIALS,
  ALL_CREDENTIALS_SUCCESS,
  ALL_CREDENTIALS_FAILURE,
  ALL_PRODUCT_TEAMS,
  ALL_PRODUCT_TEAMS_SUCCESS,
  ALL_PRODUCT_TEAMS_FAILURE,
  ALL_PRODUCTS,
  ALL_PRODUCTS_SUCCESS,
  ALL_PRODUCTS_FAILURE,
  ALL_RELEASES,
  ALL_RELEASES_SUCCESS,
  ALL_RELEASES_FAILURE,
  ALL_THIRD_PARTY_TOOLS,
  ALL_THIRD_PARTY_TOOLS_SUCCESS,
  ALL_THIRD_PARTY_TOOLS_FAILURE,
  GET_CREDENTIAL,
  GET_CREDENTIAL_SUCCESS,
  GET_CREDENTIAL_FAILURE,
  GET_PRODUCT_TEAM,
  GET_PRODUCT_TEAM_SUCCESS,
  GET_PRODUCT_TEAM_FAILURE,
  GET_PRODUCT,
  GET_PRODUCT_SUCCESS,
  GET_PRODUCT_FAILURE,
  GET_RELEASE,
  GET_RELEASE_SUCCESS,
  GET_RELEASE_FAILURE,
  GET_THIRD_PARTY_TOOL,
  GET_THIRD_PARTY_TOOL_SUCCESS,
  GET_THIRD_PARTY_TOOL_FAILURE,
} from '../actions/product.actions';

const productEndpoint = 'product/';

function* allCredentials(payload) {
  try {
    const creds = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${productEndpoint}credential?join=true`,
    );
    yield put({ type: ALL_CREDENTIALS_SUCCESS, data: creds.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch all Credentials!',
        }),
      ),
      yield put({
        type: ALL_CREDENTIALS_FAILURE,
        error,
      }),
    ];
  }
}

function* getCredential(payload) {
  try {
    const cred = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${productEndpoint}credential?join=true&credential_uuid=${payload.credential_uuid}`,
    );
    yield put({ type: GET_CREDENTIAL_SUCCESS, data: cred.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch Credential!',
        }),
      ),
      yield put({
        type: GET_CREDENTIAL_FAILURE,
        error,
      }),
    ];
  }
}

function* allProductTeams(payload) {
  try {
    const teams = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${productEndpoint}productteam?join=true`,
    );
    yield put({ type: ALL_PRODUCT_TEAMS_SUCCESS, data: teams.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch all Product Teams!',
        }),
      ),
      yield put({
        type: ALL_PRODUCT_TEAMS_FAILURE,
        error,
      }),
    ];
  }
}

function* getProductTeam(payload) {
  try {
    const team = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${productEndpoint}productteam?join=true&product_team_uuid=${payload.product_team_uuid}`,
    );
    yield put({ type: GET_PRODUCT_TEAM_SUCCESS, data: team.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch Product Team!',
        }),
      ),
      yield put({
        type: GET_PRODUCT_TEAM_FAILURE,
        error,
      }),
    ];
  }
}

function* allProducts(payload) {
  try {
    const products = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${productEndpoint}product?join=true`,
    );
    yield put({ type: ALL_PRODUCTS_SUCCESS, data: products.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch all Products!',
        }),
      ),
      yield put({
        type: ALL_PRODUCTS_FAILURE,
        error,
      }),
    ];
  }
}

function* getProduct(payload) {
  try {
    const product = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${productEndpoint}product?join=true&product_uuid=${payload.product_uuid}`,
    );
    yield put({ type: GET_PRODUCT_SUCCESS, data: product.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch Product!',
        }),
      ),
      yield put({
        type: GET_PRODUCT_FAILURE,
        error,
      }),
    ];
  }
}

function* allReleases(payload) {
  try {
    const releases = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${productEndpoint}release?join=true`,
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
      `${window.env.API_URL}${productEndpoint}release?join=true&release_uuid=${payload.release_uuid}`,
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

function* allThirdPartyTools(payload) {
  try {
    const tools = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${productEndpoint}thirdpartytool?join=true`,
    );
    yield put({ type: ALL_THIRD_PARTY_TOOLS_SUCCESS, data: tools.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch all Third Party Tools!',
        }),
      ),
      yield put({
        type: ALL_THIRD_PARTY_TOOLS_FAILURE,
        error,
      }),
    ];
  }
}

function* getThirdPartyTool(payload) {
  try {
    const tool = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${productEndpoint}thirdpartytool?join=true&third_party_tool_uuid=${payload.third_party_tool_uuid}`,
    );
    yield put({ type: GET_THIRD_PARTY_TOOL_SUCCESS, data: tool.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t fetch Third Party Tool!',
        }),
      ),
      yield put({
        type: GET_THIRD_PARTY_TOOL_FAILURE,
        error,
      }),
    ];
  }
}

// Watchers
function* watchGetAllCredentials() {
  yield takeLatest(ALL_CREDENTIALS, allCredentials);
}

function* watchGetCredential() {
  yield takeLatest(GET_CREDENTIAL, getCredential);
}

function* watchGetAllProductTeams() {
  yield takeLatest(ALL_PRODUCT_TEAMS, allProductTeams);
}

function* watchGetProductTeam() {
  yield takeLatest(GET_PRODUCT_TEAM, getProductTeam);
}

function* watchGetAllProducts() {
  yield takeLatest(ALL_PRODUCTS, allProducts);
}

function* watchGetProduct() {
  yield takeLatest(GET_PRODUCT, getProduct);
}

function* watchGetAllReleases() {
  yield takeLatest(ALL_RELEASES, allReleases);
}

function* watchGetRelease() {
  yield takeLatest(GET_RELEASE, getRelease);
}

function* watchGetAllThirdPartyTools() {
  yield takeLatest(ALL_THIRD_PARTY_TOOLS, allThirdPartyTools);
}

function* watchGetThirdPartyTool() {
  yield takeLatest(GET_THIRD_PARTY_TOOL, getThirdPartyTool);
}

export default function* productSaga() {
  yield all([
    watchGetAllCredentials(),
    watchGetAllProductTeams(),
    watchGetAllProducts(),
    watchGetAllReleases(),
    watchGetAllThirdPartyTools(),
    watchGetCredential(),
    watchGetProductTeam(),
    watchGetProduct(),
    watchGetRelease(),
    watchGetThirdPartyTool(),
  ]);
}
