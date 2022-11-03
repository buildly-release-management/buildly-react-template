import _ from 'lodash';
import moment from 'moment-timezone';

export const productColumns = [
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
    name: 'product_info',
    label: 'Complexity',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (info) => (info && info.complexity_score) || 0,
    },
  },
  {
    name: 'product_info',
    label: 'Cost',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (info) => (info && info.cost_score) || 0,
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

export const getProductsData = (products) => {
  let finalProducts = [];
  _.forEach(products, (prod) => {
    if (prod) {
      const product = {
        ...prod,
        product_name: prod?.name,
      };
      finalProducts = [...finalProducts, product];
    }
  });
  return finalProducts;
};
