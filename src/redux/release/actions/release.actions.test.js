import * as actions from './release.actions';

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

// Test Create Release
describe('Create Release action', () => {
  it('should create an action to create release', () => {
    const data = { name: 'Test Release' };
    const expectedAction = {
      type: actions.CREATE_RELEASE,
      data,
    };

    expect(actions.createRelease(data)).toEqual(expectedAction);
  });
});

// Test Update Release
describe('Update Release action', () => {
  it('should create an action to update release', () => {
    const data = { name: 'Test Release Edited' };
    const expectedAction = {
      type: actions.UPDATE_RELEASE,
      data,
    };

    expect(actions.updateRelease(data)).toEqual(expectedAction);
  });
});

// Test Delete Release
describe('Delete Release action', () => {
  it('should create an action to delete release', () => {
    const release_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.DELETE_RELEASE,
      release_uuid,
    };

    expect(actions.deleteRelease(release_uuid)).toEqual(expectedAction);
  });
});

// Test Get Comment
describe('Get Comment action', () => {
  it('should create an action to get comment', () => {
    const comment_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.GET_COMMENT,
      comment_uuid,
    };

    expect(actions.getComment(comment_uuid)).toEqual(expectedAction);
  });
});

// Test Update Comment
describe('Update Comment action', () => {
  it('should create an action to update comment', () => {
    const data = { name: 'Test Comment Edited' };
    const expectedAction = {
      type: actions.UPDATE_COMMENT,
      data,
    };

    expect(actions.updateComment(data)).toEqual(expectedAction);
  });
});

// Test Delete Comment
describe('Delete Comment action', () => {
  it('should create an action to delete comment', () => {
    const comment_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.DELETE_COMMENT,
      comment_uuid,
    };

    expect(actions.deleteComment(comment_uuid)).toEqual(expectedAction);
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

// Test Create Feedback
describe('Create Feedback action', () => {
  it('should create an action to create feedback', () => {
    const data = { name: 'Test Feedback' };
    const expectedAction = {
      type: actions.CREATE_FEEDBACK,
      data,
    };

    expect(actions.createFeedback(data)).toEqual(expectedAction);
  });
});

// Test Update Feedback
describe('Update Feedback action', () => {
  it('should create an action to update feedback', () => {
    const data = { name: 'Test Feedback Edited' };
    const expectedAction = {
      type: actions.UPDATE_FEEDBACK,
      data,
    };

    expect(actions.updateFeedback(data)).toEqual(expectedAction);
  });
});

// Test Delete Feedback
describe('Delete Feedback action', () => {
  it('should create an action to delete feedback', () => {
    const feedback_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.DELETE_FEEDBACK,
      feedback_uuid,
    };

    expect(actions.deleteFeedback(feedback_uuid))
      .toEqual(expectedAction);
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

// Test Get Status
describe('Get Status action', () => {
  it('should create an action to get status', () => {
    const product_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.GET_STATUS,
      product_uuid,
    };

    expect(actions.getStatus(product_uuid)).toEqual(expectedAction);
  });
});

// Test Update Status
describe('Update Status action', () => {
  it('should create an action to update status', () => {
    const data = { name: 'Test Status Edited' };
    const expectedAction = {
      type: actions.UPDATE_STATUS,
      data,
    };

    expect(actions.updateStatus(data)).toEqual(expectedAction);
  });
});

// Test Delete Status
describe('Delete Status action', () => {
  it('should create an action to delete status', () => {
    const status_uuid = '275ac379-82a2-4937-a434-ce6c2e277c88';
    const expectedAction = {
      type: actions.DELETE_STATUS,
      status_uuid,
    };

    expect(actions.deleteStatus(status_uuid))
      .toEqual(expectedAction);
  });
});
