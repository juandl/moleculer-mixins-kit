const BaseValidator = require('moleculer').Validators.Base;
const { ValidationError } = require('moleculer').Errors;

const _ = require('lodash');

class JoiValidator extends BaseValidator {
  constructor() {
    super();

    this.Joi = require('joi');
  }
  compile(schema) {
    return (params) => this.validate(params, schema);
  }

  /**
   * Clean messages
   * From "\"name\" is required"
   * to "name is required"
   * @param {string} msg
   * @returns {string}
   */
  cleanMessage(msg) {
    if (!msg) return '';

    return _.replace(msg, /([^\w\d\s])+/g, '');
  }

  validate(params, schema) {
    let errors = [];

    if (!this.Joi.isSchema(schema)) {
      throw new ValidationError('Not Joi Schema', null, {
        message: 'No Schema Joi',
      });
    }

    const { error } = schema.validate(params, {
      abortEarly: true,
    });

    if (!_.isEmpty(error)) {
      /**
       * Create Custom Error
       */
      if (error.details) {
        _.forEach(error.details, (value) => {
          let errorObj = {
            type: null,
            field: null,
            uid: null,
            message: null,
          };

          //Assign type
          if (value.type) {
            errorObj.type = value.type;
          }

          //Assign field name
          if (value.context) {
            errorObj.field = value.context.key;
          }

          //Assign message error
          if (value.message) {
            errorObj.message = this.cleanMessage(value.message);
          }

          //Create uid
          if (errorObj.type && errorObj.field) {
            errorObj.uid = `${errorObj.field}.${errorObj.type}`;
          }

          errors.push(errorObj);
        });
      }

      /**
       * Return errors
       */
      if (error) {
        throw new ValidationError(
          this.cleanMessage(error.message),
          null,
          errors
        );
      }
    }

    return true;
  }
}

module.exports = JoiValidator;
