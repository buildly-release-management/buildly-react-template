// react library imports
import { combineReducers } from 'redux';
import crudDataReducer from '@modules/crud/redux/crud.reducer';
import alertReducer from './alert/reducers/alert.reducer';
import coregroupReducer from './coregroup/reducers/coregroup.reducer';
import coreuserReducer from './coreuser/coreuser.reducer';
import productReducer from './product/reducers/product.reducer';
import releaseReducer from './release/reducers/release.reducer';
import devpartnerReducer from './devpartner/reducers/devpartner.reducer';

const appReducer = combineReducers({
  alertReducer,
  coregroupReducer,
  coreuserReducer,
  crudDataReducer,
  productReducer,
  releaseReducer,
  devpartnerReducer,
});

const rootReducer = (state, action) => appReducer(state, action);

export default rootReducer;
