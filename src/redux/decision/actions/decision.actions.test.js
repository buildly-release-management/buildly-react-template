import * as actions from './decision.actions';

// Test Get All Decisions
describe('Get All Decisions action', () => {
  it('should create an action to get all decisions', () => {
    const expectedAction = { type: actions.ALL_DECISIONS };
    expect(actions.getAllDecisions()).toEqual(expectedAction);
  });
});

// Test Get Decision
describe('Get Decision action', () => {
  it('should create an action to get decision', () => {
    const decision_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.GET_DECISION,
      decision_uuid,
    };

    expect(actions.getDecision(decision_uuid))
      .toEqual(expectedAction);
  });
});

// Test Get All Features
describe('Get All Features action', () => {
  it('should create an action to get all features', () => {
    const expectedAction = { type: actions.ALL_FEATURES };
    expect(actions.getAllFeatures()).toEqual(expectedAction);
  });
});

// Test Get Feature
describe('Get Feature action', () => {
  it('should create an action to get feature', () => {
    const feature_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.GET_FEATURE,
      feature_uuid,
    };

    expect(actions.getFeature(feature_uuid)).toEqual(expectedAction);
  });
});

// Test Get All Feedbacks
describe('Get All Feedbacks action', () => {
  it('should create an action to get all feedbacks', () => {
    const expectedAction = { type: actions.ALL_FEEDBACKS };
    expect(actions.getAllFeedbacks()).toEqual(expectedAction);
  });
});

// Test Get Feedback
describe('Get Feedback action', () => {
  it('should create an action to get feedback', () => {
    const feedback_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.GET_FEEDBACK,
      feedback_uuid,
    };

    expect(actions.getFeedback(feedback_uuid))
      .toEqual(expectedAction);
  });
});

// Test Get All Issues
describe('Get All Issues action', () => {
  it('should create an action to get all issues', () => {
    const expectedAction = { type: actions.ALL_ISSUES };
    expect(actions.getAllIssues()).toEqual(expectedAction);
  });
});

// Test Get Issue
describe('Get Issue action', () => {
  it('should create an action to get issue', () => {
    const issue_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.GET_ISSUE,
      issue_uuid,
    };

    expect(actions.getIssue(issue_uuid)).toEqual(expectedAction);
  });
});

// Test Get All Statuses
describe('Get All Statuses action', () => {
  it('should create an action to get all statuses', () => {
    const expectedAction = { type: actions.ALL_STATUSES };
    expect(actions.getAllStatuses()).toEqual(expectedAction);
  });
});

// Test Get Status
describe('Get Status action', () => {
  it('should create an action to get status', () => {
    const status_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.GET_STATUS,
      status_uuid,
    };

    expect(actions.getStatus(status_uuid)).toEqual(expectedAction);
  });
});
