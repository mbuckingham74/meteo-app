/**
 * AI Weather Analysis Service
 * Uses Claude API (Anthropic) to analyze weather data and answer natural language questions
 */

const Anthropic = require('@anthropic-ai/sdk');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.METEO_ANTHROPIC_API_KEY
});

const MODEL = 'claude-sonnet-4-20250514';

/**
 * Validate that a user query is a legitimate weather question
 * Quick, low-cost validation before expensive parsing
 *
 * @param {string} query - User's natural language question
 * @param {Object} weatherData - Current weather/forecast data for context
 * @returns {Promise<Object>} { isValid: boolean, reason: string }
 */
async function validateWeatherQuery(query, weatherData) {
  const systemPrompt = `You are a query validator for a weather application. Determine if the user's question is a legitimate weather-related query.

Valid queries include:
- Weather conditions (rain, snow, temperature, wind, etc.)
- Forecast questions (will it rain, when is the warmest day, etc.)
- Weather planning (should I bring an umbrella, good day for outdoor activities, etc.)
- Weather comparisons (warmer than yesterday, colder next week, etc.)

Invalid queries include:
- Spam or nonsense
- Unrelated topics (politics, sports, general knowledge, etc.)
- Personal questions unrelated to weather
- Harmful or malicious content

Respond with ONLY a JSON object: { "isValid": true/false, "reason": "brief explanation" }`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 200,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Query: "${query}"\n\nWeather context: ${weatherData.location.address}, Current: ${weatherData.current.conditions}, ${weatherData.current.temperature}°C`
      }]
    });

    const responseText = message.content[0].text.trim();

    // Strip markdown code blocks if present
    let jsonText = responseText;
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const result = JSON.parse(jsonText);

    return {
      isValid: result.isValid === true,
      reason: result.reason || 'Unknown',
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens
    };
  } catch (error) {
    console.error('Error validating weather query:', error);
    throw new Error('Failed to validate query: ' + error.message);
  }
}

/**
 * Analyze weather data and answer a natural language question
 *
 * @param {string} query - User's natural language question
 * @param {Object} weatherData - Complete weather data (current, forecast, location)
 * @returns {Promise<Object>} { answer: string, confidence: string, tokensUsed: number }
 */
async function analyzeWeatherQuestion(query, weatherData) {
  const systemPrompt = `You are Meteo Weather AI, an expert weather analyst. Answer weather questions based on the provided data.

Guidelines:
- Be concise and direct (2-3 sentences)
- Use natural, conversational language
- Include specific data (temperatures, percentages, times)
- If data is insufficient, say so clearly
- Focus on actionable insights
- Use the user's preferred temperature unit

Weather Data Available:
${JSON.stringify(weatherData, null, 2)}`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: query
      }]
    });

    const answer = message.content[0].text.trim();

    return {
      answer,
      confidence: 'high', // Could be enhanced with actual confidence scoring
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
      model: MODEL
    };
  } catch (error) {
    console.error('Error analyzing weather question:', error);
    throw new Error('Failed to analyze weather: ' + error.message);
  }
}

module.exports = {
  validateWeatherQuery,
  analyzeWeatherQuestion
};
