'use strict';

const _ = require('lodash');
const kleur = require('kleur');

//Peer dependencies
let mongoose;

/**
 * Check Peer dependencies
 */
try {
  mongoose = require('mongoose');
} catch (err) {
  console.error('To use mongoose middleware, you have to install some dependencies');
}

//Constants
const { mongoose: DefaultConfig } = require('../config/database');

/**
 * Middleware to connect mongodb around the entire broker(node)
 * this is just a temp middleware as the idea of micro-service is to separate each service
 * in diferent database.
 * @param {Object} Opts
 * @param {String} Opts.url
 * @param {Object} Opts.db
 * @param {Object} Opts.model
 */
module.exports = function (Opts = {}) {
  let Config = { ...DefaultConfig };

  //Assign default config
  Object.assign(Config, Opts);

  if (!Config.url) {
    throw new Error('MongoseMiddleware: Missing url connection');
  }

  return {
    name: 'MongoseMiddleware',
    /**
     * Run on create broker
     */
    async starting(broker) {
      /**
       * If models already exist, continue
       */
      if (!_.isEmpty(broker.mongodb)) {
        return Promise.resolve();
      }

      /**
       * Create Mongoose Constructor in Broker
       */
      broker.$mongod = null;
      /**
       * Create models list
       */
      broker.mongodb = {};

      try {
        //Create instance mongoose
        broker.$mongod = await mongoose
          .createConnection(Config.url, Config.db)
          .asPromise();

        this.logger.info(
          kleur.bgYellow(
            'Mongodb: Connection has been established successfully'
          )
        );
      } catch (err) {
        //Close connection db
        if (broker.$mongod) {
          broker.$mongod.close().finally(() => Promise.reject(err));
        }

        this.logger.error(err);
      }
    },
    /**
     * This hook is called before service starting.
     */
    async serviceStarting(service) {
      /**
       * Broker
       */
      let { $mongod, mongodb } = service.broker;

      /**
       * Service
       */
      const models = service.schema.mongodb;

      /**
       * If not mongodb instance or model found in the service, pass it
       */
      if (!$mongod || !models) return;

      /**
       * Create each model instance and assign to parent service
       */
      _.forEach(
        models,
        (
          /**
           * @type {{name: string, schema: Object, options: object}}
           */
          model
        ) => {
          /**
           * States
           */
          let schema;

          /**
           * Validate: Make sure model is defined
           */
          if (!model.name) {
            throw new Error(
              'moleculer-db-mongoose: Missing `model.name` definition in schema of service!'
            );
          } else if (!model.schema) {
            throw new Error(
              'moleculer-db-mongoose: Missing `model.schema` definition in schema of service!'
            );
          }

          if (!_.get(mongodb, model.name, null)) {
            /**
             * Assign custom options to model
             * and merge with default options
             */
            if (model.options) {
              model.options = { ...DefaultConfig.model, ...model.options };
              //Define default options
            } else model.options = DefaultConfig.model;

            //Create schema model
            schema = new mongoose.Schema(model.schema, model.options);

            //Assign plugin if has
            if (!_.isEmpty(model.plugins)) {
              _.forEach(model.plugins, (plugin) => schema.plugin(plugin));
            }

            //Create model
            schema = $mongod.model(model.name, schema);

            //Assign to the service parent
            _.set(mongodb, model.name, schema);
          }
        }
      );
    },

    /**
     * This hook is called before broker stopping.
     */
    async stopped(broker) {
      /**
       * Broker
       */
      const { $mongod } = broker;

      //Close connection db
      if ($mongod) {
        $mongod.close();
      }

      return Promise.resolve();
    },
  };
};