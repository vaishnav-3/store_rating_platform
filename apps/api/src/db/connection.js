import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config/index.js';
import * as schema from '../models/index.js';

// Create PostgreSQL connection
const sql = postgres(config.database.url, { 
  max: config.database.maxConnections || 10,
  ssl: config.env === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

// Create Drizzle instance with schema
export const db = drizzle(sql, { schema });

// Test database connection
export const testConnection = async () => {
  try {
    await sql`SELECT 1`;
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};
