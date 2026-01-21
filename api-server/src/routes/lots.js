/**
 * Lots Routes
 */

const express = require('express');
const router = express.Router();
const lotsService = require('../services/lots');
const { validateRequest } = require('../middleware/validation');

// List lots
router.get('/', (req, res, next) => {
  try {
    const filters = {
      mineSiteId: req.query.mineSiteId,
      mineral: req.query.mineral,
      creatorRole: req.query.creatorRole ? parseInt(req.query.creatorRole) : undefined,
      originatingOperation: req.query.originatingOperation ? parseInt(req.query.originatingOperation) : undefined,
      lotNumber: req.query.lotNumber,
      dateRegistrationFrom: req.query.dateRegistrationFrom,
      dateRegistrationTo: req.query.dateRegistrationTo
    };

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const result = lotsService.list(filters, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get lot by ID
router.get('/:lotNumber', (req, res, next) => {
  try {
    const lot = lotsService.getById(req.params.lotNumber);
    res.json(lot);
  } catch (error) {
    next(error);
  }
});

// Create lot
router.post('/', validateRequest('lot'), (req, res, next) => {
  try {
    const lot = lotsService.create(req.body);
    res.status(201).json(lot);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
