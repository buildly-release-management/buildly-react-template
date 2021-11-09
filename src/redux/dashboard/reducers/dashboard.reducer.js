import _ from 'lodash';
import {
  ADD_REQUIREMENT,
  EDIT_REQUIREMENT,
  DELETE_REQUIREMENT,
  ADD_ISSUE,
  EDIT_ISSUE,
  DELETE_ISSUE,
  CONVERT_ISSUE,
} from '@redux/dashboard/actions/dashboard.actions';

const initialState = {
  products: [
    { id: 1, name: 'Product 1'},
    { id: 2, name: 'Product 2'},
    { id: 3, name: 'Product 3'},
  ],
  types: [
    { id: 1, value: 'sprint', name: 'Sprint'},
    { id: 2, value: 'release', name: 'Release'},
  ],
  status: [
    { id: 1, value: 'backlog', name: 'Backlog'},
    { id: 2, value: 'to-do', name: 'To-Do'},
    { id: 3, value: 'in-progress', name: 'In-Progess'},
    { id: 4, value: 'review', name: 'Review'},
    { id: 5, value: 'done', name: 'Done'},
  ],
  repos: [
    { productUUID: 1, id: 1, name: 'buildly-react-template (Product 1)'},
    { productUUID: 1, id: 2, name: 'buildly-core (Product 1)'},
    { productUUID: 2, id: 3, name: 'buildly-react-template (Product 2)'},
    { productUUID: 2, id: 4, name: 'buildly-core (Product 2)'},
  ],
  devs: [
    { productUUID: 1, id: 1, value: 'dev1', name: 'Developer 1 (Product 1)'},
    { productUUID: 1, id: 2, value: 'dev2', name: 'Developer 2 (Product 1)'},
    { productUUID: 2, id: 3, value: 'dev3', name: 'Developer 3 (Product 2)'},
    { productUUID: 2, id: 4, value: 'dev4', name: 'Developer 4 (Product 2)'},
  ],
  requirements: [
    {
      productUUID: 1,
      id: 1,
      name: 'Requirements 1 (Product 1)',
      description: 'Description for Requirents 1 (Product 1)',
      priority: 'high',
      status: 'backlog',
      version: 1,
      decisions: [],
      issues: [],
      totalEstimate: '',
      tags: ['testing', 'documentation']
    },
    {
      productUUID: 1,
      id: 2,
      name: 'Requirements 2 (Product 1)',
      description: 'Description for Requirents 2 (Product 1)',
      priority: 'low',
      status: 'in-progress',
      version: 1,
      decisions: [],
      issues: [],
      totalEstimate: '10',
      tags: ['testing', 'bug']
    },
    {
      productUUID: 2,
      id: 3,
      name: 'Requirements 1 (Product 2)',
      description: 'Description for Requirents 1 (Product 2)',
      priority: 'medium',
      status: 'in-progress',
      version: 1,
      decisions: [],
      issues: [],
      totalEstimate: '15',
      tags: ['testing', 'bug']
    },
    {
      productUUID: 2,
      id: 4,
      name: 'Requirements 2 (Product 2)',
      description: 'Description for Requirents 2 (Product 2)',
      priority: 'urgent',
      status: 'done',
      version: 1,
      decisions: [],
      issues: [],
      totalEstimate: '15',
      tags: ['testing', 'bug']
    },
  ],
  issues: [
    {
      id: 1,
      name: 'Issue 1 (Product 1)',
      description: 'Description for Issue 1 (Product 1)',
      repository: 'buildly-react-template (Product 1)',
      status: 'in-progress',
      productUUID: 1,
      featureUUID:1,
      estimate: '1',
      sprint: 1,
      tags: ['abc','def'],
      complexity: 1,
      issueType: 'backend',
      startDate: '2021-10-25 10:00:00',
      endDate: '2021-10-25 11:00:00',
      issueTrackerUUID: '1',
      assignedTo: '',
    },
    {
      id: 2,
      name: 'Issue 2 (Product 1)',
      description: 'Description for Issue 2 (Product 1)',
      repository: 'buildly-core (Product 1)',
      status: 'in-progress',
      productUUID: 1,
      featureUUID:1,
      estimate: '1',
      sprint: 1,
      tags: ['abc','def'],
      complexity: 1,
      issueType: 'backend',
      startDate: '2021-10-25 10:00:00',
      endDate: '2021-10-25 11:00:00',
      issueTrackerUUID: '1',
      assignedTo: 'dev1',
    },
    {
      id: 3,
      name: 'Issue 1 (Product 2)',
      description: 'Description for Issue 1 (Product 2)',
      repository: 'buildly-react-template (Product 2)',
      status: 'review',
      productUUID: 1,
      featureUUID:1,
      estimate: '1',
      sprint: 1,
      tags: ['abc','def'],
      complexity: 1,
      issueType: 'backend',
      startDate: '2021-10-25 10:00:00',
      endDate: '2021-10-25 11:00:00',
      issueTrackerUUID: '2',
      assignedTo: 'dev2',
    },
    {
      productUUID: 2,
      id: 4,
      name: 'Issue 2 (Product 2)',
      description: 'Description for Issue 2 (Product 2)',
      repository: 'buildly-react-template (Product 2)',
      status: 'done',
      featureUUID:1,
      estimate: '2',
      sprint: 1,
      tags: ['abc','def'],
      complexity: 1,
      issueType: 'backend',
      startDate: '2021-10-25 10:00:00',
      endDate: '2021-10-25 11:00:00',
      issueTrackerUUID: '2',
      assignedTo: 'dev3',
    },
  ],
};

// Reducer
export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_REQUIREMENT:
      return {
        ...state,
        requirements: [...state.requirements, action.data],
      };

    case EDIT_REQUIREMENT: {
      let editData = _.filter(
        state.requirements,
        (req) => (req.id !== action.data.id),
      );
      editData = [...editData, action.data];
      return {
        ...state,
        requirements: editData,
      };
    }

    case DELETE_REQUIREMENT: {
      const deleteData = _.filter(
        state.requirements,
        (req) => (req.id !== action.id),
      );
      return {
        ...state,
        requirements: deleteData,
      };
    }

    case ADD_ISSUE:
      return {
        ...state,
        issues: [...state.issues, action.data],
      };

    case EDIT_ISSUE: {
      let editData = _.filter(
        state.issues,
        (issue) => (issue.id !== action.data.id),
      );
      editData = [...editData, action.data];
      return {
        ...state,
        issues: editData,
      };
    }

    case DELETE_ISSUE: {
      const deleteData = _.filter(
        state.issues,
        (issue) => (issue.id !== action.id),
      );
      return {
        ...state,
        issues: deleteData,
      };
    }

    case CONVERT_ISSUE: {
      const deleteData = _.filter(
        state.requirements,
        (req) => (req.id !== action.reqId),
      );
      return {
        ...state,
        requirements: deleteData,
        issues: [...state.issues, action.data],
      };
    }
    default:
      return state;
  }
};
