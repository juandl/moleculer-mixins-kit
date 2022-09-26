const _ = require('lodash');
/**
 * Normalize builder
 * this helper help to normalize data using lodash,
 * to get each value using keys and values
 * @param {Object} opts
 * @param {Object} opts.data - data to normalize
 * @param {Array<{selector: string, field: string }>} opts.fields - fields to normalize
 *
 */
const normalizeBuilder = (opts) => {
  const { data, fields } = _.defaultsDeep(opts, {});

  let entity = {};

  _.forEach(fields, (item) => {
    //Get value using selector
    let selected = _.get(data, item.selector, null);

    //If value is found, assign to entity based on field name
    if (selected !== undefined) {
      _.set(entity, item.field, selected);
    }
  });

  return entity;
};

module.exports = normalizeBuilder;
