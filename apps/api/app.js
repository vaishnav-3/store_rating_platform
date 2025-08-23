import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './src/config/index.js';
import { testConnection } from './src/db/connection.js';
import routes from './src/routes/index.js';
import { errorHandler, notFoundHandler } from './src/middleware/error.middleware.js';

const app = express();
 
// Test database connection on startup
testConnection();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.env === 'production' 
    ? ['http://localhost:5174'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'], 
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Logging
if (config.env !== 'test') {
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Store Rating Platform API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;