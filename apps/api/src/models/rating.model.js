import { pgTable, serial, integer, timestamp, unique } from 'drizzle-orm/pg-core';
import { users } from './user.model.js';
import { stores } from './store.model.js';

// Ratings table schema
export const ratings = pgTable('ratings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  storeId: integer('store_id').references(() => stores.id).notNull(),
  rating: integer('rating').notNull(), // 1-5 rating
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  // Unique constraint: one rating per user per store
  uniqueUserStore: unique().on(table.userId, table.storeId),
}));