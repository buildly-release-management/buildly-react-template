import _ from 'lodash';
import moment from 'moment-timezone';

export const punchListColumns = [
  {
    name: 'title',
    label: 'Title',
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
      customBodyRender: (value) => value || '-',
      setCellProps: () => ({
        style: { maxWidth: '600px', wordWrap: 'break-word' },
      }),
    },
  },
  {
    name: 'complexity_estimate',
    label: 'Complexity',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (info) => (info && info.complexity_score) || 0,
    },
  },
  {
    name: 'catagory',
    label: 'Catagory',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => value || '-',
    },
  },
  {
    name: 'tags',
    label: 'Tags',
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
  {
    name: 'create_date',
    label: 'Created At',
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

export const bugsColumns = [
  {
    name: 'app_name',
    label: 'App Name',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'version',
    label: 'Version',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'title',
    label: 'Title',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      setCellProps: () => ({
        style: { maxWidth: '600px', wordWrap: 'break-word' },
      }),
    },
  },
  {
    name: 'severity',
    label: 'Severity',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'name',
    label: 'Submitted By',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => value || '-',
    },
  },
];
