require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();

  res.json({
    status: 'ok',
    message: 'Meteo API is running',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await testConnection();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🗄️  Database: ${process.env.DB_NAME}`);
      console.log(`\n🔗 Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
