/**
 * AI Weather Analysis Routes
 * Endpoints for AI-powered weather question answering
 */

const express = require('express');
const router = express.Router();
const { validateWeatherQuery, analyzeWeatherQuestion } = require('../services/aiWeatherAnalysisService');
const { getCurrentWeather, getForecast } = require('../services/weatherService');

/**
 * POST /api/ai-weather/validate
 * Quick validation of user query before expensive analysis
 */
router.post('/validate', async (req, res) => {
  try {
    const { query, location } = req.body;

    if (!query || !location) {
      return res.status(400).json({ error: 'Query and location are required' });
    }

    // Fetch minimal weather data for validation context
    const weatherData = await getCurrentWeather(location);

    const validation = await validateWeatherQuery(query, weatherData);

    res.json({
      isValid: validation.isValid,
      reason: validation.reason,
      tokensUsed: validation.tokensUsed
    });
  } catch (error) {
    console.error('Error validating query:', error);
    res.status(500).json({ error: error.message || 'Failed to validate query' });
  }
});

/**
 * POST /api/ai-weather/analyze
 * Analyze weather data and answer user's question
 */
router.post('/analyze', async (req, res) => {
  try {
    const { query, location, days = 7 } = req.body;

    if (!query || !location) {
      return res.status(400).json({ error: 'Query and location are required' });
    }

    // Fetch comprehensive weather data
    const [currentWeather, forecast] = await Promise.all([
      getCurrentWeather(location),
      getForecast(location, days)
    ]);

    const weatherData = {
      location: currentWeather.location,
      current: currentWeather.current,
      forecast: forecast.forecast,
      queriedAt: new Date().toISOString()
    };

    const analysis = await analyzeWeatherQuestion(query, weatherData);

    res.json({
      query,
      answer: analysis.answer,
      confidence: analysis.confidence,
      weatherData: {
        location: weatherData.location.address,
        currentConditions: weatherData.current.conditions,
        temperature: weatherData.current.temperature,
        // Add coordinates for map centering
        coordinates: {
          lat: weatherData.location.latitude,
          lon: weatherData.location.longitude
        }
      },
      suggestedVisualizations: analysis.suggestedVisualizations || [], // NEW: Include visualization suggestions
      tokensUsed: analysis.tokensUsed,
      model: analysis.model,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing weather:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze weather' });
  }
});

module.exports = router;
