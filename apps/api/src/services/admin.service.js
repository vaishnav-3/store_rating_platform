import { db } from '../db/connection.js';
import { users, stores, ratings } from '../models/index.js';
import bcrypt from 'bcryptjs';
import { count, eq, like, and, or, asc, desc } from 'drizzle-orm';

export const getDashboardMetrics = async () => {
  try {
    // Get total users count
    const [totalUsersResult] = await db.select({ 
      count: count() 
    }).from(users);
    
    // Get total stores count
    const [totalStoresResult] = await db.select({ 
      count: count() 
    }).from(stores);
    
    // Get total ratings count
    const [totalRatingsResult] = await db.select({ 
      count: count() 
    }).from(ratings);
    
    // Get user counts by role
    const usersByRole = await db.select({
      role: users.role,
      count: count()
    })
    .from(users)
    .groupBy(users.role);
    
    // Format role counts for easier frontend consumption
    const roleBreakdown = usersByRole.reduce((acc, item) => {
      acc[item.role] = item.count;
      return acc;
    }, {});
    
    return {
      totalUsers: totalUsersResult.count,
      totalStores: totalStoresResult.count,
      totalRatings: totalRatingsResult.count,
      usersByRole: roleBreakdown
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw new Error('Failed to fetch dashboard metrics');
  }
};




export const createUserByAdmin = async (userData) => {
  try {
    const { name, email, password, address, role } = userData;
    
    // Check if email already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (existingUser.length > 0) {
      throw new Error('Email already exists');
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create new user
    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      address,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};





export const createStoreByAdmin = async (storeData) => {
  try {
    const { name, email, address, ownerId } = storeData;
    
    // Check if store email already exists
    const existingStore = await db.select()
      .from(stores)
      .where(eq(stores.email, email))
      .limit(1);
    
    if (existingStore.length > 0) {
      throw new Error('Email already exists');
    }
    
    // Check if owner exists and has store_owner role
    const [owner] = await db.select()
      .from(users)
      .where(eq(users.id, ownerId))
      .limit(1);
    
    if (!owner) {
      throw new Error('Owner not found');
    }
    
    if (owner.role !== 'store_owner') {
      throw new Error('Owner must be store_owner role');
    }
    
    // Check if this owner already has a store
    const existingOwnerStore = await db.select()
      .from(stores)
      .where(eq(stores.ownerId, ownerId))
      .limit(1);
    
    if (existingOwnerStore.length > 0) {
      throw new Error('Owner already has a store');
    }
    
    // Create new store
    const [newStore] = await db.insert(stores).values({
      name,
      email,
      address,
      ownerId,
      averageRating: 0, // Default rating
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    // Return store with owner information
    const storeWithOwner = {
      ...newStore,
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email
      }
    };
    
    return storeWithOwner;
  } catch (error) {
    console.error('Error creating store:', error);
    throw error;
  }
};



export const getAllUsersWithFiltering = async (filters, pagination, sorting) => {
  try {
    const { name, email, address, role } = filters;
    const { page, limit } = pagination;
    const { sortBy, sortOrder } = sorting;
    
    // Build WHERE conditions
    const conditions = [];
    
    if (name) {
      conditions.push(like(users.name, `%${name}%`));
    }
    
    if (email) {
      conditions.push(like(users.email, `%${email}%`));
    }
    
    if (address) {
      conditions.push(like(users.address, `%${address}%`));
    }
    
    if (role) {
      conditions.push(eq(users.role, role));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Build ORDER BY
    const validSortFields = ['name', 'email', 'role', 'createdAt', 'updatedAt'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy = sortOrder === 'asc' ? asc(users[finalSortBy]) : desc(users[finalSortBy]);
    
    // Get total count for pagination
    const [totalCountResult] = await db.select({ 
      count: count() 
    })
    .from(users)
    .where(whereClause);
    
    const totalCount = totalCountResult.count;
    const totalPages = Math.ceil(totalCount / limit);
    const offset = (page - 1) * limit;
    
    // Get users with filtering, sorting, and pagination
    let query = db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      address: users.address,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);
    
    if (whereClause) {
      query = query.where(whereClause);
    }
    
    const usersList = await query;
    
    // For store owners, get their store information
    const usersWithStores = await Promise.all(
      usersList.map(async (user) => {
        if (user.role === 'store_owner') {
          const [userStore] = await db.select({
            id: stores.id,
            name: stores.name,
            averageRating: stores.averageRating
          })
          .from(stores)
          .where(eq(stores.ownerId, user.id))
          .limit(1);
          
          return {
            ...user,
            store: userStore || null
          };
        }
        return user;
      })
    );
    
    return {
      users: usersWithStores,
      totalCount,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching users with filtering:', error);
    throw error;
  }
};




export const updateUserByAdmin = async (userId, updateData) => {
  try {
    const { name, email, address, role } = updateData;
    
    // Check if user exists
    const [existingUser] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    // If email is being updated, check for duplicates
    if (email && email !== existingUser.email) {
      const [emailExists] = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }
    
    // If role is being changed from store_owner, check if they own a store
    if (role && existingUser.role === 'store_owner' && role !== 'store_owner') {
      const [userStore] = await db.select()
        .from(stores)
        .where(eq(stores.ownerId, userId))
        .limit(1);
      
      if (userStore) {
        throw new Error('Cannot change role - user owns a store');
      }
    }
    
    // Build update object with only provided fields
    const updateFields = {
      updatedAt: new Date()
    };
    
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (address !== undefined) updateFields.address = address;
    if (role !== undefined) updateFields.role = role;
    
    // Update user
    const [updatedUser] = await db.update(users)
      .set(updateFields)
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};



export const deleteUserByAdmin = async (userId) => {
  try {
    // Check if user exists
    const [existingUser] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    // Prevent deletion of admin users (optional security measure)
    if (existingUser.role === 'admin') {
      throw new Error('Cannot delete admin user');
    }
    
    // Start transaction for cascading deletes
    const result = await db.transaction(async (tx) => {
      let ratingsDeleted = 0;
      let storeDeleted = null;
      let storeMediaDeleted = 0;
      
      // 1. Delete user's ratings
      const userRatings = await tx.delete(ratings)
        .where(eq(ratings.userId, userId))
        .returning();
      
      ratingsDeleted = userRatings.length;
      
      // 2. If user is store owner, handle store deletion
      if (existingUser.role === 'store_owner') {
        // Find user's store
        const [userStore] = await tx.select()
          .from(stores)
          .where(eq(stores.ownerId, userId))
          .limit(1);
        
        if (userStore) {
          // Delete store media files first
          const storeMediaFiles = await tx.delete(storeMedia)
            .where(eq(storeMedia.storeId, userStore.id))
            .returning();
          
          storeMediaDeleted = storeMediaFiles.length;
          
          // Delete ratings for this store from other users
          await tx.delete(ratings)
            .where(eq(ratings.storeId, userStore.id));
          
          // Delete the store
          const [deletedStore] = await tx.delete(stores)
            .where(eq(stores.id, userStore.id))
            .returning();
          
          storeDeleted = deletedStore;
        }
      }
      
      // 3. Finally delete the user
      const [deletedUser] = await tx.delete(users)
        .where(eq(users.id, userId))
        .returning();
      
      // Remove password from response
      const { password: _, ...userResponse } = deletedUser;
      
      return {
        user: userResponse,
        ratingsDeleted,
        storeDeleted,
        storeMediaDeleted
      };
    });
    
    return result;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};


export const changeUserRoleByAdmin = async (userId, newRole) => {
  try {
    // Check if user exists
    const [existingUser] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    // Prevent changing admin roles (security measure)
    if (existingUser.role === 'admin') {
      throw new Error('Cannot change admin role');
    }
    
    // Check if role is already the same
    if (existingUser.role === newRole) {
      throw new Error('Role is already set to the requested value');
    }
    
    const previousRole = existingUser.role;
    let storeAffected = null;
    let ratingsAffected = 0;
    
    // Start transaction for role change with potential cascading effects
    const result = await db.transaction(async (tx) => {
      // If changing FROM store_owner, check if they own a store
      if (previousRole === 'store_owner' && newRole !== 'store_owner') {
        const [userStore] = await tx.select()
          .from(stores)
          .where(eq(stores.ownerId, userId))
          .limit(1);
        
        if (userStore) {
          throw new Error('Cannot change role - user owns a store');
        }
      }
      
      // If changing TO store_owner, ensure they don't already have a store assigned
      // (This is more of a data integrity check)
      if (newRole === 'store_owner' && previousRole !== 'store_owner') {
        const [existingStore] = await tx.select()
          .from(stores)
          .where(eq(stores.ownerId, userId))
          .limit(1);
        
        if (existingStore) {
          storeAffected = existingStore;
        }
      }
      
      // Update user role
      const [updatedUser] = await tx.update(users)
        .set({
          role: newRole,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      
      // Count ratings for information purposes
      const [ratingsCount] = await tx.select({ 
        count: count() 
      })
      .from(ratings)
      .where(eq(ratings.userId, userId));
      
      ratingsAffected = ratingsCount.count;
      
      return updatedUser;
    });
    
    return {
      user: result,
      previousRole,
      storeAffected,
      ratingsAffected
    };
  } catch (error) {
    console.error('Error changing user role:', error);
    throw error;
  }
};