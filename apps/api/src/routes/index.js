import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import storeRoutes from './store.routes.js';

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/stores', storeRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running successfully',
    timestamp: new Date().toISOString()
  });
});

export default router;