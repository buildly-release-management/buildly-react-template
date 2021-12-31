import * as actions from '../actions/decision.actions';
import * as reducer from './decision.reducer';

const initialState = {
  loading: false,
  loaded: false,
  error: null,
  decisions: [],
  features: [],
  feedbacks: [],
  issues: [],
  kanbanStatuses: [],
};

describe('Get all decisions reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_DECISIONS },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get all decisions success reducer', () => {
    const data = [{
      decision_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    }];

    expect(reducer.default(
      initialState,
      { type: actions.ALL_DECISIONS_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      decisions: data,
    });
  });

  it('get all decisions fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_DECISIONS_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get a decision reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_DECISION },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get a decision success reducer', () => {
    const data = {
      decision_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.GET_DECISION_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      decisions: [data],
    });
  });

  it('get a decision fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_DECISION_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get all features reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_FEATURES },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get all features success reducer', () => {
    const data = [{
      feature_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    }];

    expect(reducer.default(
      initialState,
      { type: actions.ALL_FEATURES_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      features: data,
    });
  });

  it('get all features fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_FEATURES_FAILURE },
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

describe('Get all issues reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_ISSUES },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get all issues success reducer', () => {
    const data = [{
      issue_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    }];

    expect(reducer.default(
      initialState,
      { type: actions.ALL_ISSUES_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      issues: data,
    });
  });

  it('get all issues fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_ISSUES_FAILURE },
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

describe('Get all kanban statuses reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_KANBAN_STATUSES },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get all kanban statuses success reducer', () => {
    const data = [{
      kanban_status_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    }];

    expect(reducer.default(
      initialState,
      { type: actions.ALL_KANBAN_STATUSES_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      kanbanStatuses: data,
    });
  });

  it('get all kanban statuses fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ALL_KANBAN_STATUSES_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});

describe('Get a kanban status reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_KANBAN_STATUS },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get a kanban status success reducer', () => {
    const data = {
      kanban_status_uuid: 'kfhwue-y38wgws-3i2wfhv-84gheu',
      name: 'Test',
    };

    expect(reducer.default(
      initialState,
      { type: actions.GET_KANBAN_STATUS_SUCCESS, data },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      kanbanStatuses: [data],
    });
  });

  it('get a kanban status fail reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_KANBAN_STATUS_FAILURE },
    )).toEqual({
      ...initialState,
      loading: false,
      loaded: true,
      error: undefined,
    });
  });
});
