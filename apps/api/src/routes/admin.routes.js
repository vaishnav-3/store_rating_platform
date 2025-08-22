import express from 'express';
import { getDashboard, searchUsers, createUser, createStore, getAllUsers, updateUser, deleteUser, changeUserRole } from '../controllers/admin.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { validateRegistration, validateStoreCreation, validateUserUpdate, validateRoleChange } from '../middleware/validation.middleware.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// @route   GET /api/admin/users/search
// @desc    Search users by name, email, role (admin only)
// @access  Private (Admin only)
router.get('/users/search', searchUsers);

router.post('/users',
  validateRegistration,
  createUser
);


router.post('/stores',
  authenticateToken,
  validateStoreCreation,
  createStore
);

router.get('/test', (req, res) => {
  res.json({ message: 'Admin routes working' });
});


router.get('/users',
  authenticateToken,
  getAllUsers
);


// Update any user
router.put('/users/:id',
  authenticateToken,
  validateUserUpdate,
  updateUser
);

// Delete user with cascading
router.delete('/users/:id',
  authenticateToken,
  deleteUser
);

// Change user role
router.put('/users/:id/role',
  authenticateToken,
  validateRoleChange,
  changeUserRole
);

router.get('/dashboard', getDashboard)

export default router;