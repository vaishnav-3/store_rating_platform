import express from 'express';
import { login, register, logout, getMe } from '../controllers/auth.controller.js';
import { validateLogin, validateRegistration } from '../middleware/validation.middleware.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login user (all roles)
// @access  Public
router.post('/login', validateLogin, login);

// @route   POST /api/auth/register  
// @desc    Register normal user only
// @access  Public
router.post('/register', validateRegistration, register);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, logout);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, getMe);

export default router;