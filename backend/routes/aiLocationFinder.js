const express = require('express');
const router = express.Router();
const aiLocationFinderService = require('../services/aiLocationFinderService');

/**
 * Validate if a query is legitimate for location/climate search
 * POST /api/ai-location-finder/validate-query
 *
 * Body:
 * {
 *   "userInput": "I want somewhere 15 degrees cooler from June-October"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "isValid": true,
 *   "reason": "Valid climate preference query",
 *   "tokensUsed": 150
 * }
 */
router.post('/validate-query', async (req, res) => {
  try {
    const { userInput } = req.body;

    // Input validation
    if (!userInput || typeof userInput !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'userInput is required and must be a string'
      });
    }

    if (userInput.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'userInput cannot be empty'
      });
    }

    if (userInput.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'userInput must be less than 1000 characters'
      });
    }

    // Check if API key is configured
    if (!process.env.METEO_ANTHROPIC_API_KEY || process.env.METEO_ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
      return res.status(503).json({
        success: false,
        error: 'AI service is not configured. Please add METEO_ANTHROPIC_API_KEY to environment variables.'
      });
    }

    // Validate the query using Claude
    const result = await aiLocationFinderService.validateQuery(userInput);

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        isValid: false,
        reason: result.reason,
        tokensUsed: result.tokensUsed
      });
    }

    res.json({
      success: true,
      isValid: true,
      reason: result.reason,
      tokensUsed: result.tokensUsed
    });

  } catch (error) {
    console.error('[Validate Query Error]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate query',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Parse natural language location query into structured criteria
 * POST /api/ai-location-finder/parse-query
 *
 * Body:
 * {
 *   "userInput": "I currently live in New Smyrna Beach, FL. I want somewhere 15 degrees cooler from June-October, less humid, not rainy",
 *   "currentLocation": {
 *     "lat": 29.0258,
 *     "lng": -80.9270,
 *     "city": "New Smyrna Beach, FL"
 *   }
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "criteria": {
 *     "current_location": "New Smyrna Beach, FL",
 *     "time_period": { "start": "June", "end": "October" },
 *     "temperature_delta": -15,
 *     "humidity": "lower",
 *     "precipitation": "less",
 *     ...
 *   },
 *   "tokensUsed": 1500,
 *   "cost": "$0.0135"
 * }
 */
router.post('/parse-query', async (req, res) => {
  try {
    const { userInput, currentLocation } = req.body;

    // Input validation
    if (!userInput || typeof userInput !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'userInput is required and must be a string'
      });
    }

    if (userInput.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'userInput cannot be empty'
      });
    }

    if (userInput.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'userInput must be less than 2000 characters'
      });
    }

    // Check if API key is configured
    if (!process.env.METEO_ANTHROPIC_API_KEY || process.env.METEO_ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
      return res.status(503).json({
        success: false,
        error: 'AI service is not configured. Please add METEO_ANTHROPIC_API_KEY to environment variables.'
      });
    }

    // Validate current location if provided
    if (currentLocation) {
      if (typeof currentLocation !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'currentLocation must be an object'
        });
      }

      if (currentLocation.lat && (typeof currentLocation.lat !== 'number' || currentLocation.lat < -90 || currentLocation.lat > 90)) {
        return res.status(400).json({
          success: false,
          error: 'currentLocation.lat must be a number between -90 and 90'
        });
      }

      if (currentLocation.lng && (typeof currentLocation.lng !== 'number' || currentLocation.lng < -180 || currentLocation.lng > 180)) {
        return res.status(400).json({
          success: false,
          error: 'currentLocation.lng must be a number between -180 and 180'
        });
      }
    }

    // Parse the query using Claude
    const result = await aiLocationFinderService.parseLocationQuery(userInput, currentLocation);

    res.json({
      success: true,
      criteria: result.criteria,
      tokensUsed: result.tokensUsed,
      cost: result.cost
    });

  } catch (error) {
    console.error('[Parse Query Error]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to parse query',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
