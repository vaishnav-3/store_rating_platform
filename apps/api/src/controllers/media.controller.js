import { v2 as cloudinary } from 'cloudinary';
import { db } from '../db/connection.js';
import { storeMedia, stores } from '../models/index.js';
import { eq } from 'drizzle-orm';

// Configure Cloudinary
import { config } from '../config/index.js';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

// @desc    Upload single image/video
// @route   POST /api/media/upload
// @access  Private (Store Owner only - for their store)
export const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const { storeId } = req.body;
    const userId = req.user.id;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required'
      });
    }

    // Check if store exists and belongs to user
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, parseInt(storeId)));

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Only store owner can upload to their store (or admin)
    if (store.ownerId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only upload media to your own store'
      });
    }

    // Determine file type
    const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';

    // Upload to Cloudinary
    const uploadOptions = {
      resource_type: fileType === 'image' ? 'image' : 'video',
      folder: `store-rating/${fileType}s`,
      public_id: `store_${storeId}_${Date.now()}`,
      transformation: fileType === 'image' ? [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' }
      ] : [
        { width: 1280, height: 720, crop: 'limit' },
        { quality: 'auto' }
      ]
    };

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Save media info to database
    const [newMedia] = await db
      .insert(storeMedia)
      .values({
        storeId: parseInt(storeId),
        fileUrl: result.secure_url,
        fileName: req.file.originalname,
        fileType,
        cloudinaryPublicId: result.public_id,
        fileSize: req.file.size
      })
      .returning();

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      data: {
        media: newMedia
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    next(error);
  }
};

// @desc    Get store media files
// @route   GET /api/media/store/:storeId
// @access  Public
export const getStoreMedia = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.storeId);

    if (!storeId || isNaN(storeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid store ID'
      });
    }

    // Check if store exists
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId));

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    const { type } = req.query; // 'image' or 'video' filter

    // Get media files
    let query = db
      .select({
        id: storeMedia.id,
        fileUrl: storeMedia.fileUrl,
        fileName: storeMedia.fileName,
        fileType: storeMedia.fileType,
        fileSize: storeMedia.fileSize,
        createdAt: storeMedia.createdAt
      })
      .from(storeMedia)
      .where(eq(storeMedia.storeId, storeId));

    // Add type filter if provided
    if (type && ['image', 'video'].includes(type)) {
      query = query.where(eq(storeMedia.fileType, type));
    }

    const mediaFiles = await query;

    // Separate images and videos
    const images = mediaFiles.filter(file => file.fileType === 'image');
    const videos = mediaFiles.filter(file => file.fileType === 'video');

    res.status(200).json({
      success: true,
      message: 'Store media retrieved successfully',
      data: {
        store: {
          id: store.id,
          name: store.name
        },
        media: {
          images,
          videos,
          total: mediaFiles.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete media file
// @route   DELETE /api/media/:id
// @access  Private (Store Owner only - own store media)
export const deleteMedia = async (req, res, next) => {
  try {
    const mediaId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!mediaId || isNaN(mediaId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid media ID'
      });
    }

    // Get media file with store info
    const [mediaFile] = await db
      .select({
        id: storeMedia.id,
        storeId: storeMedia.storeId,
        cloudinaryPublicId: storeMedia.cloudinaryPublicId,
        fileType: storeMedia.fileType,
        store: {
          ownerId: stores.ownerId
        }
      })
      .from(storeMedia)
      .leftJoin(stores, eq(storeMedia.storeId, stores.id))
      .where(eq(storeMedia.id, mediaId));

    if (!mediaFile) {
      return res.status(404).json({
        success: false,
        message: 'Media file not found'
      });
    }

    // Check if user owns the store (or is admin)
    if (mediaFile.store.ownerId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete media from your own store'
      });
    }

    // Delete from Cloudinary
    if (mediaFile.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(
        mediaFile.cloudinaryPublicId,
        { resource_type: mediaFile.fileType === 'image' ? 'image' : 'video' }
      );
    }

    // Delete from database
    await db
      .delete(storeMedia)
      .where(eq(storeMedia.id, mediaId));

    res.status(200).json({
      success: true,
      message: 'Media file deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    next(error);
  }
};