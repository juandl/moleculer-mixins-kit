const BaseValidator = require('moleculer').Validators.Base;
const { ValidationError } = require('moleculer').Errors;

class JoiValidator extends BaseValidator {
  compile(schema) {
    return (params) => this.validate(params, schema);
  }

  validate(params, schema) {
    if (!schema.isSchema(schema)) {
      throw new ValidationError('Not Joi Schema', null, {
        message: 'No Schema Joi',
      });
    }

    const { error } = schema.validate(params, {
      abortEarly: true,
    });

    if (error) throw new ValidationError(error.message, null, error.details);

    return true;
  }
}

module.exports = JoiValidator;
