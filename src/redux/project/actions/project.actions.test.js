import * as actions from './project.actions';

// Test Get All Credentials
describe('Get All Credentials action', () => {
  it('should create an action to get all credentials', () => {
    const expectedAction = { type: actions.ALL_CREDENTIALS };
    expect(actions.getAllCredentials()).toEqual(expectedAction);
  });
});

// Test Get Credential
describe('Get Credential action', () => {
  it('should create an action to get credential', () => {
    const credential_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.GET_CREDENTIAL,
      credential_uuid,
    };

    expect(actions.getCredential(credential_uuid))
      .toEqual(expectedAction);
  });
});

// Test Get All Product Teams
describe('Get All Product Teams action', () => {
  it('should create an action to get all product teams', () => {
    const expectedAction = { type: actions.ALL_PRODUCT_TEAMS };
    expect(actions.getAllProductTeams()).toEqual(expectedAction);
  });
});

// Test Get Product Team
describe('Get Product Team action', () => {
  it('should create an action to get product team', () => {
    const product_team_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.GET_PRODUCT_TEAM,
      product_team_uuid,
    };

    expect(actions.getProductTeam(product_team_uuid))
      .toEqual(expectedAction);
  });
});

// Test Get All Products
describe('Get All Products action', () => {
  it('should create an action to get all products', () => {
    const expectedAction = { type: actions.ALL_PRODUCTS };
    expect(actions.getAllProducts()).toEqual(expectedAction);
  });
});

// Test Get Product
describe('Get Product action', () => {
  it('should create an action to get product', () => {
    const product_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.GET_PRODUCT,
      product_uuid,
    };

    expect(actions.getProduct(product_uuid)).toEqual(expectedAction);
  });
});

// Test Get All Releases
describe('Get All Releases action', () => {
  it('should create an action to get all releases', () => {
    const expectedAction = { type: actions.ALL_RELEASES };
    expect(actions.getAllReleases(action)).toEqual(expectedAction);
  });
});

// Test Get Release
describe('Get Release action', () => {
  it('should create an action to get release', () => {
    const release_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.GET_RELEASE,
      release_uuid,
    };

    expect(actions.getRelease(release_uuid)).toEqual(expectedAction);
  });
});

// Test Get All Third Party Tools
describe('Get All Third Party Tools action', () => {
  it('should create an action to get all third party tools', () => {
    const expectedAction = { type: actions.ALL_THIRD_PARTY_TOOLS };
    expect(actions.getAllThirdPartyTools()).toEqual(expectedAction);
  });
});

// Test Get Third Party Tool
describe('Get Third Party Tool action', () => {
  it('should create an action to get third party tool', () => {
    const third_party_tool_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.GET_THIRD_PARTY_TOOL,
      third_party_tool_uuid,
    };

    expect(actions.getThirdPartyTool(third_party_tool_uuid))
      .toEqual(expectedAction);
  });
});
