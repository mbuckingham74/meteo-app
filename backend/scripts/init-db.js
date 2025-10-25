#!/usr/bin/env node

/**
 * Database Initialization Script
 * Run with: node scripts/init-db.js
 */

require('dotenv').config();
const { initializeDatabase, seedDatabase, testConnection } = require('../config/database');

async function main() {
  console.log('\n📊 Meteo App - Database Initialization\n');

  // Test connection
  console.log('1️⃣  Testing database connection...');
  const connected = await testConnection();

  if (!connected) {
    console.error('\n❌ Cannot proceed without database connection');
    console.error('Please check your .env file and ensure MySQL is running\n');
    process.exit(1);
  }

  // Initialize schema
  console.log('\n2️⃣  Creating database schema...');
  const schemaCreated = await initializeDatabase();

  if (!schemaCreated) {
    console.error('\n❌ Schema creation failed\n');
    process.exit(1);
  }

  // Seed data
  console.log('\n3️⃣  Seeding sample data...');
  const seeded = await seedDatabase();

  if (!seeded) {
    console.error('\n❌ Seeding failed\n');
    process.exit(1);
  }

  console.log('\n✅ Database initialized successfully!\n');
  console.log('You can now start the server with: npm start\n');
  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
