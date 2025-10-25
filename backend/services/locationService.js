const { pool } = require('../config/database');

/**
 * Location Service
 * Manages location data in the database
 */

/**
 * Find location by ID
 * @param {number} id - Location ID
 * @returns {Promise<object|null>} Location data or null
 */
async function findLocationById(id) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM locations WHERE id = ?',
      [id]
    );

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Find location by ID error:', error.message);
    throw error;
  }
}

/**
 * Find location by coordinates
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {number} tolerance - Coordinate tolerance (default: 0.01 degrees)
 * @returns {Promise<object|null>} Location data or null
 */
async function findLocationByCoordinates(latitude, longitude, tolerance = 0.01) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM locations
       WHERE ABS(latitude - ?) < ? AND ABS(longitude - ?) < ?
       LIMIT 1`,
      [latitude, tolerance, longitude, tolerance]
    );

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Find location by coordinates error:', error.message);
    throw error;
  }
}

/**
 * Search locations by city name
 * @param {string} query - Search query
 * @param {number} limit - Maximum results (default: 10)
 * @returns {Promise<Array>} Array of matching locations
 */
async function searchLocations(query, limit = 10) {
  try {
    const searchTerm = `%${query}%`;
    const [rows] = await pool.query(
      `SELECT * FROM locations
       WHERE city_name LIKE ? OR country LIKE ?
       ORDER BY city_name
       LIMIT ?`,
      [searchTerm, searchTerm, limit]
    );

    return rows;
  } catch (error) {
    console.error('Search locations error:', error.message);
    throw error;
  }
}

/**
 * Get all locations
 * @param {number} limit - Maximum results (default: 100)
 * @param {number} offset - Offset for pagination (default: 0)
 * @returns {Promise<Array>} Array of locations
 */
async function getAllLocations(limit = 100, offset = 0) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM locations
       ORDER BY city_name
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return rows;
  } catch (error) {
    console.error('Get all locations error:', error.message);
    throw error;
  }
}

/**
 * Create new location
 * @param {object} locationData - Location data
 * @returns {Promise<object>} Created location with ID
 */
async function createLocation(locationData) {
  try {
    const {
      city_name,
      country,
      country_code,
      state,
      latitude,
      longitude,
      timezone,
      elevation
    } = locationData;

    // Check if location already exists
    const existing = await findLocationByCoordinates(latitude, longitude);
    if (existing) {
      return existing;
    }

    const [result] = await pool.query(
      `INSERT INTO locations
       (city_name, country, country_code, state, latitude, longitude, timezone, elevation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [city_name, country, country_code || null, state || null, latitude, longitude, timezone || null, elevation || null]
    );

    return {
      id: result.insertId,
      ...locationData
    };
  } catch (error) {
    console.error('Create location error:', error.message);
    throw error;
  }
}

/**
 * Update location
 * @param {number} id - Location ID
 * @param {object} updateData - Data to update
 * @returns {Promise<object|null>} Updated location or null
 */
async function updateLocation(id, updateData) {
  try {
    const allowedFields = ['city_name', 'country', 'country_code', 'state', 'timezone', 'elevation'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return await findLocationById(id);
    }

    values.push(id);

    await pool.query(
      `UPDATE locations SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return await findLocationById(id);
  } catch (error) {
    console.error('Update location error:', error.message);
    throw error;
  }
}

/**
 * Delete location
 * @param {number} id - Location ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteLocation(id) {
  try {
    const [result] = await pool.query(
      'DELETE FROM locations WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Delete location error:', error.message);
    throw error;
  }
}

/**
 * Get or create location from Visual Crossing response
 * @param {object} vcData - Visual Crossing location data
 * @returns {Promise<object>} Location from database
 */
async function getOrCreateFromVC(vcData) {
  try {
    // Try to find existing location
    const existing = await findLocationByCoordinates(
      vcData.latitude,
      vcData.longitude
    );

    if (existing) {
      return existing;
    }

    // Parse address to extract city and country
    const addressParts = vcData.resolvedAddress.split(',').map(s => s.trim());
    let city_name, country, state;

    if (addressParts.length >= 2) {
      city_name = addressParts[0];
      country = addressParts[addressParts.length - 1];
      if (addressParts.length > 2) {
        state = addressParts[1];
      }
    } else {
      city_name = vcData.resolvedAddress;
      country = 'Unknown';
    }

    // Create new location
    return await createLocation({
      city_name,
      country,
      country_code: null, // Visual Crossing doesn't provide this
      state,
      latitude: vcData.latitude,
      longitude: vcData.longitude,
      timezone: vcData.timezone,
      elevation: null // Not always provided
    });
  } catch (error) {
    console.error('Get or create from VC error:', error.message);
    throw error;
  }
}

module.exports = {
  findLocationById,
  findLocationByCoordinates,
  searchLocations,
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getOrCreateFromVC
};
