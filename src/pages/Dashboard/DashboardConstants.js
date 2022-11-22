import moment from 'moment-timezone';
import parse from 'html-react-parser';

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
    name: 'description',
    label: 'Description',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => ((value && parse(value)) || '-'),
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
        ? moment(value).format('MMM DD YYYY, h:mm a')
        : '-'),
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
    name: 'description',
    label: 'Description',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => ((value && parse(value)) || '-'),
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
        ? moment(value).format('MMM DD YYYY, h:mm a')
        : '-'),
    },
  },
];

export const PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Urgent',
];

export const TAGS = [
  'enhancement',
  'bug',
  'documentation',
  'deployment',
  'duplicate',
  'good first issue',
  'help wanted',
  'invalid',
  'question',
  'wontfix',
  'Story/Sub-Feature',
];

export const ISSUETYPES = [
  'FE',
  'BE',
  'UI/UX',
  'Documentation',
];

export const STATUSTYPES = [
  'Backlog',
  'Sprint Ready',
  'To Do',
  'In Progress',
  'Doing',
  'Done',
];
