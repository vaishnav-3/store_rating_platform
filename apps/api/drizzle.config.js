import { defineConfig } from 'drizzle-kit';
import { config } from './src/config/index.js';

export default defineConfig({
  schema: './src/models/index.js',
  out: './drizzle',
  dialect: "postgresql",
  dbCredentials: {
    url: config.database.url,
  },
  verbose: true,
  strict: true,
});