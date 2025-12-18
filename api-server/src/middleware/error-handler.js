/**
 * Error handling middleware
 */

function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Validation errors
  if (err.name === 'ValidationError' || err.validation) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: err.message || 'Request validation failed',
      details: err.details || err.errors || {},
      timestamp: new Date().toISOString()
    });
  }

  // Not found errors
  if (err.status === 404 || err.code === 'NOT_FOUND') {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: err.message || 'Resource not found',
      timestamp: new Date().toISOString()
    });
  }

  // Conflict errors
  if (err.status === 409 || err.code === 'CONFLICT') {
    return res.status(409).json({
      code: 'CONFLICT',
      message: err.message || 'Resource already exists',
      timestamp: new Date().toISOString()
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || 'An internal error occurred',
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;
