'use strict';

const _ = require('lodash');

//Peer dependencies
let mongoose;

/**
 * Check Peer dependencies
 */
try {
  mongoose = require('mongoose');
} catch (err) {
  console.error('To use this mixins, you have to install some dependencies');
}

//Constants
const { mongoose: DefaultConfig } = require('../config/database');

/**
 * Mongoose Native Connector
 */
module.exports = function createService(mongoUrl, opts = {}) {
  /**
   * Service to connect to Sequelize
   *
   * @name moleculer-db-mongoose
   * @module Service
   */
  return {
    name: 'moleculer-db-mongoose',

    /**
     * Service created lifecycle event handler
     */
    created() {
      /**
       * Create mongodb constructor
       */
      this.$mongod = null;

      /**
       * Assign models to parent service
       * @type {Object}
       */
      this.models = {};
    },

    /**
     * Service started lifecycle event handler
     */
    async started() {
      const modelSchemas = this.schema.models;

      if (!mongoUrl) {
        throw new Error('moleculer-db-mongoose: Missing `mongoUrl`');
      } else if (!modelSchemas) {
        throw new Error(
          'moleculer-db-mongoose: Missing `models` definition in schema of service!'
        );
      } else if (!Array.isArray(modelSchemas)) {
        throw new Error(
          'moleculer-db-mongoose: Models params should be an array'
        );
      }

      //Assign default options to MongoDb
      Object.assign(opts, DefaultConfig.db);

      /**
       * If models already exist, continue
       */
      if (!_.isEmpty(this.models)) {
        return Promise.resolve();
      }

      try {
        //Create instance mongoose
        this.$mongod = await mongoose
          .createConnection(mongoUrl, opts)
          .asPromise();

        /**
         * Create each model instance and assign to parent service
         */
        _.forEach(
          modelSchemas,
          (
            /**
             * @type {{name: string, schema: Object, options: object}}
             */
            model
          ) => {
            /**
             * States
             */
            let schemaModel;

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

            /**
             * Assign custom options to model
             * and merge with default options
             */
            if (model.options) {
              model.options = { ...DefaultConfig.model, ...model.options };
              //Define default options
            } else model.options = DefaultConfig.model;

            //Create schema model
            schemaModel = new mongoose.Schema(model.schema, model.options);

            //Create model
            schemaModel = this.$mongod.model(model.name, schemaModel);

            //Assign to the service parent
            _.set(this.models, model.name, schemaModel);
          }
        );

        this.logger.info(
          `moleculer-db-mongoose: ${this.schema.name} Connection has been established successfully`
        );

        return Promise.resolve();
      } catch (err) {
        //Close connection db
        if (this.$mongod) {
          this.$mongod.close().finally(() => Promise.reject(err));
        }

        this.logger.error(err);
      }
    },
    /**
     * Service stop lifecycle event handler
     */
    async stopped() {
      //Close connection db
      if (this.$mongod) {
        this.$mongod.close();
      }

      return Promise.resolve();
    },
  };
};
