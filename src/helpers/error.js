const { MoleculerError } = require('moleculer').Errors;

/**
 * Custom helper extends of calss molecule error
 */
class ErrorResponse extends MoleculerError {
  constructor(name, message, code, type, data) {
    super(message, code, type, data);

    if (!name) {
      name = 'Error';
    }

    this.name = name;
  }
}

module.exports = ErrorResponse;
