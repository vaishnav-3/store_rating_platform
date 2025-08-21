// Export all models
export { users, roleEnum } from './user.model.js';
export { stores } from './store.model.js';
export { ratings } from './rating.model.js';
export { storeMedia, mediaTypeEnum } from './media.model.js';

// Define relations for better queries
import { relations } from 'drizzle-orm';
import { users } from './user.model.js';
import { stores } from './store.model.js';
import { ratings } from './rating.model.js';
import { storeMedia } from './media.model.js';

// User relations
export const usersRelations = relations(users, ({ many, one }) => ({
  ownedStore: one(stores, {
    fields: [users.id],
    references: [stores.ownerId]
  }),
  ratings: many(ratings)
}));

// Store relations
export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(users, {
    fields: [stores.ownerId],
    references: [users.id]
  }),
  ratings: many(ratings),
  media: many(storeMedia)
}));

// Rating relations
export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id]
  }),
  store: one(stores, {
    fields: [ratings.storeId],
    references: [stores.id]
  })
}));

// Media relations
export const storeMediaRelations = relations(storeMedia, ({ one }) => ({
  store: one(stores, {
    fields: [storeMedia.storeId],
    references: [stores.id]
  })
}));