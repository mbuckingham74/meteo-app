/**
 * Weather Spark-style color scales
 */

/**
 * Temperature color bands (Weather Spark style)
 * @param {number} temp - Temperature in Celsius
 * @returns {string} Color hex code
 */
export function getTemperatureColor(temp) {
  if (temp < 0) return '#1e3a8a';      // Frigid - Deep Blue
  if (temp < 10) return '#3b82f6';     // Cold - Blue
  if (temp < 15) return '#60a5fa';     // Cool - Light Blue
  if (temp < 25) return '#10b981';     // Comfortable - Green
  if (temp < 30) return '#fbbf24';     // Warm - Yellow
  if (temp < 35) return '#f97316';     // Hot - Orange
  return '#dc2626';                     // Sweltering - Red
}

/**
 * Get temperature band name
 * @param {number} temp - Temperature in Celsius
 * @returns {string} Band name
 */
export function getTemperatureBand(temp) {
  if (temp < 0) return 'Frigid';
  if (temp < 10) return 'Cold';
  if (temp < 15) return 'Cool';
  if (temp < 25) return 'Comfortable';
  if (temp < 30) return 'Warm';
  if (temp < 35) return 'Hot';
  return 'Sweltering';
}

/**
 * Temperature bands for area chart
 */
export const TEMPERATURE_BANDS = [
  { name: 'Frigid', min: -40, max: 0, color: '#1e3a8a' },
  { name: 'Cold', min: 0, max: 10, color: '#3b82f6' },
  { name: 'Cool', min: 10, max: 15, color: '#60a5fa' },
  { name: 'Comfortable', min: 15, max: 25, color: '#10b981' },
  { name: 'Warm', min: 25, max: 30, color: '#fbbf24' },
  { name: 'Hot', min: 30, max: 35, color: '#f97316' },
  { name: 'Sweltering', min: 35, max: 50, color: '#dc2626' }
];

/**
 * Precipitation colors
 */
export const PRECIPITATION_COLORS = {
  rain: '#3b82f6',      // Blue
  snow: '#e0f2fe',      // Light blue/white
  mixed: '#8b5cf6',     // Purple
  probability: '#f97316' // Orange (changed from gray for better visibility)
};

/**
 * Weather metric colors
 */
export const METRIC_COLORS = {
  temperature: '#ef4444',
  feelsLike: '#f97316',
  humidity: '#06b6d4',
  precipitation: '#3b82f6',
  cloudCover: '#94a3b8',
  uvIndex: '#eab308',
  windSpeed: '#10b981',
  pressure: '#8b5cf6'
};

/**
 * Get UV Index color
 * @param {number} uvIndex - UV Index value (0-11+)
 * @returns {string} Color hex code
 */
export function getUVIndexColor(uvIndex) {
  if (uvIndex < 3) return '#10b981';   // Low - Green
  if (uvIndex < 6) return '#fbbf24';   // Moderate - Yellow
  if (uvIndex < 8) return '#f97316';   // High - Orange
  if (uvIndex < 11) return '#dc2626';  // Very High - Red
  return '#7c2d12';                     // Extreme - Dark Red
}

/**
 * Get cloud cover color
 * @param {number} cloudCover - Cloud cover percentage (0-100)
 * @returns {string} Color hex code
 */
export function getCloudCoverColor(cloudCover) {
  if (cloudCover < 20) return '#60a5fa';  // Clear - Light blue
  if (cloudCover < 50) return '#94a3b8';  // Partly cloudy - Light gray
  if (cloudCover < 80) return '#64748b';  // Mostly cloudy - Gray
  return '#475569';                        // Overcast - Dark gray
}

/**
 * Get wind speed color
 * @param {number} windSpeed - Wind speed in km/h
 * @returns {string} Color hex code
 */
export function getWindSpeedColor(windSpeed) {
  if (windSpeed < 10) return '#10b981';   // Calm - Green
  if (windSpeed < 30) return '#fbbf24';   // Light - Yellow
  if (windSpeed < 50) return '#f97316';   // Moderate - Orange
  if (windSpeed < 70) return '#dc2626';   // Strong - Red
  return '#7c2d12';                        // Gale - Dark Red
}
