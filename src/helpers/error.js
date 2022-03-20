const { MoleculerError } = require('moleculer').Errors;

/**
 * Custom helper extends of calss molecule error
 */
class ErrorResponse extends MoleculerError {
  constructor(message, code, type, data) {
    super(message, code, type, data);
  }
}

module.exports = ErrorResponse;
