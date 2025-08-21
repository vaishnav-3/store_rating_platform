import { pgTable, serial, integer, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { stores } from './store.model.js';

// Media type enum
export const mediaTypeEnum = pgEnum('media_type', ['image', 'video']);

// Store media table schema
export const storeMedia = pgTable('store_media', {
  id: serial('id').primaryKey(),
  storeId: integer('store_id').references(() => stores.id).notNull(),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileType: mediaTypeEnum('file_type').notNull(),
  cloudinaryPublicId: varchar('cloudinary_public_id', { length: 255 }),
  fileSize: integer('file_size'), // in bytes
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});