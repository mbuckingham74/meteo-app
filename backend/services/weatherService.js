const axios = require('axios');
const { withCache, CACHE_TTL } = require('./cacheService');

/**
 * Visual Crossing Weather API Service
 * Documentation: https://www.visualcrossing.com/weather-api
 */

const API_BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';
const API_KEY = process.env.VISUAL_CROSSING_API_KEY;

if (!API_KEY) {
  console.warn('⚠️  WARNING: VISUAL_CROSSING_API_KEY is not set in environment variables');
}

/**
 * Request throttling to prevent too many concurrent API calls
 */
const MAX_CONCURRENT_REQUESTS = 3;
const MIN_REQUEST_INTERVAL = 100; // ms between requests
let activeRequests = 0;
let lastRequestTime = 0;
const requestQueue = [];

/**
 * Throttle API requests to stay within rate limits
 * @param {Function} requestFn - Function that makes the API request
 * @returns {Promise<any>} Request result
 */
async function throttleRequest(requestFn) {
  // Wait if too many concurrent requests
  while (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Ensure minimum interval between requests
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }

  activeRequests++;
  lastRequestTime = Date.now();

  try {
    return await requestFn();
  } finally {
    activeRequests--;
  }
}

/**
 * Build Visual Crossing API URL
 * @param {string} location - City name, address, or lat,lon coordinates
 * @param {string} startDate - Start date (YYYY-MM-DD) or empty for current
 * @param {string} endDate - End date (YYYY-MM-DD) or empty
 * @param {object} options - Additional query parameters
 * @returns {string} Complete API URL
 */
function buildApiUrl(location, startDate = '', endDate = '', options = {}) {
  const encodedLocation = encodeURIComponent(location);

  let url = `${API_BASE_URL}/${encodedLocation}`;

  if (startDate) {
    url += `/${startDate}`;
    if (endDate) {
      url += `/${endDate}`;
    }
  }

  const params = new URLSearchParams({
    key: API_KEY,
    unitGroup: options.unitGroup || 'metric',
    include: options.include || 'days,hours,current,alerts',
    elements: options.elements || 'datetime,tempmax,tempmin,temp,feelslike,feelslikemax,feelslikemin,dew,humidity,precip,precipprob,snow,snowdepth,windspeed,winddir,pressure,cloudcover,visibility,uvindex,sunrise,sunset,moonphase,conditions,description,icon',
    contentType: 'json',
    ...options
  });

  return `${url}?${params.toString()}`;
}

/**
 * Make API request to Visual Crossing with retry logic and throttling
 * @param {string} url - Complete API URL
 * @param {number} retries - Number of retries (default: 2)
 * @param {number} delay - Initial delay in ms (default: 1000)
 * @returns {Promise<object>} API response data
 */
async function makeApiRequest(url, retries = 2, delay = 1000) {
  return throttleRequest(async () => {
    try {
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Accept': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data,
        queryCost: response.data.queryCost || 0
      };
    } catch (error) {
      const statusCode = error.response?.status || 0;

      // Handle rate limiting with exponential backoff
      if (statusCode === 429 && retries > 0) {
        // console.log(`⏳ Rate limit hit, retrying in ${delay}ms... (${retries} retries left)`); // Disabled: reduce log volume
        await new Promise(resolve => setTimeout(resolve, delay));
        return makeApiRequest(url, retries - 1, delay * 2); // Exponential backoff
      }

      console.error('Visual Crossing API Error:', error.message);

      if (error.response) {
        // API responded with error
        const errorMsg = statusCode === 429
          ? 'Rate limit exceeded. Please try again later or upgrade your API plan.'
          : error.response.data?.message || 'API request failed';

        return {
          success: false,
          error: errorMsg,
          statusCode: statusCode,
          rateLimitExceeded: statusCode === 429
        };
      } else if (error.request) {
        // No response received
        return {
          success: false,
          error: 'No response from Visual Crossing API',
          statusCode: 0
        };
      } else {
        // Request setup error
        return {
          success: false,
          error: error.message,
          statusCode: 0
        };
      }
    }
  });
}

/**
 * Test API connection
 * @returns {Promise<object>} Test result
 */
async function testApiConnection() {
  if (!API_KEY) {
    return {
      success: false,
      error: 'API key not configured'
    };
  }

  try {
    const url = buildApiUrl('New York,NY', '', '', {
      include: 'current',
      elements: 'temp,conditions'
    });

    const result = await makeApiRequest(url);

    if (result.success) {
      return {
        success: true,
        message: 'Visual Crossing API connection successful',
        location: result.data.resolvedAddress,
        currentTemp: result.data.currentConditions?.temp,
        queryCost: result.queryCost
      };
    } else {
      return result;
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get current weather conditions for a location
 * @param {string} location - City name, address, or coordinates
 * @returns {Promise<object>} Current weather data
 */
async function getCurrentWeather(location) {
  return withCache(
    'visual_crossing',
    { endpoint: 'current', location },
    async () => {
      const url = buildApiUrl(location, '', '', {
        include: 'current'
      });

      const result = await makeApiRequest(url);

      if (!result.success) {
        return result;
      }

      const data = result.data;
      const current = data.currentConditions;

      return {
        success: true,
        location: {
          address: data.resolvedAddress,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone
        },
        current: {
          datetime: current.datetime,
          temperature: current.temp,
          feelsLike: current.feelslike,
          humidity: current.humidity,
          precipitation: current.precip,
          snow: current.snow,
          windSpeed: current.windspeed,
          windDirection: current.winddir,
          pressure: current.pressure,
          cloudCover: current.cloudcover,
          visibility: current.visibility,
          uvIndex: current.uvindex,
          conditions: current.conditions,
          icon: current.icon
        },
        queryCost: result.queryCost
      };
    },
    CACHE_TTL.CURRENT_WEATHER
  );
}

/**
 * Get weather forecast for a location
 * @param {string} location - City name, address, or coordinates
 * @param {number} days - Number of forecast days (default: 7, max: 15)
 * @returns {Promise<object>} Forecast data
 */
async function getForecast(location, days = 7) {
  const today = new Date();
  const startDateStr = today.toISOString().split('T')[0];

  return withCache(
    'visual_crossing',
    { endpoint: 'forecast', location, days, date: startDateStr },
    async () => {
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + Math.min(days, 15));
      const endDateStr = endDate.toISOString().split('T')[0];

      const url = buildApiUrl(location, startDateStr, endDateStr, {
        include: 'days'
      });

      const result = await makeApiRequest(url);

      if (!result.success) {
        return result;
      }

      const data = result.data;

      return {
        success: true,
        location: {
          address: data.resolvedAddress,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone
        },
        forecast: data.days.map(day => ({
          date: day.datetime,
          tempMax: day.tempmax,
          tempMin: day.tempmin,
          tempAvg: day.temp,
          feelsLike: day.feelslike,
          humidity: day.humidity,
          precipitation: day.precip,
          precipProbability: day.precipprob,
          snow: day.snow,
          snowDepth: day.snowdepth,
          windSpeed: day.windspeed,
          windDirection: day.winddir,
          pressure: day.pressure,
          cloudCover: day.cloudcover,
          visibility: day.visibility,
          uvIndex: day.uvindex,
          sunrise: day.sunrise,
          sunset: day.sunset,
          conditions: day.conditions,
          description: day.description,
          icon: day.icon
        })),
        queryCost: result.queryCost
      };
    },
    CACHE_TTL.FORECAST
  );
}

/**
 * Get hourly weather forecast for a location
 * @param {string} location - City name, address, or coordinates
 * @param {number} hours - Number of forecast hours (default: 48, max: 240)
 * @returns {Promise<object>} Hourly forecast data
 */
async function getHourlyForecast(location, hours = 48) {
  const today = new Date();
  const endDate = new Date(today);
  const daysNeeded = Math.ceil(Math.min(hours, 240) / 24);
  endDate.setDate(today.getDate() + daysNeeded);

  const startDateStr = today.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  const url = buildApiUrl(location, startDateStr, endDateStr, {
    include: 'hours'
  });

  const result = await makeApiRequest(url);

  if (!result.success) {
    return result;
  }

  const data = result.data;

  // Flatten hours from all days
  const allHours = [];
  data.days.forEach(day => {
    if (day.hours) {
      day.hours.forEach(hour => {
        allHours.push({
          datetime: `${day.datetime}T${hour.datetime}`,
          date: day.datetime,
          time: hour.datetime,
          temperature: hour.temp,
          feelsLike: hour.feelslike,
          humidity: hour.humidity,
          precipitation: hour.precip,
          precipProbability: hour.precipprob,
          precipType: hour.preciptype,
          snow: hour.snow,
          windSpeed: hour.windspeed,
          windGust: hour.windgust,
          windDirection: hour.winddir,
          pressure: hour.pressure,
          cloudCover: hour.cloudcover,
          visibility: hour.visibility,
          uvIndex: hour.uvindex,
          solarRadiation: hour.solarradiation,
          solarEnergy: hour.solarenergy,
          dewPoint: hour.dew,
          conditions: hour.conditions,
          icon: hour.icon
        });
      });
    }
  });

  // Limit to requested hours
  const limitedHours = allHours.slice(0, hours);

  return {
    success: true,
    location: {
      address: data.resolvedAddress,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone
    },
    hourly: limitedHours,
    queryCost: result.queryCost
  };
}

/**
 * Get historical weather data for a location
 * @param {string} location - City name, address, or coordinates
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<object>} Historical weather data
 */
async function getHistoricalWeather(location, startDate, endDate) {
  const url = buildApiUrl(location, startDate, endDate, {
    include: 'days'
  });

  const result = await makeApiRequest(url);

  if (!result.success) {
    return result;
  }

  const data = result.data;

  return {
    success: true,
    location: {
      address: data.resolvedAddress,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone
    },
    historical: data.days.map(day => ({
      date: day.datetime,
      tempMax: day.tempmax,
      tempMin: day.tempmin,
      tempAvg: day.temp,
      feelsLike: day.feelslike,
      humidity: day.humidity,
      precipitation: day.precip,
      precipProbability: day.precipprob,
      snow: day.snow,
      snowDepth: day.snowdepth,
      windSpeed: day.windspeed,
      windDirection: day.winddir,
      pressure: day.pressure,
      cloudCover: day.cloudcover,
      visibility: day.visibility,
      uvIndex: day.uvindex,
      sunrise: day.sunrise,
      sunset: day.sunset,
      conditions: day.conditions,
      description: day.description,
      icon: day.icon
    })),
    queryCost: result.queryCost
  };
}

/**
 * Get historical weather data for a specific date (MM-DD) across multiple years
 * Example: Get weather for November 1st over the last 25 years
 *
 * @param {string} location - City name or coordinates
 * @param {string} date - Date in MM-DD format (e.g., "11-01")
 * @param {number} years - Number of years to retrieve (default: 25)
 * @returns {Promise<Object>} Historical weather data with statistics
 */
async function getHistoricalDateData(location, date, years = 25) {
  const cacheKey = `historical-date:${location}:${date}:${years}`;

  return withCache(cacheKey, async () => {
    const [month, day] = date.split('-');
    const currentYear = new Date().getFullYear();
    const historicalData = [];

    console.log(`📅 Fetching ${years} years of historical data for ${date} in ${location}...`);

    // Fetch data for each year in parallel (in batches to respect rate limits)
    const BATCH_SIZE = 3; // Match MAX_CONCURRENT_REQUESTS

    for (let i = 0; i < years; i += BATCH_SIZE) {
      const batch = [];

      for (let j = 0; j < BATCH_SIZE && (i + j) < years; j++) {
        const year = currentYear - i - j - 1; // Start from last year
        const fullDate = `${year}-${month}-${day}`;

        batch.push(
          (async () => {
            try {
              const url = buildApiUrl(location, fullDate, fullDate, {
                include: 'days',
                elements: 'datetime,tempmax,tempmin,temp,precip,precipprob,snow,conditions,description,icon'
              });

              const data = await makeApiRequest(url);

              if (data.days && data.days.length > 0) {
                return {
                  year,
                  date: fullDate,
                  ...data.days[0]
                };
              }
              return null;
            } catch (error) {
              console.error(`⚠️  Failed to fetch data for ${fullDate}:`, error.message);
              return null;
            }
          })()
        );
      }

      const batchResults = await Promise.all(batch);
      historicalData.push(...batchResults.filter(d => d !== null));

      // Small delay between batches
      if (i + BATCH_SIZE < years) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log(`✅ Retrieved ${historicalData.length}/${years} years of data`);

    // Calculate statistics
    const precipData = historicalData.map(d => d.precip || 0);
    const avgPrecip = precipData.reduce((sum, val) => sum + val, 0) / precipData.length;
    const maxPrecip = Math.max(...precipData);
    const minPrecip = Math.min(...precipData);

    return {
      location,
      date,
      years: historicalData.length,
      requestedYears: years,
      data: historicalData.sort((a, b) => b.year - a.year), // Most recent first
      statistics: {
        averagePrecipitation: avgPrecip,
        maxPrecipitation: maxPrecip,
        minPrecipitation: minPrecip,
        rainyDays: precipData.filter(p => p > 0.1).length, // Days with > 0.1mm rain
        rainyDayPercentage: (precipData.filter(p => p > 0.1).length / precipData.length * 100).toFixed(1)
      }
    };
  }, CACHE_TTL.HISTORICAL); // 7 days cache
}

module.exports = {
  testApiConnection,
  getCurrentWeather,
  getForecast,
  getHourlyForecast,
  getHistoricalWeather,
  getHistoricalDateData
};
