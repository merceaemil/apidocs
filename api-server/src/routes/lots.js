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
      mine_site_id: req.query.mine_site_id,
      mineral: req.query.mineral,
      creator_role: req.query.creator_role ? parseInt(req.query.creator_role) : undefined,
      originating_operation: req.query.originating_operation ? parseInt(req.query.originating_operation) : undefined,
      lot_number: req.query.lot_number,
      timestamp_from: req.query.timestamp_from,
      timestamp_to: req.query.timestamp_to
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
router.get('/:lot_number', (req, res, next) => {
  try {
    const lot = lotsService.getById(req.params.lot_number);
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
