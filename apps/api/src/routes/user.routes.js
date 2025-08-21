import express from 'express';
import { getProfile, updateProfile, updatePassword } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validatePasswordUpdate, validateProfileUpdate } from '../middleware/validation.middleware.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// @route   GET /api/users/profile
// @desc    Get own profile
// @access  Private
router.get('/profile', getProfile);

// @route   PUT /api/users/profile
// @desc    Update own profile
// @access  Private
router.put('/profile', validateProfileUpdate, updateProfile);

// @route   PUT /api/users/password
// @desc    Update own password
// @access  Private
router.put('/password', validatePasswordUpdate, updatePassword);

export default router;