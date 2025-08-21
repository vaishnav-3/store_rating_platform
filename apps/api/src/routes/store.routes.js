import express from 'express';
import { getAllStores, getStoreById } from '../controllers/store.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET /api/stores
// @desc    Get all stores with pagination (public with optional auth for user ratings)
// @access  Public
router.get('/', optionalAuth, getAllStores);

// @route   GET /api/stores/:id
// @desc    Get single store details (public with optional auth for user rating)
// @access  Public
router.get('/:id', optionalAuth, getStoreById);

export default router;