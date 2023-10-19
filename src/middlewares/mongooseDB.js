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
  console.error(
    'To use mongoose middleware, you have to install some dependencies'
  );
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
           * @type {MoleculerMixinsKit.ModelSchemaMongoose}
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

            /**
             * Assign discriminators (key)
             */
            if (!_.isEmpty(model.discriminator)) {
              _.set(model.options, 'discriminatorKey', 'type');
            }

            //Create schema model
            schema = new mongoose.Schema(model.schema, model.options);

            /**
             * Defined custom indexes
             * {indexes: [ { indexes: [], options } ]}
             */
            if (!_.isEmpty(model.indexes)) {
              _.forEach(model.indexes, (params) =>
                schema.index(params.indexes, params.options)
              );
            }

            /**
             * Assign plugin if has and expose broker.
             * {plugins: [ plugin ]}
             */
            if (!_.isEmpty(model.plugins)) {
              _.forEach(model.plugins, (plugin) =>
                schema.plugin(plugin, service.broker)
              );
            }

            /**
             * Create hooks model
             * {hooks: [ { type : string, preHandler: function, postHandler: function  } ]}
             */
            if (!_.isEmpty(model.hooks)) {
              /**
               * Create each hook
               */
              _.forEach(model.hooks, (hook) => {
                //if not type, skip it.
                if (!hook.type) return;

                let argOptions = {
                  broker: service.broker,
                };

                /**
                 * Pre Hook
                 * https://mongoosejs.com/docs/middleware.html#order
                 */
                if (hook.preHandler) {
                  schema.pre(hook.type, async function (next) {
                    //Assign args
                    Object.assign(argOptions, {
                      doc: this,
                      model: this.model,
                    });

                    await hook.preHandler(argOptions);

                    next();
                  });
                }

                /**
                 * Post Hook
                 * https://mongoosejs.com/docs/middleware.html#order
                 */
                if (hook.postHandler) {
                  schema.post(hook.type, async function (doc, next) {
                    //Assign args
                    Object.assign(argOptions, {
                      doc,
                      model: this.model,
                    });

                    if (this.getQuery) {
                      Object.assign(argOptions, { query: this.getQuery() });
                    }

                    await hook.postHandler(argOptions);

                    next();
                  });
                }
              });
            }

            /**
             * Assign virtuals if has
             * {virtuals: [ { name : string, options: object, actions: { get:function, set:function }  } ]}
             */
            if (!_.isEmpty(model.virtuals)) {
              _.forEach(model.virtuals, (virtual) => {
                //Generate virtual
                const virtualDefined = schema.virtual(
                  virtual.name,
                  virtual.options
                );

                //Add get action
                if (_.get(virtual, 'actions.get', null)) {
                  virtualDefined.get(virtual.actions.get);
                }

                //Add set action
                if (_.get(virtual, 'actions.set', null)) {
                  virtualDefined.set(virtual.actions.set);
                }
              });
            }

            //Create model
            schema = $mongod.model(model.name, schema);

            /**
             * Assign discriminators, create schema and assign to parent schema
             * {discriminator: {key: string, schemas: { [key]: schema }}}
             */
            if (!_.isEmpty(model.discriminator)) {
              /**
               * Create each model separated
               */
              _.forEach(model.discriminator, (inherentScheme, name) => {
                /**
                 * Discriminator model
                 */
                const inherent = schema.discriminator(
                  _.capitalize(name),
                  new mongoose.Schema(inherentScheme)
                );

                //Assign to the service parent
                _.set(mongodb, `${model.name}:${name}`, inherent);
              });
            }

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
