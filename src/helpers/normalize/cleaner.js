const _ = require('lodash');
/**
 * Clean object properties
 * this helper will clean object with the fields mentioned
 * @param {Object} opts
 * @param {Object} opts.data - data to normalize
 * @param {Array<string>} opts.fields - fields to normalize
 *
 */
const normalizeCleaner = (opts) => {
  const { data, fields } = _.defaultsDeep(opts, {
    data: {},
    fields: [],
  });

  let entity = { ...data };

  _.forEach(fields, (field) => {
    //Get value using selector
    let selected = _.get(data, field, null);

    //If value is found, assign to entity based on field name
    if (selected) {
      _.unset(entity, field);
    }
  });

  return entity;
};

module.exports = normalizeCleaner;
