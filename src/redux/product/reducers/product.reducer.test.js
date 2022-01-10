import * as actions from '../actions/product.actions';
import * as reducer from './product.reducer';

const initialState = {
  loading: false,
  loaded: false,
  error: null,
  credentials: [],
  productTeams: [],
  products: [],
  releases: [],
  thirdPartyTools: [],
  productFormData: null,
};

describe('Save Product Form reducer', () => {
  it('should save product form data', () => {
    const formData = { name: 'Test' };
    expect(reducer.default(
      initialState,
      { type: actions.SAVE_PRODUCT_FORM_DATA, formData },
    )).toEqual({
      ...initialState,
      productFormData: formData,
    });
  });
});

describe('Get all credentials reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_CREDENTIALS },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get all credentials success reducer', () => {
    const data = [{
      credential_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    }];

    expect(reducer.default(
      initialState,
      { type: actions.ALL_CREDENTIALS_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      credentials: data,
    });
  });

  it('get all credentials fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_CREDENTIALS_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get credential reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_CREDENTIAL },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get credential success reducer', () => {
    const data = {
      credential_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.GET_CREDENTIAL_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      credentials: [data],
    });
  });

  it('get credential fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_CREDENTIAL_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get all product teams reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_PRODUCT_TEAMS },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get all product teams success reducer', () => {
    const data = [{
      product_team_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    }];

    expect(reducer.default(
      initialState,
      { type: actions.ALL_PRODUCT_TEAMS_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      productTeams: data,
    });
  });

  it('get all product teams fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_PRODUCT_TEAMS_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get product team reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_PRODUCT_TEAM },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get product team success reducer', () => {
    const data = {
      product_team_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.GET_PRODUCT_TEAM_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      productTeams: [data],
    });
  });

  it('get product team fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_PRODUCT_TEAM_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get all products reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_PRODUCTS },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get all products success reducer', () => {
    const data = [{
      product_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    }];

    expect(reducer.default(
      initialState,
      { type: actions.ALL_PRODUCTS_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      products: data,
    });
  });

  it('get all products fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_PRODUCTS_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get product reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_PRODUCT },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get product success reducer', () => {
    const data = {
      product_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.GET_PRODUCT_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      products: [data],
    });
  });

  it('get product fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_PRODUCT_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
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

describe('Get release reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_RELEASE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get release success reducer', () => {
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

  it('get release fail reducer', () => {
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

describe('Get all third party tools reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_THIRD_PARTY_TOOLS },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get all third party tools success reducer', () => {
    const data = [{
      third_party_tool_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    }];

    expect(reducer.default(
      initialState,
      { type: actions.ALL_THIRD_PARTY_TOOLS_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      thirdPartyTools: data,
    });
  });

  it('get all third party tools fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_THIRD_PARTY_TOOLS_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get third party tool reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_THIRD_PARTY_TOOL },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get third party tool success reducer', () => {
    const data = {
      third_party_tool_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.GET_THIRD_PARTY_TOOL_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      thirdPartyTools: [data],
    });
  });

  it('get third party tool fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_THIRD_PARTY_TOOL_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});
