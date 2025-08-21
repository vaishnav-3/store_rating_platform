import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // App configuration
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 5000,
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
    maxConnections: 10
  },
  
  // JWT configuration 
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  // Cloudinary configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000, // minutes to ms
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100
  },
  
  // File upload limits
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedVideoTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv']
  }
};

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});