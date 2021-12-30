import * as actions from '../actions/project.actions';
import * as reducer from './project.reducer';

const initialState = {
  loading: false,
  loaded: false,
  error: null,
  releases: null,
  productFormData: null,
};

describe('Save Project Form reducer', () => {
  it('should save project form data', () => {
    const formData = { name: 'Test' };
    expect(reducer.default(
      initialState,
      { type: actions.SAVE_PRODUCT_FORM_DATA, formData },
    )).toEqual({
      ...initialState,
      saveProductFormData: formData,
    });
  });
});

describe('Get all releases reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_RELEASES },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get all releases success reducer', () => {
    const data = [{
      release_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    }];

    expect(reducer.default(
      initialState,
      { type: actions.ALL_RELEASES_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      releases: data,
    });
  });

  it('get all releases fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_RELEASES_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get a release reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_RELEASE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get a release success reducer', () => {
    const data = {
      release_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.GET_RELEASE_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      releases: [data],
    });
  });

  it('get a release fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_RELEASE_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Add release reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ADD_RELEASE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('add release success reducer', () => {
    const data = {
      release_uuid: 'kfhwue-y38wgws-3i2wfhv-t83492',
      name: 'New Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.ADD_RELEASE_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      releases: [data],
    });
  });

  it('add release fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ADD_RELEASE_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Update release reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.UPDATE_RELEASE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('update release success reducer', () => {
    const data = {
      release_uuid: 'kfhwue-y38wgws-3i2wfhv-t83492',
      name: 'New Test',
    };

    const editedData = {
      release_uuid: 'kfhwue-y38wgws-3i2wfhv-t83492',
      name: 'New Test Edited',
    };

    expect(reducer.default(
      { ...initialState, releases: [data] },
      { type: actions.UPDATE_RELEASE_SUCCESS, data: editedData },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      releases: [editedData],
    });
  });

  it('update release fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.UPDATE_RELEASE_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Delete release reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_RELEASE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('delete release success reducer', () => {
    const data = {
      release_uuid: 'kfhwue-y38wgws-3i2wfhv-t83492',
      name: 'New Test',
    };
    const release_uuid = 'kfhwue-y38wgws-3i2wfhv-t83492';

    expect(reducer.default(
      { ...initialState, releases: [data] },
      { type: actions.DELETE_RELEASE_SUCCESS, release_uuid },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      releases: [],
    });
  });

  it('delete release fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_RELEASE_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});
