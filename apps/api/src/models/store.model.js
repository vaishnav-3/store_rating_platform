import { pgTable, serial, varchar, integer, decimal, timestamp } from 'drizzle-orm/pg-core';
import { users } from './user.model.js';

// Stores table schema
export const stores = pgTable('stores', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  address: varchar('address', { length: 400 }).notNull(),
  ownerId: integer('owner_id').references(() => users.id).notNull(),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0.00'),
  totalRatings: integer('total_ratings').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});