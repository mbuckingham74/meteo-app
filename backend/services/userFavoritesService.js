const { pool } = require('../config/database');

/**
 * User Favorites Service
 * Handles cloud-based favorite locations for authenticated users
 */

/**
 * Get user favorites
 */
async function getUserFavorites(userId) {
  try {
    const [favorites] = await pool.query(
      `SELECT
        id,
        location_name,
        latitude,
        longitude,
        address,
        timezone,
        display_order,
        created_at
      FROM user_favorites
      WHERE user_id = ?
      ORDER BY display_order ASC, created_at ASC`,
      [userId]
    );

    return favorites;
  } catch (error) {
    console.error('Get favorites error:', error);
    throw error;
  }
}

/**
 * Add favorite location
 */
async function addFavorite(userId, locationData) {
  try {
    const { location_name, latitude, longitude, address, timezone } = locationData;

    // Check if favorite already exists
    const [existing] = await pool.query(
      'SELECT id FROM user_favorites WHERE user_id = ? AND latitude = ? AND longitude = ?',
      [userId, latitude, longitude]
    );

    if (existing.length > 0) {
      throw new Error('Location already in favorites');
    }

    // Get next display order
    const [maxOrder] = await pool.query(
      'SELECT MAX(display_order) as max_order FROM user_favorites WHERE user_id = ?',
      [userId]
    );

    const displayOrder = (maxOrder[0].max_order || 0) + 1;

    const [result] = await pool.query(
      `INSERT INTO user_favorites
        (user_id, location_name, latitude, longitude, address, timezone, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, location_name, latitude, longitude, address, timezone, displayOrder]
    );

    return {
      id: result.insertId,
      location_name,
      latitude,
      longitude,
      address,
      timezone,
      display_order: displayOrder
    };
  } catch (error) {
    console.error('Add favorite error:', error);
    throw error;
  }
}

/**
 * Remove favorite location
 */
async function removeFavorite(userId, favoriteId) {
  try {
    const [result] = await pool.query(
      'DELETE FROM user_favorites WHERE id = ? AND user_id = ?',
      [favoriteId, userId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Favorite not found');
    }

    return { success: true };
  } catch (error) {
    console.error('Remove favorite error:', error);
    throw error;
  }
}

/**
 * Reorder favorites
 */
async function reorderFavorites(userId, favoriteIds) {
  try {
    // Update display_order for each favorite
    const promises = favoriteIds.map((id, index) => {
      return pool.query(
        'UPDATE user_favorites SET display_order = ? WHERE id = ? AND user_id = ?',
        [index + 1, id, userId]
      );
    });

    await Promise.all(promises);

    return await getUserFavorites(userId);
  } catch (error) {
    console.error('Reorder favorites error:', error);
    throw error;
  }
}

/**
 * Import favorites from array (for localStorage migration)
 */
async function importFavorites(userId, favoritesArray) {
  try {
    const imported = [];
    const errors = [];

    for (const favorite of favoritesArray) {
      try {
        const result = await addFavorite(userId, favorite);
        imported.push(result);
      } catch (error) {
        // Skip duplicates
        if (error.message !== 'Location already in favorites') {
          errors.push({ favorite, error: error.message });
        }
      }
    }

    return {
      imported,
      errors,
      count: imported.length
    };
  } catch (error) {
    console.error('Import favorites error:', error);
    throw error;
  }
}

/**
 * Clear all favorites
 */
async function clearAllFavorites(userId) {
  try {
    await pool.query(
      'DELETE FROM user_favorites WHERE user_id = ?',
      [userId]
    );

    return { success: true };
  } catch (error) {
    console.error('Clear favorites error:', error);
    throw error;
  }
}

module.exports = {
  getUserFavorites,
  addFavorite,
  removeFavorite,
  reorderFavorites,
  importFavorites,
  clearAllFavorites
};
