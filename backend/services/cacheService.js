const { pool } = require('../config/database');
const crypto = require('crypto');

/**
 * API Response Cache Service
 * Caches API responses to reduce costs and improve performance
 */

/**
 * Cache TTL (Time To Live) in minutes
 */
const CACHE_TTL = {
  CURRENT_WEATHER: 15,      // 15 minutes
  FORECAST: 120,            // 2 hours
  HISTORICAL: 1440,         // 24 hours
  AIR_QUALITY: 30,          // 30 minutes
  CLIMATE_STATS: 10080      // 7 days
};

/**
 * Generate cache key from request parameters
 * @param {string} apiSource - API source identifier (e.g., 'visualcrossing')
 * @param {object} params - Request parameters
 * @returns {string} MD5 hash cache key
 */
function generateCacheKey(apiSource, params) {
  const paramsString = JSON.stringify(params);
  return crypto
    .createHash('md5')
    .update(`${apiSource}:${paramsString}`)
    .digest('hex');
}

/**
 * Get cached API response
 * @param {string} cacheKey - Cache key
 * @returns {Promise<object|null>} Cached data or null if not found/expired
 */
async function getCachedResponse(cacheKey) {
  try {
    const [rows] = await pool.query(
      'SELECT response_data, expires_at FROM api_cache WHERE cache_key = ? AND expires_at > NOW()',
      [cacheKey]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0].response_data;
  } catch (error) {
    console.error('Cache retrieval error:', error.message);
    return null;
  }
}

/**
 * Store API response in cache
 * @param {string} cacheKey - Cache key
 * @param {string} apiSource - API source identifier
 * @param {number|null} locationId - Location ID if applicable
 * @param {object} requestParams - Original request parameters
 * @param {object} responseData - API response data to cache
 * @param {number} ttlMinutes - Time to live in minutes
 * @returns {Promise<boolean>} Success status
 */
async function setCachedResponse(cacheKey, apiSource, locationId, requestParams, responseData, ttlMinutes) {
  try {
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await pool.query(
      `INSERT INTO api_cache (cache_key, location_id, api_source, request_params, response_data, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         response_data = VALUES(response_data),
         expires_at = VALUES(expires_at),
         created_at = NOW()`,
      [
        cacheKey,
        locationId,
        apiSource,
        JSON.stringify(requestParams),
        JSON.stringify(responseData),
        expiresAt
      ]
    );

    return true;
  } catch (error) {
    console.error('Cache storage error:', error.message);
    return false;
  }
}

/**
 * Delete expired cache entries
 * @returns {Promise<number>} Number of deleted entries
 */
async function clearExpiredCache() {
  try {
    const [result] = await pool.query(
      'DELETE FROM api_cache WHERE expires_at < NOW()'
    );

    return result.affectedRows || 0;
  } catch (error) {
    console.error('Cache cleanup error:', error.message);
    return 0;
  }
}

/**
 * Clear all cache for a specific location
 * @param {number} locationId - Location ID
 * @returns {Promise<number>} Number of deleted entries
 */
async function clearLocationCache(locationId) {
  try {
    const [result] = await pool.query(
      'DELETE FROM api_cache WHERE location_id = ?',
      [locationId]
    );

    return result.affectedRows || 0;
  } catch (error) {
    console.error('Location cache clear error:', error.message);
    return 0;
  }
}

/**
 * Get cache statistics
 * @returns {Promise<object>} Cache statistics
 */
async function getCacheStats() {
  try {
    const [stats] = await pool.query(`
      SELECT
        COUNT(*) as total_entries,
        SUM(CASE WHEN expires_at > NOW() THEN 1 ELSE 0 END) as active_entries,
        SUM(CASE WHEN expires_at <= NOW() THEN 1 ELSE 0 END) as expired_entries,
        COUNT(DISTINCT api_source) as api_sources,
        COUNT(DISTINCT location_id) as locations_cached
      FROM api_cache
    `);

    return stats[0] || {};
  } catch (error) {
    console.error('Cache stats error:', error.message);
    return {};
  }
}

/**
 * Wrapper function to cache API calls
 * @param {string} apiSource - API source identifier
 * @param {object} params - Request parameters
 * @param {Function} apiFunction - Function that makes the API call
 * @param {number} ttlMinutes - Cache TTL in minutes
 * @param {number|null} locationId - Location ID if applicable
 * @returns {Promise<object>} API response (from cache or fresh)
 */
async function withCache(apiSource, params, apiFunction, ttlMinutes = 60, locationId = null) {
  // Generate cache key
  const cacheKey = generateCacheKey(apiSource, params);

  // Try to get from cache first
  const cached = await getCachedResponse(cacheKey);
  if (cached) {
    console.log(`✓ Cache hit for ${apiSource}:`, params);
    return {
      ...cached,
      fromCache: true
    };
  }

  console.log(`✗ Cache miss for ${apiSource}:`, params);

  // Make API call
  const response = await apiFunction();

  // Only cache successful responses
  if (response && response.success) {
    await setCachedResponse(
      cacheKey,
      apiSource,
      locationId,
      params,
      response,
      ttlMinutes
    );
  }

  return {
    ...response,
    fromCache: false
  };
}

// Schedule automatic cleanup of expired cache entries every hour
setInterval(() => {
  clearExpiredCache().then(count => {
    if (count > 0) {
      console.log(`🧹 Auto cleanup: Removed ${count} expired cache entries`);
    }
  });
}, 60 * 60 * 1000); // 1 hour

module.exports = {
  generateCacheKey,
  getCachedResponse,
  setCachedResponse,
  clearExpiredCache,
  clearLocationCache,
  getCacheStats,
  withCache,
  CACHE_TTL
};
