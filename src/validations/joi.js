const BaseValidator = require('moleculer').Validators.Base;
const { ValidationError } = require('moleculer').Errors;

class JoiValidator extends BaseValidator {
  constructor() {
    super();

    this.Joi = require('joi');
  }

  compile(schema) {
    if (!this.Joi.isSchema(schema)) {
      throw new ValidationError('Not Joi Schema', null, {
        message: 'No Schema Joi',
      });
    }

    return (params) => this.validate(params, schema);
  }

  validate(params, schema) {
    const { error } = schema.validate(params, {
      abortEarly: true,
    });

    if (error) throw new ValidationError(error.message, null, error.details);

    return true;
  }
}

module.exports = JoiValidator;
