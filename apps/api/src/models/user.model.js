import { pgTable, serial, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Define user roles enum
export const roleEnum = pgEnum('role', ['admin', 'user', 'store_owner']);

// Users table schema
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 60 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  address: varchar('address', { length: 400 }),
  role: roleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});