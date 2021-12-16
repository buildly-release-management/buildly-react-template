import _ from 'lodash';
import moment from 'moment-timezone';

export const releaseColumns = [
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
      customBodyRender: (value) => value || '-',
    },
  },
  {
    name: 'features',
    label: 'Features',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => value || '-',
    },
  },
  {
    name: 'dev_team_names',
    label: 'Dev Team',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => value || '-',
    },
  },
  {
    name: 'environment',
    label: 'Environment',
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

export const getReleasesData = (releases, users) => {
  let finalReleases = [];
  _.forEach(releases, (release) => {
    if (release) {
      let devTeam = '';
      _.forEach(release.dev_team_uuid, (id) => {
        const user = _.find(users, { core_user_uuid: id });
        devTeam = devTeam && user
          ? `${devTeam}, ${user.first_name} ${user.last_name}`
          : user ? `${user.first_name} ${user.last_name}` : ''
      });
      const rel = {
        ...release,
        dev_team_names: devTeam,
      };
      finalReleases = [ ...finalReleases, rel ];
    }
  });
  return finalReleases;
};