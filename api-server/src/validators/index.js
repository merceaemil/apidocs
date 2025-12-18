/**
 * Validator wrapper for API server
 * Provides access to the schema validator from the root conformance directory
 */

const path = require('path');
const validator = require(path.join(__dirname, '../../../conformance/validators/schema-validator'));

module.exports = validator;

