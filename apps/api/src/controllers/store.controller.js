import { db } from '../db/connection.js';
import { stores, users, ratings } from '../models/index.js';
import { eq, sql, count, avg, ilike, and, or, gte, lte, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// @desc    Get all stores with pagination
// @route   GET /api/stores
// @access  Public
export const getAllStores = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get stores with owner info and user's rating if authenticated
    const storeList = await db
      .select({
        id: stores.id,
        name: stores.name,
        email: stores.email,
        address: stores.address,
        averageRating: stores.averageRating,
        totalRatings: stores.totalRatings,
        createdAt: stores.createdAt,
        owner: {
          id: users.id,
          name: users.name,
          email: users.email
        },
        // If user is authenticated, get their rating for this store
        userRating: req.user ? sql`(
          SELECT rating FROM ${ratings} 
          WHERE store_id = ${stores.id} 
          AND user_id = ${req.user.id}
        )` : sql`NULL`
      })
      .from(stores)
      .leftJoin(users, eq(stores.ownerId, users.id))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [totalResult] = await db
      .select({ total: count() })
      .from(stores);

    const total = totalResult.total;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Stores retrieved successfully',
      data: {
        stores: storeList,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single store details
// @route   GET /api/stores/:id
// @access  Public
export const getStoreById = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.id);

    if (!storeId || isNaN(storeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid store ID'
      });
    }

    // Get store with owner info
    const [store] = await db
      .select({
        id: stores.id,
        name: stores.name,
        email: stores.email,
        address: stores.address,
        averageRating: stores.averageRating,
        totalRatings: stores.totalRatings,
        createdAt: stores.createdAt,
        owner: {
          id: users.id,
          name: users.name,
          email: users.email
        },
        // If user is authenticated, get their rating for this store
        userRating: req.user ? sql`(
          SELECT rating FROM ${ratings} 
          WHERE store_id = ${stores.id} 
          AND user_id = ${req.user.id}
        )` : sql`NULL`
      })
      .from(stores)
      .leftJoin(users, eq(stores.ownerId, users.id))
      .where(eq(stores.id, storeId));

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Get recent ratings for this store (last 5)
    const recentRatings = await db
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
      .orderBy(desc(ratings.createdAt))
      .limit(5);

    res.status(200).json({
      success: true,
      message: 'Store details retrieved successfully',
      data: {
        store: {
          ...store,
          recentRatings
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search stores by name and address
// @route   GET /api/stores/search
// @access  Public
export const searchStores = async (req, res, next) => {
  try {
    const { name, address } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!name && !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name or address to search'
      });
    }

    // Build search conditions
    let whereCondition;
    if (name && address) {
      whereCondition = and(
        ilike(stores.name, `%${name}%`),
        ilike(stores.address, `%${address}%`)
      );
    } else if (name) {
      whereCondition = ilike(stores.name, `%${name}%`);
    } else {
      whereCondition = ilike(stores.address, `%${address}%`);
    }

    // Search stores
    const searchResults = await db
      .select({
        id: stores.id,
        name: stores.name,
        email: stores.email,
        address: stores.address,
        averageRating: stores.averageRating,
        totalRatings: stores.totalRatings,
        createdAt: stores.createdAt,
        owner: {
          id: users.id,
          name: users.name,
          email: users.email
        },
        userRating: req.user ? sql`(
          SELECT rating FROM ${ratings} 
          WHERE store_id = ${stores.id} 
          AND user_id = ${req.user.id}
        )` : sql`NULL`
      })
      .from(stores)
      .leftJoin(users, eq(stores.ownerId, users.id))
      .where(whereCondition)
      .limit(limit)
      .offset(offset);

    // Get total count
    const [totalResult] = await db
      .select({ total: count() })
      .from(stores)
      .where(whereCondition);

    const total = totalResult.total;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Store search completed successfully',
      data: {
        stores: searchResults,
        searchParams: { name, address },
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

// @desc    Filter stores by rating and other criteria
// @route   GET /api/stores/filter
// @access  Public
export const filterStores = async (req, res, next) => {
  try {
    const { rating, location, minRating, maxRating } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Build filter conditions
    let whereConditions = [];

    if (rating) {
      const ratingValue = parseFloat(rating);
      if (ratingValue >= 1 && ratingValue <= 5) {
        whereConditions.push(gte(stores.averageRating, ratingValue.toString()));
      }
    }

    if (minRating) {
      const minRatingValue = parseFloat(minRating);
      if (minRatingValue >= 1 && minRatingValue <= 5) {
        whereConditions.push(gte(stores.averageRating, minRatingValue.toString()));
      }
    }

    if (maxRating) {
      const maxRatingValue = parseFloat(maxRating);
      if (maxRatingValue >= 1 && maxRatingValue <= 5) {
        whereConditions.push(lte(stores.averageRating, maxRatingValue.toString()));
      }
    }

    if (location) {
      whereConditions.push(ilike(stores.address, `%${location}%`));
    }

    const whereCondition = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Filter stores
    const filteredStores = await db
      .select({
        id: stores.id,
        name: stores.name,
        email: stores.email,
        address: stores.address,
        averageRating: stores.averageRating,
        totalRatings: stores.totalRatings,
        createdAt: stores.createdAt,
        owner: {
          id: users.id,
          name: users.name,
          email: users.email
        },
        userRating: req.user ? sql`(
          SELECT rating FROM ${ratings} 
          WHERE store_id = ${stores.id} 
          AND user_id = ${req.user.id}
        )` : sql`NULL`
      })
      .from(stores)
      .leftJoin(users, eq(stores.ownerId, users.id))
      .where(whereCondition)
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalQuery = db
      .select({ total: count() })
      .from(stores);
    
    if (whereCondition) {
      totalQuery.where(whereCondition);
    }
    
    const [totalResult] = await totalQuery;
    const total = totalResult.total;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Store filtering completed successfully',
      data: {
        stores: filteredStores,
        filters: { rating, location, minRating, maxRating },
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

// @desc    Store owner dashboard
// @route   GET /api/stores/owner/dashboard
// @access  Private (Store Owner only)
export const getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // Get owner's store
    const [ownerStore] = await db
      .select()
      .from(stores)
      .where(eq(stores.ownerId, ownerId));

    if (!ownerStore) {
      return res.status(404).json({
        success: false,
        message: 'No store found for this owner'
      });
    }

    // Get store statistics
    const [storeStats] = await db
      .select({
        averageRating: avg(ratings.rating),
        totalRatings: count(ratings.id)
      })
      .from(ratings)
      .where(eq(ratings.storeId, ownerStore.id));

    res.status(200).json({
      success: true,
      message: 'Owner dashboard data retrieved successfully',
      data: {
        store: {
          id: ownerStore.id,
          name: ownerStore.name,
          email: ownerStore.email,
          address: ownerStore.address,
          averageRating: storeStats.averageRating ? parseFloat(storeStats.averageRating).toFixed(2) : '0.00',
          totalRatings: storeStats.totalRatings
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ratings for owner's store
// @route   GET /api/stores/owner/ratings
// @access  Private (Store Owner only)
export const getOwnerStoreRatings = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get owner's store
    const [ownerStore] = await db
      .select()
      .from(stores)
      .where(eq(stores.ownerId, ownerId));

    if (!ownerStore) {
      return res.status(404).json({
        success: false,
        message: 'No store found for this owner'
      });
    }

    // Get ratings for owner's store
    const storeRatings = await db
      .select({
        id: ratings.id,
        rating: ratings.rating,
        createdAt: ratings.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email
        }
      })
      .from(ratings)
      .leftJoin(users, eq(ratings.userId, users.id))
      .where(eq(ratings.storeId, ownerStore.id))
      .orderBy(desc(ratings.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [totalResult] = await db
      .select({ total: count() })
      .from(ratings)
      .where(eq(ratings.storeId, ownerStore.id));

    const total = totalResult.total;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Store ratings retrieved successfully',
      data: {
        store: {
          id: ownerStore.id,
          name: ownerStore.name,
          averageRating: ownerStore.averageRating,
          totalRatings: ownerStore.totalRatings
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

// @desc    Update store details (owner only)
// @route   PUT /api/stores/:id
// @access  Private (Store Owner only - own store)
export const updateStore = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.id);
    const ownerId = req.user.id;
    const { name, email, address } = req.body;

    // Check if store exists and belongs to owner
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

    if (store.ownerId !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own store'
      });
    }

    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (address) updateData.address = address;
    updateData.updatedAt = new Date();

    // Update store
    const [updatedStore] = await db
      .update(stores)
      .set(updateData)
      .where(eq(stores.id, storeId))
      .returning();

    res.status(200).json({
      success: true,
      message: 'Store updated successfully',
      data: {
        store: updatedStore
      }
    });
  } catch (error) {
    next(error);
  }
};

//update password functionality
export const updateOwnerPassword = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Get current user details
    const [currentUser] = await db
      .select({
        id: users.id,
        password: users.password
      })
      .from(users)
      .where(eq(users.id, ownerId));

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db
      .update(users)
      .set({
        password: hashedNewPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, ownerId));

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};