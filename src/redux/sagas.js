// react library imports
import { all } from 'redux-saga/effects';
import crudSaga from '@modules/crud/redux/crud.saga';
import coregroupSaga from './coregroup/sagas/coregroup.saga';
import coreuserSaga from './coreuser/coreuser.saga';
import productSaga from './product/sagas/product.saga';
import releaseSaga from './release/sagas/release.saga';
import devpartnerSaga from './devpartner/sagas/devpartner.saga';

export default function* rootSaga() {
  yield all([
    coregroupSaga(),
    coreuserSaga(),
    crudSaga(),
    productSaga(),
    releaseSaga(),
    devpartnerSaga(),
  ]);
}
