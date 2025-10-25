# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Meteo App is a Weather Spark (weatherspark.com) clone - a comprehensive weather application focused on historical climate data, year-round weather patterns, and detailed visualizations.

**Key Features:**
- Historical weather data and climate patterns
- Interactive charts and visualizations (temperature, precipitation, wind, etc.)
- City comparison functionality
- Monthly, daily, and hourly weather views
- 10-year historical data analysis
- User accounts with favorite locations
- Customizable units (temperature, wind speed)

**Architecture:**
- **Frontend**: React-based web application (Create React App)
- **Backend**: Node.js/Express REST API server
- **Database**: MySQL 8.0
- **Data Sources**: OpenWeather API + Visual Crossing 10-year Timeline API

The application is containerized using Docker Compose for consistent development and deployment.

## Architecture

### Monorepo Structure
```
/backend    - Express API server
/frontend   - React web application
/database   - Database-related files (currently empty, structure pending)
```

### Backend Structure
- **server.js** - Main Express application entry point
- **config/** - Configuration files (currently empty, structure pending)
- **models/** - Database models (currently empty, structure pending)
- **routes/** - API route handlers (currently empty, structure pending)
- **services/** - Business logic layer (currently empty, structure pending)
- **utils/** - Utility functions (currently empty, structure pending)

The backend uses CommonJS modules (type: "commonjs" in package.json).

### Frontend Structure
Standard Create React App structure with React 19.2.0. Main components:
- **src/App.js** - Root application component
- **src/index.js** - Application entry point
- **public/** - Static assets

### Environment Configuration

Backend requires `.env` file (see `.env.example`):
- Server: `PORT`, `NODE_ENV`
- Database: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Weather APIs: `OPENWEATHER_API_KEY`, `VISUAL_CROSSING_API_KEY`

## Development Commands

### Docker-based Development (Recommended)
```bash
# Start all services (MySQL, backend on :5001, frontend on :3000)
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down

# Rebuild containers after dependency changes
docker-compose up --build
```

### Local Backend Development
```bash
cd backend

# Development with auto-reload
npm run dev

# Production mode
npm start

# Run tests (not yet implemented)
npm test
```

### Local Frontend Development
```bash
cd frontend

# Start development server on :3000
npm start

# Build production bundle
npm build

# Run tests in watch mode
npm test

# Eject from Create React App (irreversible)
npm run eject
```

## Port Allocation

- **3000** - Frontend development server
- **5001** - Backend API server (note: not 5000 due to common conflicts)
- **3307** - MySQL database (mapped from container's 3306 to avoid local conflicts)

## Database

MySQL 8.0 running in Docker container:
- Container name: `meteo-mysql`
- Root password: `meteo_root_pass`
- Database name: `meteo_app`
- Data persisted in Docker volume `mysql_data`

When connecting from backend container, use `DB_HOST=mysql` (Docker network hostname).
When connecting locally, use `DB_HOST=localhost` and `DB_PORT=3307`.

### Database Schema

The database stores weather data, locations, climate statistics, and user preferences:

**Core Tables:**
- `locations` - Cities with coordinates, timezone, elevation
- `weather_data` - Historical and current weather observations (daily/hourly)
- `climate_stats` - Monthly climate averages and records
- `users` - User accounts with preferences (temp units, language, etc.)
- `user_favorites` - User's saved favorite locations
- `api_cache` - Cached API responses to reduce external API calls

**Schema Files:**
- `database/schema.sql` - Complete database schema
- `database/seed.sql` - Sample location data for testing
- `backend/config/database.js` - Database connection and initialization

**Initialize Database:**
```javascript
const { initializeDatabase, seedDatabase } = require('./backend/config/database');
await initializeDatabase();  // Create tables
await seedDatabase();        // Add sample data
```

## Key Dependencies

### Backend
- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **mysql2** - MySQL database driver
- **axios** - HTTP client for weather API calls
- **dotenv** - Environment variable management
- **nodemon** - Development auto-reload (devDependency)

### Frontend
- **react** 19.2.0
- **react-scripts** - Create React App tooling
- **@testing-library/react** - Component testing utilities

## Network Architecture

All services communicate via the `meteo-network` Docker bridge network:
- Frontend → Backend: HTTP requests to `backend:5001` (container) or `localhost:5001` (local)
- Backend → MySQL: Connects to `mysql:3306` via Docker network
- Backend → External APIs: OpenWeather and Visual Crossing weather APIs

## Weather API Integration

### Visual Crossing Weather API
This application uses **Visual Crossing Weather API exclusively** for all weather data needs.

- **Purpose**: Historical weather data (10+ years), current conditions, and forecasts
- **Endpoint**: https://www.visualcrossing.com/weather-api
- **Key ENV Variable**: `VISUAL_CROSSING_API_KEY`
- **API Type**: Timeline Weather API
- **Use Cases**:
  - Historical climate data (10+ years)
  - Long-term weather trends and patterns
  - Monthly climate averages
  - Current conditions
  - Daily and hourly forecasts

**Why Visual Crossing?**
- Single API for all data needs (historical, current, forecast)
- Comprehensive 10-year historical data
- Detailed hourly and daily data
- Cost-effective for proof-of-concept projects

### API Response Caching
Weather data is cached in the `api_cache` table to:
- Reduce external API calls (cost savings)
- Improve response times
- Handle API rate limits
- Store historical data permanently

## Data Visualization Strategy

Following Weather Spark's approach:
- **Interactive Charts**: Temperature ranges, precipitation, wind patterns
- **Color-coded Temperature Bands**: frigid → cold → cool → comfortable → warm → hot → sweltering
- **Multiple Time Scales**: Hourly, daily, monthly, yearly views
- **Comparative Analysis**: Side-by-side city comparisons
- **Climate Categories**: Comfortable days, precipitation probability, cloud cover percentages

## Testing

Frontend uses Jest and React Testing Library (configured via react-scripts).
Backend testing framework not yet implemented.
