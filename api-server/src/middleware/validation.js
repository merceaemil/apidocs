/**
 * Request validation middleware
 */

const validator = require('../../../conformance/validators/schema-validator');

function validateRequest(schemaName) {
  return (req, res, next) => {
    // Validate request body if present
    if (req.body && Object.keys(req.body).length > 0) {
      const result = validator.validate(req.body, schemaName);
      if (!result.valid) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: {
            errors: result.errors
          },
          timestamp: new Date().toISOString()
        });
      }
    }
    next();
  };
}

module.exports = { validateRequest };
