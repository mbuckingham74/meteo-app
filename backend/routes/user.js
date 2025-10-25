const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getUserPreferences,
  updateUserPreferences
} = require('../services/userPreferencesService');
const {
  getUserFavorites,
  addFavorite,
  removeFavorite,
  reorderFavorites,
  importFavorites,
  clearAllFavorites
} = require('../services/userFavoritesService');

/**
 * User Preferences and Favorites Routes
 * All routes require authentication
 */

// ==================== PREFERENCES ====================

/**
 * GET /api/user/preferences
 * Get user preferences
 */
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const preferences = await getUserPreferences(req.user.userId);

    res.json({ preferences });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      error: 'Failed to fetch preferences'
    });
  }
});

/**
 * PUT /api/user/preferences
 * Update user preferences
 */
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;

    const preferences = await updateUserPreferences(req.user.userId, updates);

    res.json({
      message: 'Preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      error: 'Failed to update preferences'
    });
  }
});

// ==================== FAVORITES ====================

/**
 * GET /api/user/favorites
 * Get user favorites
 */
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const favorites = await getUserFavorites(req.user.userId);

    res.json({ favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      error: 'Failed to fetch favorites'
    });
  }
});

/**
 * POST /api/user/favorites
 * Add a favorite location
 */
router.post('/favorites', authenticateToken, async (req, res) => {
  try {
    const { location_name, latitude, longitude, address, timezone } = req.body;

    // Validation
    if (!location_name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        error: 'Location name, latitude, and longitude are required'
      });
    }

    const favorite = await addFavorite(req.user.userId, {
      location_name,
      latitude,
      longitude,
      address,
      timezone
    });

    res.status(201).json({
      message: 'Favorite added successfully',
      favorite
    });
  } catch (error) {
    console.error('Add favorite error:', error);

    if (error.message === 'Location already in favorites') {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({
      error: 'Failed to add favorite'
    });
  }
});

/**
 * DELETE /api/user/favorites/:id
 * Remove a favorite location
 */
router.delete('/favorites/:id', authenticateToken, async (req, res) => {
  try {
    const favoriteId = parseInt(req.params.id);

    await removeFavorite(req.user.userId, favoriteId);

    res.json({
      message: 'Favorite removed successfully'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);

    if (error.message === 'Favorite not found') {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({
      error: 'Failed to remove favorite'
    });
  }
});

/**
 * PUT /api/user/favorites/reorder
 * Reorder favorites
 */
router.put('/favorites/reorder', authenticateToken, async (req, res) => {
  try {
    const { favoriteIds } = req.body;

    if (!Array.isArray(favoriteIds)) {
      return res.status(400).json({
        error: 'favoriteIds must be an array'
      });
    }

    const favorites = await reorderFavorites(req.user.userId, favoriteIds);

    res.json({
      message: 'Favorites reordered successfully',
      favorites
    });
  } catch (error) {
    console.error('Reorder favorites error:', error);
    res.status(500).json({
      error: 'Failed to reorder favorites'
    });
  }
});

/**
 * POST /api/user/favorites/import
 * Import favorites from localStorage
 */
router.post('/favorites/import', authenticateToken, async (req, res) => {
  try {
    const { favorites } = req.body;

    if (!Array.isArray(favorites)) {
      return res.status(400).json({
        error: 'favorites must be an array'
      });
    }

    const result = await importFavorites(req.user.userId, favorites);

    res.json({
      message: 'Favorites imported successfully',
      ...result
    });
  } catch (error) {
    console.error('Import favorites error:', error);
    res.status(500).json({
      error: 'Failed to import favorites'
    });
  }
});

/**
 * DELETE /api/user/favorites
 * Clear all favorites
 */
router.delete('/favorites', authenticateToken, async (req, res) => {
  try {
    await clearAllFavorites(req.user.userId);

    res.json({
      message: 'All favorites cleared successfully'
    });
  } catch (error) {
    console.error('Clear favorites error:', error);
    res.status(500).json({
      error: 'Failed to clear favorites'
    });
  }
});

module.exports = router;
