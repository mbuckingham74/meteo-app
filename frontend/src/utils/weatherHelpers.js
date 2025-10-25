/**
 * Weather helper utilities
 */

/**
 * Convert Celsius to Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 */
export function celsiusToFahrenheit(celsius) {
  return (celsius * 9/5) + 32;
}

/**
 * Convert Fahrenheit to Celsius
 * @param {number} fahrenheit - Temperature in Fahrenheit
 * @returns {number} Temperature in Celsius
 */
export function fahrenheitToCelsius(fahrenheit) {
  return (fahrenheit - 32) * 5/9;
}

/**
 * Format temperature with unit
 * @param {number} temp - Temperature value
 * @param {string} unit - 'C' or 'F'
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted temperature
 */
export function formatTemperature(temp, unit = 'C', decimals = 1) {
  if (temp === null || temp === undefined) return '--';
  const value = unit === 'F' ? celsiusToFahrenheit(temp) : temp;
  return `${value.toFixed(decimals)}°${unit}`;
}

/**
 * Format date for display
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format date short (Mon, Day)
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
export function formatDateShort(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get day of week
 * @param {string} dateString - Date string
 * @returns {string} Day name
 */
export function getDayOfWeek(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Format precipitation
 * @param {number} precip - Precipitation in mm
 * @returns {string} Formatted precipitation
 */
export function formatPrecipitation(precip) {
  if (precip === null || precip === undefined) return '0 mm';
  return `${precip.toFixed(1)} mm`;
}

/**
 * Format wind speed
 * @param {number} speed - Wind speed in km/h
 * @returns {string} Formatted wind speed
 */
export function formatWindSpeed(speed) {
  if (speed === null || speed === undefined) return '--';
  return `${speed.toFixed(1)} km/h`;
}

/**
 * Get wind direction from degrees
 * @param {number} degrees - Wind direction in degrees (0-360)
 * @returns {string} Cardinal direction
 */
export function getWindDirection(degrees) {
  if (degrees === null || degrees === undefined) return '--';

  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Format humidity
 * @param {number} humidity - Humidity percentage
 * @returns {string} Formatted humidity
 */
export function formatHumidity(humidity) {
  if (humidity === null || humidity === undefined) return '--';
  return `${Math.round(humidity)}%`;
}

/**
 * Format pressure
 * @param {number} pressure - Pressure in hPa/mb
 * @returns {string} Formatted pressure
 */
export function formatPressure(pressure) {
  if (pressure === null || pressure === undefined) return '--';
  return `${Math.round(pressure)} mb`;
}

/**
 * Get weather icon emoji
 * @param {string} conditions - Weather condition string
 * @returns {string} Weather emoji
 */
export function getWeatherEmoji(conditions) {
  if (!conditions) return '☁️';

  const lower = conditions.toLowerCase();
  if (lower.includes('clear') || lower.includes('sunny')) return '☀️';
  if (lower.includes('partly cloudy')) return '⛅';
  if (lower.includes('cloudy') || lower.includes('overcast')) return '☁️';
  if (lower.includes('rain') || lower.includes('drizzle')) return '🌧️';
  if (lower.includes('snow')) return '❄️';
  if (lower.includes('thunder') || lower.includes('storm')) return '⛈️';
  if (lower.includes('fog') || lower.includes('mist')) return '🌫️';
  return '☁️';
}

/**
 * Calculate date range
 * @param {number} days - Number of days back from today
 * @returns {Object} { startDate, endDate } in YYYY-MM-DD format
 */
export function getDateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0]
  };
}

/**
 * Get month range for a specific month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {Object} { startDate, endDate }
 */
export function getMonthRange(year, month) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0]
  };
}
