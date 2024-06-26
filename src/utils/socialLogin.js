export const providers = {
  github: 'Github',
  trello: 'Trello',
};

export const toParams = (query) => {
  const q = query.replace(/^\??\//, '');

  return q.split('&').reduce((values, param) => {
    const [key, value] = param.split('=');

    // eslint-disable-next-line no-param-reassign
    values[key] = value;

    return values;
  }, {});
};

export const toQuery = (params, delimiter = '&') => {
  const keys = Object.keys(params);

  return keys.reduce((str, key, index) => {
    let query = `${str}${key}=${params[key]}`;

    if (index < keys.length - 1) {
      query += delimiter;
    }

    return query;
  }, '');
};
