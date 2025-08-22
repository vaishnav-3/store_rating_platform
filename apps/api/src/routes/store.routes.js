import express from 'express';
import { 
  getAllStores, 
  getStoreById,
  searchStores,
  filterStores,
  getOwnerDashboard,
  getOwnerStoreRatings,
  updateStore
} from '../controllers/store.controller.js';
import { optionalAuth, authenticateToken } from '../middleware/auth.middleware.js';
import { requireStoreOwner } from '../middleware/role.middleware.js';
import { validateStoreUpdate } from '../middleware/validation.middleware.js';

const router = express.Router();

// @route   GET /api/stores/owner/dashboard
// @desc    Store owner dashboard
// @access  Private (Store Owner only)
router.get('/owner/dashboard', authenticateToken, requireStoreOwner, getOwnerDashboard);

// @route   GET /api/stores/owner/ratings
// @desc    Get ratings for owner's store
// @access  Private (Store Owner only)
router.get('/owner/ratings', authenticateToken, requireStoreOwner, getOwnerStoreRatings);

// @route   GET /api/stores/search
// @desc    Search stores by name and address
// @access  Public
router.get('/search', optionalAuth, searchStores);

// @route   GET /api/stores/filter
// @desc    Filter stores by rating and other criteria
// @access  Public
router.get('/filter', optionalAuth, filterStores);

// @route   GET /api/stores
// @desc    Get all stores with pagination (public with optional auth for user ratings)
// @access  Public
router.get('/', optionalAuth, getAllStores);

// @route   PUT /api/stores/:id
// @desc    Update store details (owner only)
// @access  Private (Store Owner only - own store)
router.put('/:id', authenticateToken, requireStoreOwner, validateStoreUpdate, updateStore);

// @route   GET /api/stores/:id
// @desc    Get single store details (public with optional auth for user rating)
// @access  Public
router.get('/:id', optionalAuth, getStoreById);

export default router;