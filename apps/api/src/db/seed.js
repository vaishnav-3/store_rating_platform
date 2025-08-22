import { db } from './connection.js';
import { users, stores } from '../models/index.js';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Create admin user
    const hashedAdminPassword = await bcrypt.hash('Admin123!', 12);
    const [adminUser] = await db.insert(users).values({
      name: 'System Administrator',
      email: 'admin@storerating.com',
      password: hashedAdminPassword,
      address: '123 Admin Street, Admin City, AC 12345',
      role: 'admin'
    }).returning();

    console.log('✅ Admin user created:', adminUser.email);

    // Create sample store owner 
    const hashedStorePassword = await bcrypt.hash('Store123!', 12);
    const [storeOwner] = await db.insert(users).values({
      name: 'John Store Owner',
      email: 'owner@example.com',
      password: hashedStorePassword,
      address: '456 Store Street, Store City, SC 67890',
      role: 'store_owner'
    }).returning();

    console.log('✅ Store owner created:', storeOwner.email);

    // Create sample store
    const [sampleStore] = await db.insert(stores).values({
      name: 'Tech Paradise Store',
      email: 'contact@techparadise.com',
      address: '789 Tech Avenue, Tech City, TC 11111',
      ownerId: storeOwner.id
    }).returning();

    console.log('✅ Sample store created:', sampleStore.name);

    // Create sample normal user
    const hashedUserPassword = await bcrypt.hash('User123!', 12);
    const [normalUser] = await db.insert(users).values({
      name: 'Jane Regular User',
      email: 'user@example.com',
      password: hashedUserPassword,
      address: '321 User Road, User Town, UT 55555',
      role: 'user'
    }).returning();

    console.log('✅ Normal user created:', normalUser.email);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin: admin@storerating.com / Admin123!');
    console.log('Store Owner: owner@example.com / Store123!');
    console.log('Normal User: user@example.com / User123!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();