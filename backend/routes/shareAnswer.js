/**
 * Share Answer Routes
 * Endpoints for creating and retrieving shareable AI answers
 */

const express = require('express');
const router = express.Router();
const { createShare, getSharedAnswer } = require('../services/shareService');

/**
 * POST /api/share/create
 * Create a shareable link for an AI answer
 */
router.post('/create', async (req, res) => {
  try {
    const answerData = req.body;

    // Validate required fields
    if (!answerData.question || !answerData.answer || !answerData.location) {
      return res.status(400).json({
        error: 'Missing required fields: question, answer, location'
      });
    }

    const shareResult = await createShare(answerData);

    res.json({
      success: true,
      ...shareResult
    });
  } catch (error) {
    console.error('Error creating share:', error);
    res.status(500).json({
      error: error.message || 'Failed to create shareable link'
    });
  }
});

/**
 * GET /api/share/:shareId
 * Retrieve a shared answer by ID
 */
router.get('/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;

    if (!shareId || shareId.length !== 10) {
      return res.status(400).json({
        error: 'Invalid share ID format'
      });
    }

    const sharedAnswer = await getSharedAnswer(shareId);

    if (!sharedAnswer) {
      return res.status(404).json({
        error: 'Shared answer not found or expired'
      });
    }

    res.json(sharedAnswer);
  } catch (error) {
    console.error('Error retrieving shared answer:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve shared answer'
    });
  }
});

module.exports = router;
