import _ from 'lodash';
import {
  ADD_REQUIREMENT,
  EDIT_REQUIREMENT,
  DELETE_REQUIREMENT,
  ADD_ISSUE,
  EDIT_ISSUE,
  DELETE_ISSUE,
} from '@redux/dashboard/actions/dashboard.actions';

const initialState = {
  projects: [
    { id: 1, name: 'Project 1'},
    { id: 2, name: 'Project 2'},
    { id: 3, name: 'Project 3'},
  ],
  requirements: [
    { projId: 1, id: 1, title: 'Requirements 1 (Project 1)' },
    { projId: 1, id: 2, title: 'Requirements 2 (Project 1)' },
    { projId: 2, id: 3, title: 'Requirements 1 (Project 2)' },
    { projId: 2, id: 4, title: 'Requirements 2 (Project 2)' },
  ],
  issues: [
    { projId: 1, id: 1, title: 'Issue 1 (Project 1)' },
    { projId: 1, id: 2, title: 'Issue 2 (Project 1)' },
    { projId: 2, id: 3, title: 'Issue 1 (Project 2)' },
    { projId: 2, id: 4, title: 'Issue 2 (Project 2)' },
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
        (req) => (req.id !== action.data.id),
      );
      editData = [...editData, action.data];
      return {
        ...state,
        issues: editData,
      };
    }

    case DELETE_ISSUE: {
      const deleteData = _.filter(
        state.requirements,
        (req) => (req.id !== action.id),
      );
      return {
        ...state,
        issues: deleteData,
      };
    }

    default:
      return state;
  }
};
