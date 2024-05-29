import React from 'react';
import moment from 'moment-timezone';
import { Link } from '@mui/material';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';

export const featureColumns = [
  {
    name: 'name',
    label: 'Name',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => value || '-',
    },
  },
  {
    name: 'priority',
    label: 'Priority',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => value || '-',
    },
  },
  {
    name: '_status',
    label: 'Status',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => value || '-',
    },
  },
  {
    name: 'edit_date',
    label: 'Last Edited At',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (value
        ? moment(value)
          .format('MMM DD YYYY, h:mm a')
        : '-'),
    },
  },
  {
    name: '_url',
    label: 'Link to original card',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (value
        ? (
          <Link href={value} target="_blank" rel="noopener">
            <OpenInNewIcon />
          </Link>
        ) : ''),
    },
  },
];

export const issueColumns = [
  {
    name: 'name',
    label: 'Name',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => value || '-',
    },
  },
  {
    name: 'issue_type',
    label: 'Type',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => value || '-',
    },
  },
  {
    name: '_status',
    label: 'Status',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => value || '-',
    },
  },
  {
    name: 'issue_detail',
    label: 'Is imported?',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (detail) => ((detail && detail.is_imported) ? 'Yes' : 'No'),
    },
  },
  {
    name: 'edit_date',
    label: 'Last Edited At',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (value
        ? moment(value)
          .format('MMM DD YYYY, h:mm a')
        : '-'),
    },
  },
  {
    name: '_url',
    label: 'Link to original issue',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (value
        ? (
          <Link href={value} target="_blank" rel="noopener">
            <OpenInNewIcon />
          </Link>
        ) : ''),
    },
  },
];

export const PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Urgent',
];

export const STATUSTYPES = [
  'Backlog',
  'Sprint Ready',
  'To Do',
  'In Progress',
  'Doing',
  'Done',
];

export const ISSUETYPES = [
  'FE',
  'BE',
  'UI/UX',
  'Documentation',
];
