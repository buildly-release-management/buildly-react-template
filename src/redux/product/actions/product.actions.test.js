import * as actions from './product.actions';

// Test Get All Credentials
describe('Get All Credentials action', () => {
  it('should create an action to get all credentials', () => {
    const product_uuid = '25682839-jshfw2-8t29we-3r28wen';
    const expectedAction = { type: actions.ALL_CREDENTIALS, product_uuid };
    expect(actions.getAllCredentials(product_uuid)).toEqual(expectedAction);
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

// Test Create Credential
describe('Create Credential action', () => {
  it('should create an action to create credential', () => {
    const data = { name: 'Test Credential' };
    const expectedAction = {
      type: actions.CREATE_CREDENTIAL,
      data,
    };

    expect(actions.createCredential(data))
      .toEqual(expectedAction);
  });
});

// Test Update Credential
describe('Update Credential action', () => {
  it('should create an action to update credential', () => {
    const data = { name: 'Test Credential Edited' };
    const expectedAction = {
      type: actions.UPDATE_CREDENTIAL,
      data,
    };

    expect(actions.updateCredential(data))
      .toEqual(expectedAction);
  });
});

// Test Delete Credential
describe('Delete Credential action', () => {
  it('should create an action to delete credential', () => {
    const credential_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.DELETE_CREDENTIAL,
      credential_uuid,
    };

    expect(actions.deleteCredential(credential_uuid))
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
    const productteam_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.GET_PRODUCT_TEAM,
      productteam_uuid,
    };

    expect(actions.getProductTeam(productteam_uuid))
      .toEqual(expectedAction);
  });
});

// Test Create Product Team
describe('Create Product Team action', () => {
  it('should create an action to create product team', () => {
    const data = { name: 'Test' };
    const expectedAction = {
      type: actions.CREATE_PRODUCT_TEAM,
      data,
    };

    expect(actions.createProductTeam(data))
      .toEqual(expectedAction);
  });
});

// Test Update Product Team
describe('Update Product Team action', () => {
  it('should create an action to update product team', () => {
    const data = { name: 'Test Edited' };
    const expectedAction = {
      type: actions.CREATE_PRODUCT_TEAM,
      data,
    };

    expect(actions.createProductTeam(data))
      .toEqual(expectedAction);
  });
});

// Test Delete Product Team
describe('Delete Product Team action', () => {
  it('should create an action to delete product team', () => {
    const productteam_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.DELETE_PRODUCT_TEAM,
      productteam_uuid,
    };

    expect(actions.deleteProductTeam(productteam_uuid))
      .toEqual(expectedAction);
  });
});

// Test Get All Products
describe('Get All Products action', () => {
  it('should create an action to get all products', () => {
    const organization_uuid = '27541748-3871-138ryweh-328tywef';
    const expectedAction = { type: actions.ALL_PRODUCTS, organization_uuid };
    expect(actions.getAllProducts(organization_uuid)).toEqual(expectedAction);
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

// Test Create Product
describe('Create Product action', () => {
  it('should create an action to create product', () => {
    const data = { name: 'Test Product' };
    const history = {};
    const expectedAction = {
      type: actions.CREATE_PRODUCT,
      data,
      history,
    };

    expect(actions.createProduct(data, history)).toEqual(expectedAction);
  });
});

// Test Update Product
describe('Update Product action', () => {
  it('should create an action to update product', () => {
    const data = { name: 'Test Product Edited' };
    const expectedAction = {
      type: actions.UPDATE_PRODUCT,
      data,
    };

    expect(actions.updateProduct(data)).toEqual(expectedAction);
  });
});

// Test Delete Product
describe('Delete Product action', () => {
  it('should create an action to delete product', () => {
    const product_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.DELETE_PRODUCT,
      product_uuid,
    };

    expect(actions.deleteProduct(product_uuid))
      .toEqual(expectedAction);
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
    const thirdpartytool_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.GET_THIRD_PARTY_TOOL,
      thirdpartytool_uuid,
    };

    expect(actions.getThirdPartyTool(thirdpartytool_uuid))
      .toEqual(expectedAction);
  });
});

// Test Create Third Party Tool
describe('Create Third Party Tool action', () => {
  it('should create an action to create third party tool', () => {
    const data = { name: 'Test' };
    const expectedAction = {
      type: actions.CREATE_THIRD_PARTY_TOOL,
      data,
    };

    expect(actions.createThirdPartyTool(data))
      .toEqual(expectedAction);
  });
});

// Test Update Third Party Tool
describe('Update Third Party Tool action', () => {
  it('should create an action to update third party tool', () => {
    const data = { name: 'Test Edited' };
    const expectedAction = {
      type: actions.UPDATE_THIRD_PARTY_TOOL,
      data,
    };

    expect(actions.updateThirdPartyTool(data))
      .toEqual(expectedAction);
  });
});

// Test Delete Third Party Tool
describe('Delete Third Party Tool action', () => {
  it('should create an action to delete third party tool', () => {
    const thirdpartytool_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.DELETE_THIRD_PARTY_TOOL,
      thirdpartytool_uuid,
    };

    expect(actions.deleteThirdPartyTool(thirdpartytool_uuid))
      .toEqual(expectedAction);
  });
});

// Test Get Board
describe('Get Board action', () => {
  it('should create an action to get board', () => {
    const product_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.GET_BOARD,
      product_uuid,
    };

    expect(actions.getBoard(product_uuid))
      .toEqual(expectedAction);
  });
});

// Test Create Credential
describe('Create Board action', () => {
  it('should create an action to create board', () => {
    const data = { name: 'Test Board' };
    const statusData = [];
    const expectedAction = {
      type: actions.CREATE_BOARD,
      data,
      statusData,
    };

    expect(actions.createBoard(data, statusData)).toEqual(expectedAction);
  });
});

// Test Validate Credential
describe('Validate Credential action', () => {
  it('should create an action to validate credential', () => {
    const data = { name: 'Test Validate Credential' };
    const expectedAction = {
      type: actions.VALIDATE_CREDENTIAL,
      data,
    };

    expect(actions.validateCredential(data))
      .toEqual(expectedAction);
  });
});

// Test Add DOC Identifier action
describe('Add Doc Identifier action', () => {
  it('should create an action to add Doc identifier', () => {
    const data = { file: 'test.pdf' };
    const formData = {};
    const expectedAction = {
      type: actions.ADD_PDF_IDENTIFIER,
      data,
      formData,
    };
    expect(actions.docIdentifier(
      data, formData,
    )).toEqual(expectedAction);
  });
});
