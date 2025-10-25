const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'meteo_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z' // Use UTC
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    return false;
  }
}

// Initialize database with schema
async function initializeDatabase() {
  const fs = require('fs');
  const path = require('path');

  try {
    // Read schema file (works both locally and in Docker)
    const schemaPath = path.join(__dirname, '../../database/schema.sql');

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by statements and execute
    const statements = schema
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');

    const connection = await pool.getConnection();

    for (const statement of statements) {
      await connection.query(statement);
    }

    connection.release();
    console.log('✓ Database schema initialized successfully');
    return true;
  } catch (error) {
    console.error('✗ Database initialization failed:', error.message);
    return false;
  }
}

// Seed database with sample data
async function seedDatabase() {
  const fs = require('fs');
  const path = require('path');

  try {
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    const seedData = fs.readFileSync(seedPath, 'utf8');

    const statements = seedData
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');

    const connection = await pool.getConnection();

    for (const statement of statements) {
      await connection.query(statement);
    }

    connection.release();
    console.log('✓ Database seeded successfully');
    return true;
  } catch (error) {
    console.error('✗ Database seeding failed:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
  seedDatabase
};
