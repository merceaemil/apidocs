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
      addressCountry: req.query.addressCountry,
      certificationStatus: req.query.certificationStatus ? parseInt(req.query.certificationStatus) : undefined,
      activityStatus: req.query.activityStatus ? parseInt(req.query.activityStatus) : undefined,
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
router.get('/:icglrId', (req, res, next) => {
  try {
    const mineSite = mineSitesService.getById(req.params.icglrId);
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
router.put('/:icglrId', validateRequest('mine-site'), (req, res, next) => {
  try {
    const mineSite = mineSitesService.update(req.params.icglrId, req.body);
    res.json(mineSite);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
