import { config } from '../config/index.js';

// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose/Drizzle duplicate key error
  if (err.code === '23505') {
    const message = 'Resource already exists';
    error = { message, statusCode: 400 };
  }

  // Mongoose/Drizzle validation error
  if (err.name === 'ValidationError') {
    const message = 'Validation Error';
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(config.env === 'development' && { stack: err.stack })
  });
};

// 404 Not Found handler
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};