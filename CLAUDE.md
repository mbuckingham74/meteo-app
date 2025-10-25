# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Meteo App is a Weather Spark (weatherspark.com) clone - a comprehensive weather application focused on historical climate data, year-round weather patterns, and detailed visualizations.

**Key Features:**
- Historical weather data and climate patterns
- Interactive charts and visualizations (temperature, precipitation, wind, etc.)
- **Interactive weather radar map** with toggleable precipitation, cloud, and temperature layers
- Current weather conditions display with real-time data
- City comparison functionality
- Monthly, daily, and hourly weather views
- 10-year historical data analysis
- User accounts with cloud-synced favorite locations
- Global temperature unit toggle (Celsius/Fahrenheit)
- Light/dark/auto theme system
- Weather alerts and air quality monitoring
- Intelligent API caching and rate limit protection
- **Recent search history** with localStorage persistence
- **Location persistence** across page refreshes
- **Robust geolocation** with IP-based fallback

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
Standard Create React App structure with React 19.2.0. Key architectural components:

**React Context Providers:**
- **AuthContext** - User authentication state and JWT token management
- **ThemeContext** - Light/dark/auto theme management with system preference detection
- **LocationContext** - Global location selection state shared across components
- **TemperatureUnitContext** - Celsius/Fahrenheit preference with localStorage/cloud sync

**Main Components:**
- **src/App.js** - Root application component with nested context providers
- **src/index.js** - Application entry point
- **src/components/weather/WeatherDashboard.jsx** - Main dashboard with current conditions and charts
- **src/components/weather/RadarMap.jsx** - Interactive Leaflet map with OpenWeather radar tiles
- **src/components/location/LocationSearchBar.jsx** - Autocomplete search with recent history
- **src/components/auth/UserProfileModal.jsx** - User profile with favorites management
- **src/components/units/TemperatureUnitToggle.jsx** - Global C/F toggle in header
- **src/services/geolocationService.js** - Browser + IP-based geolocation with fallbacks
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
- **leaflet** 1.9.4 - Interactive maps library
- **react-leaflet** 5.0.0 - React components for Leaflet
- **recharts** 3.3.0 - Chart visualization library

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

### API Response Caching & Optimization
The application implements multiple layers of API optimization to minimize external calls and handle rate limits gracefully:

**Caching Strategy:**
Weather data is cached in the `api_cache` table to:
- Reduce external API calls by 99% (cost savings)
- Improve response times (282x faster: 850ms → 3ms)
- Handle API rate limits automatically
- Store historical data for analysis

**Cache TTL (Time To Live):**
- Current Weather: 30 minutes (optimized from 15 min)
- Forecasts: 6 hours (optimized from 2 hours)
- Historical Data: 7 days (optimized from 24 hours)
- Air Quality: 60 minutes (optimized from 30 min)
- Climate Stats: 30 days (optimized from 7 days)

**Request Throttling:**
Implemented in `backend/services/weatherService.js`:
- Maximum 3 concurrent API requests
- Minimum 100ms interval between requests
- Automatic request queuing when limits reached
- Prevents API stampeding during high traffic

**Exponential Backoff Retry:**
- Initial request → Wait 1s → Retry → Wait 2s → Final retry
- Gracefully handles transient rate limit errors (429)
- Prevents cascade failures across components

**Graceful Fallbacks:**
- Geolocation: Uses raw coordinates if reverse geocoding fails
- Weather data: Serves cached data when fresh requests are blocked
- User experience maintained even during API issues

## UI/UX Architecture

### Dashboard Layout
The main weather dashboard uses a responsive 75/25 split layout:
- **75% - Location & Current Conditions Box:**
  - Header with city name (left) and coordinates/timezone (right)
  - Current weather conditions card (centered, full-width)
  - Displays: temperature, feels-like, conditions, wind, humidity, visibility, cloud cover
  - **Interactive radar map** with toggleable precipitation, cloud, and temperature layers
- **25% - Location Panel:**
  - Location search bar with autocomplete and recent history
  - "Use My Location" button with robust geolocation
  - Forecast day selector (3, 7, 14 days)
  - "Compare Locations" navigation link
- **Below:** Interactive charts with visibility toggles

### Weather Radar Map
The app includes an interactive Leaflet-based radar map:
- **Layers Available:**
  - 💧 Precipitation overlay (OpenWeather precipitation_new tiles)
  - ☁️ Cloud cover overlay (OpenWeather clouds_new tiles)
  - 🌡️ Temperature overlay (OpenWeather temp_new tiles)
- **Features:**
  - Toggle layers on/off with emoji buttons (top-right corner)
  - Automatic centering on selected location
  - Zoom controls for detailed viewing
  - Updates in real-time when location changes
  - Dark mode support
- **Technical:**
  - Uses OpenWeather Maps API (free tier)
  - Tile endpoint: `tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png`
  - Update frequency: Every 3 hours (free tier limitation)
  - Base map: OpenStreetMap
  - API Key stored in RadarMap component (consider moving to .env)

### Location Search & Geolocation
Enhanced location detection with multiple fallback mechanisms:

**Search Features:**
- **Autocomplete:** Real-time city search with debouncing (300ms)
- **Recent History:** Last 5 searches stored in localStorage (`meteo_recent_searches`)
- **Press Enter:** Automatically selects first search result
- **Dark Mode:** Fully styled dropdown with readable text on dark backgrounds
- **Persistence:** Current location saved to localStorage, survives page refresh

**Geolocation System (3-Tier Fallback):**
1. **Browser Geolocation (Low Accuracy):**
   - Uses Wi-Fi/IP triangulation
   - Fast (~1-3 seconds)
   - Works on desktops
   - Accuracy: 50-500m
2. **Browser Geolocation (High Accuracy):**
   - Attempts GPS if available
   - Slower (~5-10 seconds)
   - Better for mobile devices
   - Accuracy: 10-50m
3. **IP-Based Geolocation (Fallback):**
   - Multi-service approach with automatic failover
   - Services: ip-api.com (primary), geojs.io (backup), ipapi.co (backup)
   - Works even when CoreLocation is unavailable
   - City-level accuracy (~5km)
   - **Critical for macOS users** where browser geolocation often fails

**Why This Matters:**
macOS often returns `kCLErrorLocationUnknown` (POSITION_UNAVAILABLE) due to:
- Wi-Fi disabled (primary desktop geolocation method)
- Location Services disabled in System Settings
- Browser lacking Location Services permission
The IP fallback ensures location detection works 99% of the time.

### Global Controls
- **Temperature Unit Toggle** (Header): Switches between °C and °F
  - Persists to localStorage for guests
  - Syncs to cloud for authenticated users
  - Updates all components in real-time via TemperatureUnitContext
- **Theme Toggle** (Header): Light/Dark/Auto mode
  - Follows system preferences in Auto mode
  - Persists to localStorage/cloud
  - CSS variables ensure smooth transitions

### Favorites Management
- Moved to user profile modal (authentication required)
- Accessed via "Favorites" tab in profile
- Cloud-synced across all devices
- Click any favorite to load location instantly

### Temperature Conversion
All temperature values from the API (Celsius) are converted using:
```javascript
// frontend/src/utils/weatherHelpers.js
celsiusToFahrenheit(celsius) = (celsius * 9/5) + 32
```
Components use the `convertTemp()` helper in WeatherDashboard or `formatTemperature()` in charts.

### Dark Mode Support
All text colors use CSS variables that automatically adapt to theme:
- `--text-primary`: Main text (white in dark mode)
- `--text-secondary`: Secondary text (light gray in dark mode)
- `--text-tertiary`: Tertiary text (medium gray in dark mode)
Use `!important` when needed to override specificity issues.

## Data Visualization Strategy

Following Weather Spark's approach:
- **Interactive Charts**: Temperature ranges, precipitation, wind patterns with dynamic time labels
- **Color-coded Temperature Bands**: frigid → cold → cool → comfortable → warm → hot → sweltering
- **Multiple Time Scales**: Hourly, daily, weekly, yearly views
- **Dynamic Labels**: "Next Week" (7 days), "Next 2 Weeks" (14 days), "Next N Days" (custom)
- **Comparative Analysis**: Side-by-side city comparisons
- **Climate Categories**: Comfortable days, precipitation probability, cloud cover percentages

## Testing

Frontend uses Jest and React Testing Library (configured via react-scripts).
Backend testing framework not yet implemented.
