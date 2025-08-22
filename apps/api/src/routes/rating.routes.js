import express from 'express';
import {
  submitRating,
  updateRating,
  getUserRatings,
  getStoreRatings,
  deleteRating
} from '../controllers/rating.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { canRateStore } from '../middleware/role.middleware.js';
import { validateRating, validateRatingUpdate } from '../middleware/validation.middleware.js';

const router = express.Router();

// @route   POST /api/ratings
// @desc    Submit rating for a store
// @access  Private (Normal users and Admins only, not store owners)
router.post('/', authenticateToken, canRateStore, validateRating, submitRating);

// @route   PUT /api/ratings/:id
// @desc    Update existing rating
// @access  Private (Own rating only)
router.put('/:id', authenticateToken, validateRatingUpdate, updateRating);

// @route   GET /api/ratings/user/:userId
// @desc    Get user's ratings
// @access  Private (Own ratings or Admin)
router.get('/user/:userId', authenticateToken, getUserRatings);

// @route   GET /api/ratings/store/:storeId
// @desc    Get store's ratings
// @access  Public
router.get('/store/:storeId', getStoreRatings);

// @route   DELETE /api/ratings/:id
// @desc    Delete own rating
// @access  Private (Own rating only)
router.delete('/:id', authenticateToken, deleteRating);

export default router;