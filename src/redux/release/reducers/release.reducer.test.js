import * as actions from '../actions/release.actions';
import * as reducer from './release.reducer';

const initialState = {
  loading: false,
  loaded: false,
  error: null,
  issue: null,
};

describe('Get issue reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_ISSUES },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get issue success reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_ISSUES_SUCCESS },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      issue: undefined,
    });
  });

  it('get issue fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_ISSUES_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});

describe('Add issue reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ADD_ISSUE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('add issue success reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ADD_ISSUE_SUCCESS },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      issue: undefined,
    });
  });

  it('add issue fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ADD_ISSUE_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});

describe('Update issue reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.UPDATE_ISSUE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('update issue success reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.UPDATE_ISSUE_SUCCESS },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      issue: undefined,
    });
  });

  it('update issue fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.UPDATE_ISSUE_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});

describe('Delete issue reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_ISSUE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('delete issue success reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_ISSUE_SUCCESS },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      issue: undefined,
    });
  });

  it('delete issue fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_ISSUE_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});
