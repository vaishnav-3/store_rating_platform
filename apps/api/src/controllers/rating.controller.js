import { db } from '../db/connection.js';
import { ratings, stores, users } from '../models/index.js';
import { eq, and, avg, count } from 'drizzle-orm';

// Helper function to update store average rating
const updateStoreAverageRating = async (storeId) => {
  const [result] = await db
    .select({
      averageRating: avg(ratings.rating),
      totalRatings: count(ratings.id)
    })
    .from(ratings)
    .where(eq(ratings.storeId, storeId));

  await db
    .update(stores)
    .set({
      averageRating: result.averageRating ? parseFloat(result.averageRating).toFixed(2) : '0.00',
      totalRatings: result.totalRatings,
      updatedAt: new Date()
    })
    .where(eq(stores.id, storeId));
};

// @desc    Submit rating for a store
// @route   POST /api/ratings
// @access  Private (Normal users and Admins only)
export const submitRating = async (req, res, next) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    // Validate rating value
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
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

    // Check if user already rated this store
    const [existingRating] = await db
      .select()
      .from(ratings)
      .where(and(eq(ratings.userId, userId), eq(ratings.storeId, storeId)));

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this store. Use PUT to update your rating.'
      });
    }

    // Create new rating
    const [newRating] = await db
      .insert(ratings)
      .values({
        userId,
        storeId,
        rating
      })
      .returning();

    // Update store average rating
    await updateStoreAverageRating(storeId);

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        rating: newRating
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing rating
// @route   PUT /api/ratings/:id
// @access  Private (Own rating only)
export const updateRating = async (req, res, next) => {
  try {
    const ratingId = parseInt(req.params.id);
    const { rating } = req.body;
    const userId = req.user.id;

    // Validate rating value
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if rating exists and belongs to user
    const [existingRating] = await db
      .select()
      .from(ratings)
      .where(eq(ratings.id, ratingId));

    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    if (existingRating.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own ratings'
      });
    }

    // Update rating
    const [updatedRating] = await db
      .update(ratings)
      .set({
        rating,
        updatedAt: new Date()
      })
      .where(eq(ratings.id, ratingId))
      .returning();

    // Update store average rating
    await updateStoreAverageRating(existingRating.storeId);

    res.status(200).json({
      success: true,
      message: 'Rating updated successfully',
      data: {
        rating: updatedRating
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's ratings
// @route   GET /api/ratings/user/:userId
// @access  Private (Own ratings or Admin)
export const getUserRatings = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // Check if user can access these ratings
    if (userId !== currentUserId && currentUserRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own ratings'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get user ratings with store info
    const userRatings = await db
      .select({
        id: ratings.id,
        rating: ratings.rating,
        createdAt: ratings.createdAt,
        updatedAt: ratings.updatedAt,
        store: {
          id: stores.id,
          name: stores.name,
          address: stores.address,
          averageRating: stores.averageRating
        }
      })
      .from(ratings)
      .leftJoin(stores, eq(ratings.storeId, stores.id))
      .where(eq(ratings.userId, userId))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [totalResult] = await db
      .select({ total: count() })
      .from(ratings)
      .where(eq(ratings.userId, userId));

    const total = totalResult.total;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'User ratings retrieved successfully',
      data: {
        ratings: userRatings,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get store's ratings
// @route   GET /api/ratings/store/:storeId
// @access  Public
export const getStoreRatings = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.storeId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

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

    // Get store ratings with user info
    const storeRatings = await db
      .select({
        id: ratings.id,
        rating: ratings.rating,
        createdAt: ratings.createdAt,
        user: {
          id: users.id,
          name: users.name
        }
      })
      .from(ratings)
      .leftJoin(users, eq(ratings.userId, users.id))
      .where(eq(ratings.storeId, storeId))
      .limit(limit)
      .offset(offset);

    // Get total count and rating distribution
    const [totalResult] = await db
      .select({ total: count() })
      .from(ratings)
      .where(eq(ratings.storeId, storeId));

    const total = totalResult.total;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Store ratings retrieved successfully',
      data: {
        store: {
          id: store.id,
          name: store.name,
          averageRating: store.averageRating,
          totalRatings: store.totalRatings
        },
        ratings: storeRatings,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete own rating
// @route   DELETE /api/ratings/:id
// @access  Private (Own rating only)
export const deleteRating = async (req, res, next) => {
  try {
    const ratingId = parseInt(req.params.id);
    const userId = req.user.id;

    // Check if rating exists and belongs to user
    const [existingRating] = await db
      .select()
      .from(ratings)
      .where(eq(ratings.id, ratingId));

    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    if (existingRating.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own ratings'
      });
    }

    // Delete rating
    await db
      .delete(ratings)
      .where(eq(ratings.id, ratingId));

    // Update store average rating
    await updateStoreAverageRating(existingRating.storeId);

    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};