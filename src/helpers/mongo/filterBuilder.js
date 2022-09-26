const _ = require("lodash");

/**
 * @param {Object} opts
 * @param {Object} opts.params
 * @param {Array<{name: string, field: string, type: ('SEARCH' | 'DATE')}>} opts.filtersAllowed
 * @returns
 */
const builderFilter = ({ params, filtersAllowed }) => {
	let query = {};

	_.forEach(params, (value, key) => {
		//Check if filter is allowed
		const filter = _.find(filtersAllowed, { name: key });

		if (!filter) {
			return;
		}

		//Set default value if has
		if (filter.default && value === undefined) {
			value = filter.default;
		}

		switch (filter.type) {
			/**
			 * Search using case-sensitive
			 */
			case "search":
				{
					_.set(query, filter.field, { $regex: value, $options: "i" });
				}
				break;
			case "boolean":
				{
					//Convert to boolean based on string value
					if (value === "true") value = true;
					else if (value === "false") value = false;

					_.set(query, filter.field, value);
				}
				break;
			default:
				break;
		}
	});

	return query;
};

module.exports = builderFilter;
