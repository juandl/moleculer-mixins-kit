'use strict';

const _ = require('lodash');

//Helpers
const ErrorClass = require('./helper/error');

module.exports = {
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
     * @param {Function} params.model.instance
     * @param {Array} params.model.populate
     * @param {Array} params.model.select
     * @param {Object} params.broker
     * @param {String} params.broker.name
     * @param {String} params.broker.node
     * @param {Object} params.broker.options
     * @returns {Object|Array|Function}
     */
    async queryHelper(params = {}) {
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
          name: null, //Name of the model
          type: 'findOne',
          instance: null, //Database custom instance
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
        if (broker) {
          if (broker.name) {
            //If broker nodeID is defined (call external services)
            if (broker.node) {
              _.set(broker, 'options.nodeID', broker.node);
            }

            //Create call
            return this.broker.call(broker.name, query, broker.options);
          }
        }

        /**
         * Use model to create query call
         */
        if (model) {
          //Required name model
          if (!model.name) {
            throw new Error('Model name is required');
          }

          //Required type model action but default "findOne"
          if (!model.type) {
            model.type = 'findOne';
          }

          /**
           * Check local models and create instance
           */
          if (_.get(this.models, model.name, null)) {
            model.instance = this.model[model.name];

            //Custom instance model
          } else if (model.instance) {
            model.instance = model.instance[model.name];
          }

          //Create call
          return model.instance[model.type](query)
            .populate(model.populate)
            .select(model.select);
        }

        throw new Error('Not call function created');
      };

      let { actions, entity, error } = state;

      /**
       * Request Call
       */
      try {
        entity = await onCall();

        /**
         * If entity is empty (array or object) throw an error
         */
        if (_.isEmpty(entity)) {
          if (actions.onNotFound) return actions.onNotFound();

          return this.formatError(error);
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

        return this.formatError(error);
      }
    },
    /**
     * Format errors
     * @param {Object} params
     * @param {String} params.msg
     * @param {String} params.uid
     * @param {String} params.code
     * @param {Object} params.extra
     */
    async formatError(params) {
      let { msg, uid = 'COMMON', code = 400, extra } = params;

      //Convert string to uppercase and change spaces for dots
      if (!uid.includes('COMMON')) {
        uid = uid.toUpperCase();
        uid = uid.replace(/\s/g, '.');
      }

      throw new ErrorClass(msg, code, uid, extra);
    },
  },
};
