/**
 * Mine Sites Routes
 */

const express = require('express');
const router = express.Router();
const mineSitesService = require('../services/mine-sites');
const { validateRequest } = require('../middleware/validation');

// List mine sites
router.get('/', (req, res, next) => {
  try {
    const filters = {
      address_country: req.query.address_country,
      certification_status: req.query.certification_status ? parseInt(req.query.certification_status) : undefined,
      activity_status: req.query.activity_status ? parseInt(req.query.activity_status) : undefined,
      mineral: req.query.mineral
    };

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const result = mineSitesService.list(filters, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get mine site by ID
router.get('/:icglr_id', (req, res, next) => {
  try {
    const mineSite = mineSitesService.getById(req.params.icglr_id);
    res.json(mineSite);
  } catch (error) {
    next(error);
  }
});

// Create mine site
router.post('/', validateRequest('mine-site'), (req, res, next) => {
  try {
    const mineSite = mineSitesService.create(req.body);
    res.status(201).json(mineSite);
  } catch (error) {
    next(error);
  }
});

// Update mine site
router.put('/:icglr_id', validateRequest('mine-site'), (req, res, next) => {
  try {
    const mineSite = mineSitesService.update(req.params.icglr_id, req.body);
    res.json(mineSite);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
