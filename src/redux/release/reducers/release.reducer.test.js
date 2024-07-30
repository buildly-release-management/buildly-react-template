import * as actions from '../actions/release.actions';
import * as reducer from './release.reducer';

const initialState = {
  loading: false,
  loaded: false,
  error: null,
  releases: [],
  comments: [],
  features: [],
  feedbacks: [],
  issues: [],
  statuses: [],
  dataSynced: false,
};

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
      name: 'Test Release',
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

describe('Create a release reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.CREATE_RELEASE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('create a release success reducer', () => {
    const data = {
      release_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test Release',
    };

    expect(reducer.default(
      initialState,
      { type: actions.CREATE_RELEASE_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      releases: [data],
    });
  });

  it('create a release fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.CREATE_RELEASE_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Update a release reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.UPDATE_RELEASE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('update a release success reducer', () => {
    const data = {
      release_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test Release',
    };
    const editedData = {
      release_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test Release Edited',
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

  it('update a release fail reducer', () => {
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

describe('Delete a release reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_RELEASE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('delete a release success reducer', () => {
    const data = {
      release_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test Release',
    };

    expect(reducer.default(
      { ...initialState, releases: [data] },
      {
        type: actions.DELETE_RELEASE_SUCCESS,
        release_uuid: data.release_uuid,
      },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      releases: [],
    });
  });

  it('delete a release fail reducer', () => {
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

describe('Get a comment reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_COMMENT },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get a comment success reducer', () => {
    const data = {
      comment_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test Comment',
    };

    expect(reducer.default(
      initialState,
      { type: actions.GET_COMMENT_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      comments: [data],
    });
  });

  it('get a comment fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_COMMENT_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Update a comment reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.UPDATE_COMMENT },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('update a comment success reducer', () => {
    const data = {
      comment_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test Comment',
    };
    const editedData = {
      comment_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test Comment Edited',
    };

    expect(reducer.default(
      { ...initialState, comments: [data] },
      { type: actions.UPDATE_COMMENT_SUCCESS, data: editedData },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      comments: [editedData],
    });
  });

  it('update a comment fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.UPDATE_COMMENT_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Delete a comment reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_COMMENT },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('delete a comment success reducer', () => {
    const data = {
      comment_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test Comment',
    };

    expect(reducer.default(
      { ...initialState, comments: [data] },
      {
        type: actions.DELETE_COMMENT_SUCCESS,
        comment_uuid: data.comment_uuid,
      },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      comments: [],
    });
  });

  it('delete a comment fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_COMMENT_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get a fetaure reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_FEATURE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get a feature success reducer', () => {
    const data = {
      feature_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.GET_FEATURE_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      features: [data],
    });
  });

  it('get a feature fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_FEATURE_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get all feedbacks reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_FEEDBACKS },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get all feedbacks success reducer', () => {
    const data = [{
      feedback_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    }];

    expect(reducer.default(
      initialState,
      { type: actions.ALL_FEEDBACKS_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      feedbacks: data,
    });
  });

  it('get all feedbacks fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_FEEDBACKS_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get a feedback reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_FEEDBACK },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get a feedback success reducer', () => {
    const data = {
      feedback_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.GET_FEEDBACK_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      feedbacks: [data],
    });
  });

  it('get a feedback fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_FEEDBACK_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Create a feedback reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.CREATE_FEEDBACK },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('create a feedback success reducer', () => {
    const data = {
      feedback_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.CREATE_FEEDBACK_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      feedbacks: [data],
    });
  });

  it('create a feedback fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.CREATE_FEEDBACK_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Update a feedback reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.UPDATE_FEEDBACK },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('update a feedback success reducer', () => {
    const data = {
      feedback_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };
    const editedData = {
      feedback_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test Edited',
    };

    expect(reducer.default(
      { ...initialState, feedbacks: [data] },
      { type: actions.UPDATE_FEEDBACK_SUCCESS, data: editedData },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      feedbacks: [editedData],
    });
  });

  it('update a feedback fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.UPDATE_FEEDBACK_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Delete a feedback reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_FEEDBACK },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('delete a feedback success reducer', () => {
    const data = {
      feedback_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      { ...initialState, feedbacks: [data] },
      {
        type: actions.DELETE_FEEDBACK_SUCCESS,
        feedback_uuid: data.feedback_uuid,
      },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      feedbacks: [],
    });
  });

  it('delete a feedback fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_FEEDBACK_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get an issue reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_ISSUE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get an issue success reducer', () => {
    const data = {
      issue_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.GET_ISSUE_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      issues: [data],
    });
  });

  it('get an issue fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_ISSUE_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get a status reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_STATUS },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get a status success reducer', () => {
    const data = {
      product_uuid: '275ac379-82a2-4937-a434-ce6c2e277c88',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.GET_STATUS_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      statuses: [data],
    });
  });

  it('get a status fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_STATUS_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Update a status reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.UPDATE_STATUS },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('update a status success reducer', () => {
    const data = {
      status_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };
    const editedData = {
      status_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test Edited',
    };

    expect(reducer.default(
      { ...initialState, statuses: [data] },
      { type: actions.UPDATE_STATUS_SUCCESS, data: editedData },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      statuses: [editedData],
    });
  });

  it('update a status fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.UPDATE_STATUS_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Delete a status reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_STATUS },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('delete a status success reducer', () => {
    const data = {
      status_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      { ...initialState, statuses: [data] },
      {
        type: actions.DELETE_STATUS_SUCCESS,
        status_uuid: data.status_uuid,
      },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      statuses: [],
    });
  });

  it('delete a status fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_STATUS_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});
