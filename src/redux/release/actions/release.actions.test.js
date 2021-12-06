import * as actions from './release.actions';

// Test Get Issues
describe('Get Issue action', () => {
  it('should create an action to get issue', () => {
    const project_uuid = '224761f5-0010-4a46-ba2f-d92a4fdc1d21';
    const expectedAction = {
      type: actions.GET_ISSUES,
      project_uuid,
    };
    expect(actions.getIssues(project_uuid))
      .toEqual(expectedAction);
  });
});

// Test Add Issue
describe('Add Issue action', () => {
  it('should create an action to add issue', () => {
    const payload = { issue_uuid: '224761f5-0010-4a46-ba2f-d92a4fdc1d21', name: 'Abc' };
    const history = {};
    const redirectTo = '/test';
    const expectedAction = {
      type: actions.ADD_ISSUE,
      payload,
      history,
      redirectTo,
    };
    expect(actions.addIssue(payload, history, redirectTo))
      .toEqual(expectedAction);
  });
});

// Test Edit Issue
describe('Edit Issue action', () => {
  it('should create an action to edit issue', () => {
    const payload = { issue_uuid: '224761f5-0010-4a46-ba2f-d92a4fdc1d21' };
    const history = {};
    const redirectTo = '/test';
    const expectedAction = {
      type: actions.UPDATE_ISSUE,
      payload,
      history,
      redirectTo,
    };
    expect(actions.updateIssue(payload, history, redirectTo))
      .toEqual(expectedAction);
  });
});

// Test Delete Issue
describe('Delete Issue action', () => {
  it('should create an action to delete issue', () => {
    const issue_uuid = '224761f5-0010-4a46-ba2f-d92a4fdc1d21';
    const expectedAction = {
      type: actions.DELETE_ISSUE,
      issue_uuid,
    };
    expect(actions.deleteIssue(
      issue_uuid,
    )).toEqual(expectedAction);
  });
});
