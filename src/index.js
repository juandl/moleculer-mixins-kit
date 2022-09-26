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
     * QueryHelper
     * @param {Object} params
     * @param {Object} params.query
     * @param {Object} params.error
     * @param {String} params.error.message
     * @param {Number} params.error.code
     * @param {Object} params.actions
     * @param {function|boolean} params.actions.onFound - Return into a function if the entity is found
     * @param {function|boolean} params.actions.onNotFound - Return into a function if the entity is not found
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
      let state = _.defaultsDeep(params, {
        entity: null,
        query: {},
        error: {
          message: 'Not found query entity',
          code: 400,
        },
        actions: {
          onFound: null, //Return into a function if the entity is found
          onNotFound: null, //Return into a function if the entity is not found
        },
        model: null,
        broker: null,
      });

      /**
       * Crate call based on broker/model
       */
      const onCall = () => {
        let { broker, model, query } = state;

        /**
         * Use broker to create query call
         */
        if (broker) {
          if (!broker.name) {
            throw new Error('MixinsKit: Broker name is required');
          }

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
        if (model) {
          if (!model.name) {
            throw new Error('MixinsKit: Model name is required');
          }

          /**
           * If not type provided, keep default
           */
          if (!model.type) {
            model.type = 'findOne';
          }

          /**
           * If Model Action exists, create action instance
           */
          if (model.action) {
            model.action = _.get(model.action, model.name, null);

            /**
             * If mixinsKit Model exists, create action instance
             */
          } else if (mixinsKit.model) {
            model.action = _.get(mixinsKit.model, model.name, null);
          } else {
            throw new Error(
              'MixinsKit: Model action or mixinsKit model settings is required'
            );
          }

          /**
           * If query contains, use sql query format
           * Todo: Find a better way to know the dialect of the query
           */
          if (_.get(query, 'where', null)) {
            //Create call
            return model.action[model.type](query);
          }

          /**
           * Default query dialect is "mongodb"
           */
          return model.action[model.type](query)
            .populate(model.populate)
            .select(model.select);
        }

        throw new Error("MixinsKit: Can't create call queryHelper");
      };

      /**
       * Request Call
       */

      state.entity = await onCall();

      /**
       * If entity is a "boolean"
       * if is false change entity to null
       * if is true conver to string for next validation
       * why? lodash "isEmpty" works with only enumerable variables (Object, Array, Sets, Map, Buffer etc).
       */
      if (_.isBoolean(state.entity)) {
        if (!state.entity) state.entity = null;
        else state.entity = _.toString(state.entity);
      }

      /**
       * If entity is a "number"
       * if is > 0 change entity to string
       * if is equal or same as cero change entity to null
       * why? lodash "isEmpty" works with only enumerable variables (Object, Array, Sets, Map, Buffer etc).
       */
      if (_.isNumber(state.entity)) {
        if (state.entity > 0) state.entity = _.toString(state.entity);
        else state.entity = null;
      }

      if (state.actions.onFound) {
        /**
         * If is empty dont' return anything
         * Action will be ejected only if found entity.
         */
        if (_.isEmpty(state.entity)) return;

        /**
         * If onFound is a function, return it instead
         * and use as the "error" from state.error
         */
        if (_.isFunction(state.actions.onFound)) {
          return state.actions.onFound(state.entity);
        }

        /**
         * If onFound is not an function, return error
         * and use as the "error" from state.error
         */
        throw this.throwError(state.error);
      }
      /**
       * If entity is empty (array or object) throw an error
       */
      if (_.isEmpty(state.entity)) {
        if (state.actions.onNotFound)
          return state.actions.onNotFound(state.error);

        throw this.throwError(state.error);
      }

      return state.entity;
    },
    /**
     * Format errors
     * @deprecated Since version 0.2.8. Will be deleted in version 0.2.9. Use throwError() instead.
     * @param {Object} params
     * @param {String} params.msg
     * @param {String} params.uid
     * @param {String} params.code
     * @param {Object} params.extra
     * @returns {Void}
     */
    formatError(params) {
      let { msg = 'Request error', uid = 'COMMON', code = 400, extra } = params;

      //Convert string to uppercase and change spaces for dots
      if (uid !== 'COMMON') {
        uid = uid.toUpperCase();
        uid = uid.replace(/\s/g, '.');
      }

      throw new ErrorClass(msg, code, uid, extra);
    },
    /**
     * Format errors
     * @param {Object} params
     * @param {String} params.message
     * @param {String} params.uid
     * @param {String} params.code
     * @param {Object} params.extra
     * @returns {Error}
     */
    throwError(params) {
      let {
        message = 'Request error',
        uid = 'COMMON',
        code = 400,
        extra,
      } = params;

      //Convert string to uppercase and change spaces for dots
      if (uid !== 'COMMON') {
        uid = uid.toUpperCase();
        uid = uid.replace(/\s/g, '.');
      }

      throw new ErrorClass(message, code, uid, extra);
    },
    /**
     *
     * @param {String|Number} value - String/Number value
     * @param {Integer} precision - Decimal places
     * @returns
     */
    parseNumberDec(value, precision = 3) {
      return parseFloat(parseFloat(value).toFixed(precision));
    },
    /**
     * Create a random 10-digit number code
     */
    generateRandNum(digits) {
      return _.round(_.random(0, 1, true) * 10 ** digits);
    },
  },
  /**
   * Service started lifecycle event handler
   */
  async started() {
    let { settings } = this.schema;

    /**
     * Check if settings of mixinsKit exists on schema
     */
    if (settings.mixinsKit) {
      let { model } = settings.mixinsKit;

      /**
       * Look for the model in "this"
       */
      if (model) {
        settings.mixinsKit.model = _.get(this, model, null);
      }
    }
  },
};
