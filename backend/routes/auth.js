const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  getUserById,
  updateUserProfile,
  changePassword
} = require('../services/authService');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * Authentication Routes
 */

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password, and name are required'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    const result = await registerUser(email, password, name);

    res.status(201).json({
      message: 'User registered successfully',
      ...result
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.message === 'Email already registered') {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({
      error: 'Registration failed. Please try again.'
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const result = await loginUser(email, password);

    res.json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ error: error.message });
    }

    res.status(500).json({
      error: 'Login failed. Please try again.'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token is required'
      });
    }

    const result = await refreshAccessToken(refreshToken);

    res.json(result);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(403).json({
      error: 'Invalid or expired refresh token'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 * Protected route
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to fetch user profile'
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 * Protected route
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;

    const updatedUser = await updateUserProfile(req.user.userId, updates);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile'
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change user password
 * Protected route
 */
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'New password must be at least 6 characters long'
      });
    }

    await changePassword(req.user.userId, currentPassword, newPassword);

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);

    if (error.message === 'Current password is incorrect') {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({
      error: 'Failed to change password'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', authenticateToken, (req, res) => {
  // With JWT, logout is primarily handled client-side by removing tokens
  // This endpoint is mainly for logging/tracking purposes
  res.json({
    message: 'Logout successful'
  });
});

module.exports = router;
