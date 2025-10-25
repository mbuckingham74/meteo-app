const express = require('express');
const router = express.Router();
const {
  getCacheStats,
  clearExpiredCache,
  clearLocationCache
} = require('../services/cacheService');

/**
 * Cache Management Routes
 * Endpoints for monitoring and managing the API cache
 */

/**
 * GET /api/cache/stats
 * Get cache statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getCacheStats();

    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cache statistics'
    });
  }
});

/**
 * DELETE /api/cache/expired
 * Clear expired cache entries
 */
router.delete('/expired', async (req, res) => {
  try {
    const deletedCount = await clearExpiredCache();

    res.json({
      success: true,
      message: `Cleared ${deletedCount} expired cache entries`,
      deletedCount
    });
  } catch (error) {
    console.error('Cache cleanup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear expired cache'
    });
  }
});

/**
 * DELETE /api/cache/location/:locationId
 * Clear cache for a specific location
 */
router.delete('/location/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;

    if (!locationId || isNaN(locationId)) {
      return res.status(400).json({
        success: false,
        error: 'Valid location ID is required'
      });
    }

    const deletedCount = await clearLocationCache(parseInt(locationId));

    res.json({
      success: true,
      message: `Cleared ${deletedCount} cache entries for location ${locationId}`,
      deletedCount
    });
  } catch (error) {
    console.error('Location cache clear error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear location cache'
    });
  }
});

module.exports = router;
