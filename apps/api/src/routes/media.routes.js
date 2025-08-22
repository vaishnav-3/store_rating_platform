import express from 'express';
import { uploadMedia, getStoreMedia, deleteMedia } from '../controllers/media.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireStoreOwnerOrAdmin } from '../middleware/role.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

const router = express.Router();

// @route   POST /api/media/upload
// @desc    Upload single image/video
// @access  Private (Store Owner only - for their store)
router.post('/upload', 
  authenticateToken, 
  requireStoreOwnerOrAdmin,
  uploadSingle('file'), 
  uploadMedia
);

// @route   GET /api/media/store/:storeId
// @desc    Get store media files
// @access  Public
router.get('/store/:storeId', getStoreMedia);

// @route   DELETE /api/media/:id
// @desc    Delete media file
// @access  Private (Store Owner only - own store media)
router.delete('/:id', 
  authenticateToken, 
  requireStoreOwnerOrAdmin,
  deleteMedia
);

export default router;