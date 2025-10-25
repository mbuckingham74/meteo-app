const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');

/**
 * Test Visual Crossing API connection
 * GET /api/weather/test
 */
router.get('/test', async (req, res) => {
  try {
    const result = await weatherService.testApiConnection();

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          location: result.location,
          currentTemp: result.currentTemp,
          queryCost: result.queryCost
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get current weather for a location
 * GET /api/weather/current/:location
 * Example: /api/weather/current/London,UK
 */
router.get('/current/:location', async (req, res) => {
  try {
    const { location } = req.params;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    const result = await weatherService.getCurrentWeather(location);

    if (result.success) {
      res.json(result);
    } else {
      res.status(result.statusCode || 500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get weather forecast for a location
 * GET /api/weather/forecast/:location?days=7
 * Example: /api/weather/forecast/Paris,France?days=5
 */
router.get('/forecast/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const days = parseInt(req.query.days) || 7;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    if (days < 1 || days > 15) {
      return res.status(400).json({
        success: false,
        error: 'Days must be between 1 and 15'
      });
    }

    const result = await weatherService.getForecast(location, days);

    if (result.success) {
      res.json(result);
    } else {
      res.status(result.statusCode || 500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get historical weather data for a location
 * GET /api/weather/historical/:location?start=2023-01-01&end=2023-12-31
 * Example: /api/weather/historical/Tokyo,Japan?start=2024-01-01&end=2024-01-31
 */
router.get('/historical/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const { start, end } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        error: 'Start and end date parameters are required (format: YYYY-MM-DD)'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start) || !dateRegex.test(end)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    const result = await weatherService.getHistoricalWeather(location, start, end);

    if (result.success) {
      res.json(result);
    } else {
      res.status(result.statusCode || 500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
