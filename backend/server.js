require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

// Import routes
const weatherRoutes = require('./routes/weather');
const locationRoutes = require('./routes/locations');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const airQualityRoutes = require('./routes/airQuality');
const cacheRoutes = require('./routes/cache');
const aiLocationFinderRoutes = require('./routes/aiLocationFinder');
const aiWeatherAnalysisRoutes = require('./routes/aiWeatherAnalysis');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS Configuration - allow all origins in development, specific origin in production
const corsOptions = process.env.NODE_ENV === 'production'
  ? { origin: process.env.CORS_ORIGIN || 'https://meteo-app.example.com' }
  : {}; // Allow all origins in development

app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware (disabled in production to prevent 69 GB/day logs)
// app.use((req, res, next) => {
//   const start = Date.now();
//   res.on('finish', () => {
//     const duration = Date.now() - start;
//     console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
//   });
//   next();
// });

// Health check route
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  const apiKeyConfigured = !!process.env.VISUAL_CROSSING_API_KEY;

  res.json({
    status: 'ok',
    message: 'Meteo API is running',
    database: dbConnected ? 'connected' : 'disconnected',
    visualCrossingApi: apiKeyConfigured ? 'configured' : 'not configured',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/air-quality', airQualityRoutes);
app.use('/api/cache', cacheRoutes);
app.use('/api/ai-location-finder', aiLocationFinderRoutes);
app.use('/api/ai-weather', aiWeatherAnalysisRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await testConnection();

    // Verify API key is configured
    if (!process.env.VISUAL_CROSSING_API_KEY) {
      console.warn('\n⚠️  WARNING: VISUAL_CROSSING_API_KEY is not configured\n');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🗄️  Database: ${process.env.DB_NAME}`);
      console.log(`🌤️  Visual Crossing API: ${process.env.VISUAL_CROSSING_API_KEY ? 'Configured' : 'Not configured'}`);
      console.log(`\n🔗 API Endpoints:`);
      console.log(`   Health check:      http://localhost:${PORT}/api/health`);
      console.log(`   Weather test:      http://localhost:${PORT}/api/weather/test`);
      console.log(`   Current weather:   http://localhost:${PORT}/api/weather/current/:location`);
      console.log(`   Forecast:          http://localhost:${PORT}/api/weather/forecast/:location`);
      console.log(`   Historical:        http://localhost:${PORT}/api/weather/historical/:location`);
      console.log(`   Locations:         http://localhost:${PORT}/api/locations\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
