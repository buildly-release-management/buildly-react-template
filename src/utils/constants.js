/* eslint-disable no-nested-ternary */
import React from 'react';
import _ from 'lodash';

export const getUserFormattedRows = (userData) => {
  const formattedData = _.map(userData, (ud) => ({
    ...ud,
    full_name: `${ud.first_name} ${ud.last_name}`,
    last_activity: 'Today',
    org_display_name: ud.organization.name,
  }));

  return _.orderBy(formattedData, 'id', 'desc');
};

export const userColumns = () => ([
  {
    name: 'full_name',
    label: 'Full Name',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'username',
    label: 'User Name',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'email',
    label: 'Email',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'last_activity',
    label: 'Last Activity',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'org_display_name',
    label: 'Organization',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
]);

export const getGroupsFormattedRow = (groups, orgName) => {
  const formattedData = _.map(groups, (g) => ({
    ...g,
    display_permission_name: _.isEqual(g.id, 1)
      ? g.name
      : `${g.name} - ${orgName}`,
  }));

  return _.orderBy(formattedData, 'display_permission_name', 'asc');
};
