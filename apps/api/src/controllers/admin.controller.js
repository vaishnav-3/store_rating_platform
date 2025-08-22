import { db } from '../db/connection.js';
import { users, stores } from '../models/index.js';
import {
  getDashboardMetrics,
  createUserByAdmin,
  createStoreByAdmin,
  getAllUsersWithFiltering,
  updateUserByAdmin,
  deleteUserByAdmin
} from '../services/admin.service.js';
import { eq, ilike, and, or, count } from 'drizzle-orm';

// @desc    Search users by name and email (admin only)
// @route   GET /api/users/search
// @access  Private (Admin only)
export const searchUsers = async (req, res, next) => {
  try {
    const { name, email, role } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!name && !email && !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, or role to search',
      });
    }

    // Build search conditions
    let whereConditions = [];

    if (name) {
      whereConditions.push(ilike(users.name, `%${name}%`));
    }

    if (email) {
      whereConditions.push(ilike(users.email, `%${email}%`));
    }

    if (role && ['admin', 'user', 'store_owner'].includes(role)) {
      whereConditions.push(eq(users.role, role));
    }

    const whereCondition =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Search users (exclude passwords)
    const searchResults = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        address: users.address,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(whereCondition)
      .limit(limit)
      .offset(offset);

    // Get total count
    const [totalResult] = await db
      .select({ total: count() })
      .from(users)
      .where(whereCondition);

    const total = totalResult.total;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'User search completed successfully',
      data: {
        users: searchResults,
        searchParams: { name, email, role },
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};




export const getDashboard = async (req, res) => {
  try {
    const metrics = await getDashboardMetrics();

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard metrics',
    });
  }
};

//Here admin can create user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const newUser = await createUserByAdmin({
      name,
      email,
      password,
      address,
      role,
    });

    // Remove password from response
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse,
    });
  } catch (error) {
    console.error('Create user error:', error);

    if (error.message === 'Email already exists') {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create user',
    });
  }
};


//Create store
export const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;
    
    const newStore = await createStoreByAdmin({
      name,
      email,
      address,
      ownerId
    });
    
    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: newStore
    });
  } catch (error) {
    console.error('Create store error:', error);
    
    if (error.message === 'Email already exists') {
      return res.status(409).json({
        success: false,
        message: 'Store email already exists'
      });
    }
    
    if (error.message === 'Owner not found') {
      return res.status(404).json({
        success: false,
        message: 'Store owner not found'
      });
    }
    
    if (error.message === 'Owner must be store_owner role') {
      return res.status(400).json({
        success: false,
        message: 'Assigned owner must have store_owner role'
      });
    }
    
    if (error.message === 'Owner already has a store') {
      return res.status(400).json({
        success: false,
        message: 'This store owner already owns a store'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create store'
    });
  }
};





export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      name,
      email,
      address,
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const filters = {
      name: name || null,
      email: email || null,
      address: address || null,
      role: role || null
    };
    
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit)
    };
    
    const sorting = {
      sortBy,
      sortOrder: sortOrder.toLowerCase()
    };
    
    const result = await getAllUsersWithFiltering(filters, pagination, sorting);
    
    res.status(200).json({
      success: true,
      data: result.users,
      pagination: {
        currentPage: pagination.page,
        totalPages: result.totalPages,
        totalUsers: result.totalCount,
        hasNextPage: pagination.page < result.totalPages,
        hasPrevPage: pagination.page > 1
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};




//update anyuser

export const updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, address, role } = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    const updateData = {
      name,
      email,
      address,
      role
    };
    
    const updatedUser = await updateUserByAdmin(userId, updateData);
    
    // Remove password from response
    const { password: _, ...userResponse } = updatedUser;
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (error.message === 'Email already exists') {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    if (error.message === 'Cannot change role - user owns a store') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change role - user owns a store. Delete the store first.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};




//deleteuser
export const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    const deletionResult = await deleteUserByAdmin(userId);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deletedUser: deletionResult.user,
        cascadeInfo: {
          ratingsDeleted: deletionResult.ratingsDeleted,
          storeDeleted: deletionResult.storeDeleted,
          storeMediaDeleted: deletionResult.storeMediaDeleted
        }
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (error.message === 'Cannot delete admin user') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin user for security reasons'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};
