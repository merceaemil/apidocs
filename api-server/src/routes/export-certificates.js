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
      issuingCountry: req.query.issuingCountry,
      identifier: req.query.identifier,
      lotNumber: req.query.lotNumber,
      typeOfOre: req.query.typeOfOre,
      dateOfIssuanceFrom: req.query.dateOfIssuanceFrom,
      dateOfIssuanceTo: req.query.dateOfIssuanceTo
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
    if (!req.query.issuingCountry) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'issuingCountry query parameter is required',
        timestamp: new Date().toISOString()
      });
    }

    const certificate = exportCertificatesService.getById(
      req.params.identifier,
      req.query.issuingCountry
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
