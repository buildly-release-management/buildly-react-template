import _ from 'lodash';
import moment from 'moment-timezone';

export const ReleaseEnv = ['Dev', 'Staging', 'Production'];

export const releaseColumns = [
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
    name: 'product_name',
    label: 'Product',
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

export const getReleasesData = (releases, products) => {
  let finalReleases = [];
  _.forEach(releases, (release) => {
    if (release) {
      const product = _.find(products, { product_uuid: release.product_uuid });
      const rel = {
        ...release,
        product_name: product ? product.name : '',
      };
      finalReleases = [...finalReleases, rel];
    }
  });
  return finalReleases;
};
