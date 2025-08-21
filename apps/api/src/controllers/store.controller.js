import { db } from '../db/connection.js';
import { stores, users, ratings } from '../models/index.js';
import { eq, sql, count, avg } from 'drizzle-orm';

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
      .orderBy(sql`${ratings.createdAt} DESC`)
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