import { body, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Registration validation
export const validateRegistration = [
  body('name')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('Password must contain at least one uppercase letter and one special character'),
  body('address')
    .optional()
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters'),
  handleValidationErrors
];

// Password update validation
export const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('New password must be between 8 and 16 characters')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('New password must contain at least one uppercase letter and one special character'),
  handleValidationErrors
];

// Profile update validation
export const validateProfileUpdate = [
  body('name')
    .optional()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  body('address')
    .optional()
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters'),
  handleValidationErrors
];

// Rating validation
export const validateRating = [
  body('storeId')
    .isInt({ min: 1 })
    .withMessage('Please provide a valid store ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  handleValidationErrors
];

// Rating update validation
export const validateRatingUpdate = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  handleValidationErrors
];

// Store update validation
export const validateStoreUpdate = [
  body('name')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Store name must be between 3 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('address')
    .optional()
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters'),
  handleValidationErrors
];


export const validateStoreCreation = [
  body('name')
    .isLength({ min: 20, max: 60 })
    .withMessage('Store name must be between 20 and 60 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email for the store'),
  
  body('address')
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters')
    .notEmpty()
    .withMessage('Address is required'),
  
  body('ownerId')
    .isInt({ min: 1 })
    .withMessage('Owner ID must be a valid positive integer'),
  
  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];


//update user
export const validateUserUpdate = [
  body('name')
    .optional()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('address')
    .optional()
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters'),
  
  body('role')
    .optional()
    .isIn(['admin', 'user', 'store_owner'])
    .withMessage('Role must be admin, user, or store_owner'),
  
  // Check that at least one field is provided
  body()
    .custom((value, { req }) => {
      const { name, email, address, role } = req.body;
      if (!name && !email && !address && !role) {
        throw new Error('At least one field must be provided for update');
      }
      return true;
    }),
  
  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];



export const validateRoleChange = [
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'user', 'store_owner'])
    .withMessage('Role must be admin, user, or store_owner'),
  
  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];