const express = require('express');
const router = express.Router();
const locationService = require('../services/locationService');

/**
 * Search locations by name
 * GET /api/locations/search?q=London&limit=10
 */
router.get('/search', async (req, res) => {
  try {
    const { q, limit } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const maxLimit = parseInt(limit) || 10;
    const locations = await locationService.searchLocations(q, maxLimit);

    res.json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all locations (paginated)
 * GET /api/locations?limit=50&offset=0
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    if (limit > 500) {
      return res.status(400).json({
        success: false,
        error: 'Limit cannot exceed 500'
      });
    }

    const locations = await locationService.getAllLocations(limit, offset);

    res.json({
      success: true,
      count: locations.length,
      limit,
      offset,
      locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get location by ID
 * GET /api/locations/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const locationId = parseInt(id);

    if (isNaN(locationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid location ID'
      });
    }

    const location = await locationService.findLocationById(locationId);

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    res.json({
      success: true,
      location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create new location
 * POST /api/locations
 * Body: { city_name, country, latitude, longitude, ... }
 */
router.post('/', async (req, res) => {
  try {
    const { city_name, country, latitude, longitude } = req.body;

    // Validate required fields
    if (!city_name || !country || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Required fields: city_name, country, latitude, longitude'
      });
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates'
      });
    }

    const location = await locationService.createLocation(req.body);

    res.status(201).json({
      success: true,
      location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update location
 * PATCH /api/locations/:id
 * Body: { city_name?, country?, timezone?, ... }
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const locationId = parseInt(id);

    if (isNaN(locationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid location ID'
      });
    }

    const location = await locationService.updateLocation(locationId, req.body);

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    res.json({
      success: true,
      location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Delete location
 * DELETE /api/locations/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const locationId = parseInt(id);

    if (isNaN(locationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid location ID'
      });
    }

    const deleted = await locationService.deleteLocation(locationId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    res.json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
