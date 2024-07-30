import * as actions from '../actions/product.actions';
import * as reducer from './product.reducer';

const initialState = {
  loading: false,
  loaded: false,
  error: null,
  credentials: [],
  productTeams: [],
  products: [],
  thirdPartyTools: [],
  boards: {},
  productFormData: null,
  featureCredValid: false,
  issueCredValid: false,
};

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

describe('Create credential reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.CREATE_CREDENTIAL },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('create credential success reducer', () => {
    const data = {
      credential_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.CREATE_CREDENTIAL_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      credentials: [data],
    });
  });

  it('create credential fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.CREATE_CREDENTIAL_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Update credential reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.UPDATE_CREDENTIAL },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('update credential success reducer', () => {
    const data = {
      credential_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };
    const editedData = {
      credential_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test Edited',
    };

    expect(reducer.default(
      { ...initialState, credentials: [data] },
      { type: actions.UPDATE_CREDENTIAL_SUCCESS, data: editedData },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      credentials: [editedData],
    });
  });

  it('update credential fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.UPDATE_CREDENTIAL_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Delete credential reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_CREDENTIAL },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('delete credential success reducer', () => {
    const data = {
      credential_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      { ...initialState, credentials: [data] },
      { type: actions.DELETE_CREDENTIAL_SUCCESS, credential_uuid: data.credential_uuid },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      credentials: [],
    });
  });

  it('delete credential fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_CREDENTIAL_FAILURE },
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
      productteam_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
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
      productteam_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
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

describe('Create product team reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.CREATE_PRODUCT_TEAM },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('create product team success reducer', () => {
    const data = {
      productteam_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.CREATE_PRODUCT_TEAM_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      productTeams: [data],
    });
  });

  it('create product team fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.CREATE_PRODUCT_TEAM_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Update product team reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.UPDATE_PRODUCT_TEAM },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('update product team success reducer', () => {
    const data = {
      productteam_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };
    const editedData = {
      productteam_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test Edited',
    };

    expect(reducer.default(
      { ...initialState, productTeams: [data] },
      { type: actions.UPDATE_PRODUCT_TEAM_SUCCESS, data: editedData },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      productTeams: [editedData],
    });
  });

  it('update product team fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.UPDATE_PRODUCT_TEAM_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Delete product team reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_PRODUCT_TEAM },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('delete product team success reducer', () => {
    const data = {
      productteam_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      { ...initialState, productTeams: [data] },
      { type: actions.DELETE_PRODUCT_TEAM_SUCCESS, productteam_uuid: data.productteam_uuid },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      productTeams: [],
    });
  });

  it('delete product team fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_PRODUCT_TEAM_FAILURE },
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
      thirdpartytool_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
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

describe('Create thirdPartyTool reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.CREATE_THIRD_PARTY_TOOL },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('create thirdPartyTool success reducer', () => {
    const data = {
      thirdpartytool_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.CREATE_THIRD_PARTY_TOOL_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      thirdPartyTools: [data],
    });
  });

  it('create thirdPartyTool fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.CREATE_THIRD_PARTY_TOOL_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Update thirdPartyTool reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.UPDATE_THIRD_PARTY_TOOL },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('update thirdPartyTool success reducer', () => {
    const data = {
      thirdpartytool_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };
    const editedData = {
      thirdpartytool_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test Edited',
    };

    expect(reducer.default(
      { ...initialState, thirdPartyTools: [data] },
      { type: actions.UPDATE_THIRD_PARTY_TOOL_SUCCESS, data: editedData },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      thirdPartyTools: [editedData],
    });
  });

  it('update thirdPartyTool fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.UPDATE_THIRD_PARTY_TOOL_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Delete thirdPartyTool reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_THIRD_PARTY_TOOL },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('delete thirdPartyTool success reducer', () => {
    const data = {
      thirdpartytool_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      { ...initialState, thirdPartyTools: [data] },
      {
        type: actions.DELETE_THIRD_PARTY_TOOL_SUCCESS,
        thirdpartytool_uuid: data.thirdpartytool_uuid,
      },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      thirdPartyTools: [],
    });
  });

  it('delete thirdPartyTool fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_THIRD_PARTY_TOOL_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get board reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_BOARD },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get board success reducer', () => {
    const data = {
      product_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.GET_BOARD_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      boards: data,
    });
  });

  it('get board fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_BOARD_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Create board reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.CREATE_BOARD },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('create product success reducer', () => {
    const data = {
      product_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.CREATE_BOARD_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      boards: data,
    });
  });

  it('create board fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.CREATE_BOARD_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});
