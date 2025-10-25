const express = require('express');
const router = express.Router();
const { getAirQuality } = require('../services/airQualityService');

/**
 * Air Quality Routes
 * Endpoints for retrieving air quality data
 */

/**
 * GET /api/air-quality
 * Get air quality data for a location by coordinates
 * Query parameters:
 *   - lat: latitude (required)
 *   - lon: longitude (required)
 *   - days: number of forecast days (optional, default: 5, max: 5)
 */
router.get('/', async (req, res) => {
  try {
    const { lat, lon, days } = req.query;

    // Validate required parameters
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required parameters'
      });
    }

    // Parse and validate coordinates
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude'
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        error: 'Latitude must be between -90 and 90'
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        error: 'Longitude must be between -180 and 180'
      });
    }

    // Get air quality data
    const forecastDays = days ? Math.min(parseInt(days), 5) : 5;
    const result = await getAirQuality(latitude, longitude, forecastDays);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(result.statusCode || 500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Air quality route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching air quality data'
    });
  }
});

/**
 * GET /api/air-quality/location/:location
 * Get air quality data for a location by name
 * Note: This is a convenience endpoint that could geocode the location first
 * For now, it requires lat/lon query params
 */
router.get('/location/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const { lat, lon, days } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude query parameters are required for this endpoint'
      });
    }

    // Parse coordinates
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude'
      });
    }

    // Get air quality data
    const forecastDays = days ? Math.min(parseInt(days), 5) : 5;
    const result = await getAirQuality(latitude, longitude, forecastDays);

    if (result.success) {
      res.json({
        success: true,
        location: location,
        data: result.data
      });
    } else {
      res.status(result.statusCode || 500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Air quality location route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching air quality data'
    });
  }
});

module.exports = router;
