/**
 * Export Certificates Routes
 */

const express = require('express');
const router = express.Router();
const exportCertificatesService = require('../services/export-certificates');
const { validateRequest } = require('../middleware/validation');

// List export certificates
router.get('/', (req, res, next) => {
  try {
    const filters = {
      issuing_country: req.query.issuing_country,
      identifier: req.query.identifier,
      lot_number: req.query.lot_number,
      type_of_ore: req.query.type_of_ore,
      date_of_issuance_from: req.query.date_of_issuance_from,
      date_of_issuance_to: req.query.date_of_issuance_to
    };

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const result = exportCertificatesService.list(filters, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get export certificate by ID
router.get('/:identifier', (req, res, next) => {
  try {
    if (!req.query.issuing_country) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'issuing_country query parameter is required',
        timestamp: new Date().toISOString()
      });
    }

    const certificate = exportCertificatesService.getById(
      req.params.identifier,
      req.query.issuing_country
    );
    res.json(certificate);
  } catch (error) {
    next(error);
  }
});

// Create export certificate
router.post('/', validateRequest('export-certificate'), (req, res, next) => {
  try {
    const certificate = exportCertificatesService.create(req.body);
    res.status(201).json(certificate);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
