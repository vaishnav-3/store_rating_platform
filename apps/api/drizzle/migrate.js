import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { config } from '../src/config/index.js';

// Create migration connection
const migrationClient = postgres(config.database.url, { max: 1 });
const db = drizzle(migrationClient);

async function main() {
  try {
    console.log('🚀 Running migrations...');
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

main();