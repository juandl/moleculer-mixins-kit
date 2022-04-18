'use strict';

const _ = require('lodash');

let Sequelize;

/**
 * Check Peer dependencies
 */
try {
  Sequelize = require('sequelize').Sequelize;
} catch (err) {
  console.error('To use this mixins, you have to install some dependencies');
}

//Constants
const { sequalize: DefaultConfig } = require('../config/database');

/**
 * Middleware to connect sequelize around the entire broker(node)
 * this is just a temp middleware as the idea of micro-service is to separate each service
 * in diferent database.
 * @param {Object} Config
 * @param {Object} Config.url
 * @param {Object} Config.sequalize
 * @param {Object} Config.model
 *
 */
module.exports = function (Opts = {}) {
  let Config = { ...DefaultConfig };

  //Assign default config
  Object.assign(Config, Opts);

  if (!Config.url) {
    throw new Error('SequelizeMiddleware: Missing url connection');
  }

  return {
    name: 'SequelizeMiddleware',
    /**
     * Run on create broker
     */
    async starting(broker) {
      /**
       * Create Sequelize Constructor in Broker
       */
      broker.$sequelizeNode = null;
      /**
       * Create models list
       */
      broker.$sequelize = {};

      if (
        !broker.$sequelizeNode &&
        !(broker.$sequelizeNode instanceof Sequelize)
      ) {
        //Create instance sequelize
        broker.$sequelizeNode = new Sequelize(Config.url, {
          define: Config.sequalize,
          dialectOptions: {
            ssl: {
              rejectUnauthorized: false, // very important
            },
          },
          logging: (msg) => this.logger.info(msg), //Keep log level
        });
      }
    },
    /**
     * This hook is called before service starting.
     */
    async serviceStarting(service) {
      /**
       * Broker
       */
      const { $sequelizeNode, $sequelize } = service.broker;

      /**
       * Service
       */
      const { modelSql } = service.schema;

      /**
       * If not sequalize instance or model found in the service, don't continue
       */
      if (!$sequelizeNode || !modelSql) return;

      /**
       * Validate: Make sure model is defined
       */
      if (!modelSql.model) {
        throw new Error(
          'Missing `model.model` definition in schema of service!'
        );
      } else if (!modelSql.name) {
        throw new Error(
          'Missing `model.name` definition in schema of service!'
        );
      } else if (!modelSql.schema) {
        throw new Error(
          'Missing `model.schema` definition in schema of service!'
        );
      }

      try {
        await $sequelizeNode.authenticate();

        //Define Default opts for each model
        let optsModel = Config.model;

        //Assign new opts
        if (modelSql.options) Object.assign(optsModel, modelSql.options);

        /**
         * Create model definition in broker
         */
        $sequelize[modelSql.name] = $sequelizeNode.define(
          modelSql.model,
          modelSql.schema,
          optsModel
        );

        this.logger.info(`Sequelize: ${modelSql.name} defined successfully.`);

        return Promise.resolve();
      } catch (err) {
        return $sequelizeNode.close().finally(() => Promise.reject(err));
      }
    },
    /**
     * Node start
     */
    async started(broker) {
      /**
       * Broker
       */
      const { $sequelizeNode, $sequelize } = broker;

      /**
       * If not sequalize instance/services don't continue
       */
      if (!$sequelizeNode || _.isEmpty(broker.services)) return;

      /**
       * Automatically create each relation
       */
      _.forEach(broker.services, (service) => {
        if (!service) return;

        /**
         * Service
         */
        const { modelSql } = service.schema;

        /**
         * If not model found or relations in the service, skip it
         */
        if (!modelSql || _.isEmpty(modelSql.relations)) return;

        /**
         * Get model from sequelize
         */
        const _model = _.get($sequelize, modelSql.name, null);

        //If not model found, skip it!
        if (!_model) return;

        /**
         * automatically create each relation
         */
        _.forEach(modelSql.relations, (item) => {
          //Get Internal Model
          const _inModel = _.get($sequelize, item.model, null);
          //Get type relation from internal model
          const _inModelType = _.get(_inModel, item.type, null);
          //Create default logger message
          const msgLogger = `Sequelize: Relation "${item.model} ${item.type}" - ${modelSql.name}`;

          //If not internal model or type, skip it!
          if (!_inModel || !_inModelType) {
            this.logger.error(`${msgLogger}, Error!`);
            return;
          }

          try {
            this.logger.info(`${msgLogger}, Starting!`);
            /**
             * Create relation
             * https://sequelize.org/v6/manual/assocs.html
             */
            _inModel[item.type](_model, item.params);
          } catch {
            this.logger.info(`${msgLogger}, Completed!`);
          }
        });
      });
    },

    /**
     * This hook is called before broker stopping.
     */
    async stopping(broker) {
      /**
       * Broker
       */
      const { $sequelizeNode } = broker;

      //Close sequelizeNode
      if ($sequelizeNode) $sequelizeNode.close();
    },
  };
};
