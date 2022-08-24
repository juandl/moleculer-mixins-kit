const _ = require('lodash');
/**
 * Normalize builder
 * this helper help to normalize data using lodash,
 * to get each value using keys and values
 * @param {Object} builder
 * @param {Object} builder.data - data to normalize
 * @param {Array<{selector: string, field: string}>} builder.fields - fields to normalize
 *
 */
const normalizeBuilder = ({ data, fields }) => {
  let entity = {};

  _.forEach(fields, (item) => {
    //Get value using selector
    let selected = _.get(data, item.selector, null);

    //If value is found, assign to entity based on field name
    if (selected) {
      _.set(entity, item.field, selected);
    }
  });

  return entity;
};

module.exports = normalizeBuilder;
