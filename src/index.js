'use strict';

const _ = require('lodash');

//Helpers
const ErrorClass = require('./helpers/error');

module.exports = {
  settings: {
    mixinsKit: {
      model: null, //Model to be use for queryHelper and more
    },
  },
  methods: {
    /**
     *
     * @param {Object} params
     * @param {Object} params.query
     * @param {Object} params.error
     * @param {String} params.error.msg
     * @param {Number} params.error.code
     * @param {Object} params.actions
     * @param {function} params.actions.onFound - Return into a function if the entity is found
     * @param {function} params.actions.onNotFound - Return into a function if the entity is not found
     * @param {Object} params.model
     * @param {String} params.model.name
     * @param {String} params.model.type
     * @param {Function} params.model.action
     * @param {Array} params.model.populate
     * @param {Array} params.model.select
     * @param {Object} params.broker
     * @param {String} params.broker.name
     * @param {String} params.broker.node
     * @param {Object} params.broker.options
     * @returns {Object|Array|Function}
     */
    async queryHelper(params = {}) {
      //Get global settings
      const mixinsKit = _.get(this.schema, 'settings.mixinsKit', null);

      //Create Default State
      let state = {
        entity: null,
        query: {},
        error: {
          msg: 'Not found query entity',
          code: 400,
        },
        actions: {
          onFound: null, //Return into a function if the entity is found
          onNotFound: null, //Return into a function if the entity is not found
        },
        model: {
          name: null, //Database Table name
          type: 'findOne', //Database Query type
          action: null, //Database instance
          populate: [], //Populate data model (only mongodb)
          select: [], //Select specific data from model (only mongodb)
        },
        broker: {
          name: null,
          node: null,
          options: {},
        },
      };

      /**
       * Assign params to state
       */
      Object.assign(state, params);

      /**
       * Crate call based on broker/model
       */
      const onCall = async () => {
        let { broker, model, query } = state;

        /**
         * Use broker to create query call
         */
        if (_.get(broker, 'name', null)) {
          //If broker nodeID is defined (call external services)
          if (broker.node) {
            _.set(broker, 'options.nodeID', broker.node);
          }

          //Create call using broker
          return this.broker.call(broker.name, query, broker.options);
        }

        /**
         * Use model to create query call
         */
        if (_.get(model, 'name', null)) {
          /**
           * If Model Action exists, create action instance
           */
          if (!mixinsKit.model && model.action) {
            model.action = model.action[model.name][model.type];

            /**
             * If mixinsKit Model exists, create action instance
             */
          } else if (mixinsKit.model && !model.action) {
            model.action = mixinsKit.model[model.name][model.type];
          }

          //Create call
          return model
            .action(query)
            .populate(model.populate)
            .select(model.select);
        }

        throw new Error("MixinsKit: Can't create call queryHelper");
      };

      let { actions, entity, error } = state;

      /**
       * Request Call
       */
      try {
        entity = await onCall();

        /**
         * If entity is a "boolean"
         * if is false change entity to null
         * if is true conver to string for next validation
         * why? lodash "isEmpty" works with only enumerable variables (Object, Array, Sets, Map, Buffer etc).
         */
        if (_.isBoolean(entity)) {
          if (!entity) entity = null;
          else entity = _.toString(entity);
        }

        /**
         * If entity is a "number"
         * if is > 0 change entity to string
         * if is equal or same as cero change entity to null
         * why? lodash "isEmpty" works with only enumerable variables (Object, Array, Sets, Map, Buffer etc).
         */
        if (_.isNumber(entity)) {
          if (entity > 0) entity = _.toString(entity);
          else entity = null;
        }

        /**
         * If entity is empty (array or object) throw an error
         */
        if (_.isEmpty(entity)) {
          if (actions.onNotFound) return actions.onNotFound();

          throw this.formatError(error);
        }

        /**
         * If entity was found
         */
        if (actions.onFound) {
          return actions.onFound(entity);
        }

        return entity;
      } catch (err) {
        /**
         * If actions on not found is required
         */
        if (actions.onNotFound) return actions.onNotFound();

        throw this.formatError(error);
      }
    },
    /**
     * Format errors
     * @param {Object} params
     * @param {String} params.msg
     * @param {String} params.uid
     * @param {String} params.code
     * @param {Object} params.extra
     * @returns {Void}
     */
    formatError(params) {
      let { name, msg, uid = 'COMMON', code = 400, extra } = params;

      //Convert string to uppercase and change spaces for dots
      if (!uid.includes('COMMON')) {
        uid = uid.toUpperCase();
        uid = uid.replace(/\s/g, '.');
      }

      if (!name) name = uid;

      throw new ErrorClass(name, msg, code, uid, extra);
    },
  },
};
