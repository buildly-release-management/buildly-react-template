// react library imports
import { combineReducers } from 'redux';
import crudDataReducer from '@modules/crud/redux/crud.reducer';
import alertReducer from './alert/reducers/alert.reducer';
import authReducer from './authuser/reducers/authuser.reducer';
import coregroupReducer from './coregroup/reducers/coregroup.reducer';
import coreuserReducer from './coreuser/coreuser.reducer';
import dashboardReducer from './dashboard/reducers/dashboard.reducer';
import googleSheetReducer from './googleSheet/reducers/googleSheet.reducer';
import productReducer from './product/reducers/product.reducer';
import decisionReducer from './decision/reducers/decision.reducer';
import { LOGOUT_SUCCESS } from './authuser/actions/authuser.actions';

const appReducer = combineReducers({
  alertReducer,
  authReducer,
  coregroupReducer,
  coreuserReducer,
  crudDataReducer,
  dashboardReducer,
  googleSheetReducer,
  productReducer,
  decisionReducer,
});

const rootReducer = (state, action) => {
  if (action.type === LOGOUT_SUCCESS) {
    // eslint-disable-next-line no-param-reassign
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
