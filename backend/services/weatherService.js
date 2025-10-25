const axios = require('axios');

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
    include: options.include || 'days,hours,current',
    elements: options.elements || 'datetime,tempmax,tempmin,temp,feelslike,humidity,precip,precipprob,snow,snowdepth,windspeed,winddir,pressure,cloudcover,visibility,uvindex,sunrise,sunset,conditions,description,icon',
    contentType: 'json',
    ...options
  });

  return `${url}?${params.toString()}`;
}

/**
 * Make API request to Visual Crossing
 * @param {string} url - Complete API URL
 * @returns {Promise<object>} API response data
 */
async function makeApiRequest(url) {
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
    console.error('Visual Crossing API Error:', error.message);

    if (error.response) {
      // API responded with error
      return {
        success: false,
        error: error.response.data?.message || 'API request failed',
        statusCode: error.response.status
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
}

/**
 * Get weather forecast for a location
 * @param {string} location - City name, address, or coordinates
 * @param {number} days - Number of forecast days (default: 7, max: 15)
 * @returns {Promise<object>} Forecast data
 */
async function getForecast(location, days = 7) {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + Math.min(days, 15));

  const startDateStr = today.toISOString().split('T')[0];
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

module.exports = {
  testApiConnection,
  getCurrentWeather,
  getForecast,
  getHourlyForecast,
  getHistoricalWeather
};
