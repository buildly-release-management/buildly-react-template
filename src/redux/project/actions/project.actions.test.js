import * as actions from './project.actions';

// Test Get All Releases
describe('Get All Releases action', () => {
  it('should create an action to get all releases', () => {
    const expectedAction = { type: actions.ALL_RELEASES };
    expect(actions.getAllReleases()).toEqual(expectedAction);
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

    expect(actions.getRelease(project_uuid, release_uuid, dev_team_uuid))
      .toEqual(expectedAction);
  });
});

// Test Add Release
describe('Add Release action', () => {
  it('should create an action to add release', () => {
    const payload = {
      release_uuid: '224761f5-0010-4a46-ba2f-d92a4fdc1d21',
      name: 'Abc',
    };
    const history = {};
    const redirectTo = '/test';

    const expectedAction = {
      type: actions.ADD_RELEASE,
      payload,
      history,
      redirectTo,
    };

    expect(actions.addRelease(payload, history, redirectTo))
      .toEqual(expectedAction);
  });
});

// Test Update Release
describe('Update Release action', () => {
  it('should create an action to update release', () => {
    const payload = {
      release_uuid: '224761f5-0010-4a46-ba2f-d92a4fdc1d21',
      name: 'Abc Edited',
    };
    const history = {};
    const redirectTo = '/test';

    const expectedAction = {
      type: actions.UPDATE_RELEASE,
      payload,
      history,
      redirectTo,
    };

    expect(actions.updateRelease(payload, history, redirectTo))
      .toEqual(expectedAction);
  });
});

// Test Delete Release
describe('Delete Release action', () => {
  it('should create an action to delete release', () => {
    const release_uuid = '224761f5-0010-4a46-ba2f-d92a4fdc1d21';

    const expectedAction = {
      type: actions.DELETE_RELEASE,
      release_uuid,
    };

    expect(actions.deleteRelease(release_uuid)).toEqual(expectedAction);
  });
});

