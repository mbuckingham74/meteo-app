# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Meteo App is a Weather Spark (weatherspark.com) clone - a comprehensive weather application focused on historical climate data, year-round weather patterns, and detailed visualizations.

**Key Features:**
- Historical weather data and climate patterns
- Interactive charts and visualizations (temperature, precipitation, wind, etc.)
- **Interactive weather radar map** with real historical precipitation data (past 2 hours)
- **Advanced radar features**: time selector, storm tracking, screenshot export, weather alerts overlay
- Current weather conditions display with real-time data
- City comparison functionality
- **AI-powered location finder** - Natural language climate search with Claude AI
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
- **Progressive Web App (PWA)** - Offline support, installable, native app-like experience
- **Error Boundary** - Graceful error handling with recovery options
- **Loading Skeletons** - Content-aware loading states for better perceived performance

**Architecture:**
- **Frontend**: React-based web application (Create React App)
- **Backend**: Node.js/Express REST API server
- **Database**: MySQL 8.0
- **AI**: Claude Sonnet 4.5 (Anthropic API) for natural language processing
- **Data Sources**: RainViewer (radar), Visual Crossing (historical), OpenWeather (overlays)

The application is containerized using Docker Compose for consistent development and deployment.

## 🚨 Production Server Access Rules

**Ask before attempting to connect to server. Private key is provided via biometric authorization.**

**Production Server Details:**
- **Host:** tachyonfuture.com (Hostinger VPS)
- **Domains:** meteo-beta.tachyonfuture.com, api.meteo-beta.tachyonfuture.com
- **Proxy:** Nginx Proxy Manager (port 81)
- **Deployment:** See `scripts/deploy-beta.sh` or `DEPLOYMENT_GUIDE_PRIVATE.md`

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

**Service Layer:**
- **src/services/radarService.js** - RainViewer API integration with intelligent caching
- **src/services/geolocationService.js** - Multi-tier location detection with IP fallback
- **src/services/locationFinderService.js** - AI-powered location finder API client

**Main Components:**
- **src/App.js** - Root application component with nested context providers
- **src/index.js** - Application entry point
- **src/components/weather/WeatherDashboard.jsx** - Main dashboard with current conditions and charts
- **src/components/weather/RadarMap.jsx** - Interactive Leaflet map with RainViewer historical radar data
- **src/services/radarService.js** - RainViewer API integration with 5-minute caching
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
- AI: `METEO_ANTHROPIC_API_KEY` - Claude API for natural language processing

**Note:** The `METEO_` prefix is used to avoid conflicts with Claude Code CLI's `ANTHROPIC_API_KEY` during development.

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
- **html2canvas** - Screenshot capture for radar map export
- **gif.js** - Animated GIF generation (future use)

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

**Conditional API Calls:**
- "This Day in History" API calls only made in forecast mode
- Saves 33% of API requests in historical comparison mode
- Smart hook dependency tracking prevents unnecessary re-fetches
- React hooks conditionally return null to skip unused data endpoints

**Graceful Fallbacks:**
- Geolocation: Uses raw coordinates if reverse geocoding fails
- Weather data: Serves cached data when fresh requests are blocked
- User experience maintained even during API issues

## AI Integration

### Claude API for Natural Language Processing
The application uses **Anthropic's Claude Sonnet 4.5** for AI-powered location finding and climate preference extraction.

**Model:** `claude-sonnet-4-20250514`
**Purpose:** Parse natural language climate queries into structured search criteria
**Key ENV Variable:** `METEO_ANTHROPIC_API_KEY`

> **Why METEO_ANTHROPIC_API_KEY?** This project uses a prefixed environment variable name to prevent conflicts with Claude Code CLI (the development tool used to build this app). Claude Code CLI uses the standard `ANTHROPIC_API_KEY` variable for its own operations. Using `METEO_ANTHROPIC_API_KEY` allows both tools to coexist without interference during development.

**Two-Step Validation System:**

1. **Quick Validation** (`POST /api/ai-location-finder/validate-query`):
   - Token usage: ~200-300 tokens
   - Cost: ~$0.001-$0.002 per query
   - Purpose: Prevent spam/abuse before expensive parsing
   - Response time: ~2 seconds
   - Validates query is legitimate climate/location search

2. **Full Parsing** (`POST /api/ai-location-finder/parse-query`):
   - Token usage: ~500-1000 tokens
   - Cost: ~$0.005-$0.010 per query
   - Response time: ~3-5 seconds
   - Extracts structured criteria from natural language

**Extracted Criteria:**
```json
{
  "current_location": "New Smyrna Beach, FL",
  "time_period": { "start": "June", "end": "October" },
  "temperature_delta": -15,
  "temperature_range": { "min": null, "max": null },
  "humidity": "lower",
  "precipitation": "less",
  "lifestyle_factors": ["good community feel"],
  "deal_breakers": [],
  "additional_notes": "Contextual insights from AI"
}
```

**Implementation:**
- **Backend Service:** `backend/services/aiLocationFinderService.js`
- **API Routes:** `backend/routes/aiLocationFinder.js`
- **Frontend Client:** `frontend/src/services/locationFinderService.js`
- **UI Component:** Integrated into `LocationComparisonView.jsx`

**Cost Management:**
- Budget: $99 = ~10,000-20,000 full queries
- Token usage logged for monitoring
- Cost displayed to user for transparency
- Validation step prevents abuse

**Error Handling:**
- Markdown code block stripping from AI responses
- Graceful degradation if API unavailable
- User-friendly error messages
- Fallback allows manual location search

## UI/UX Architecture

### Dashboard Layout
The main weather dashboard uses a responsive 65/35 split layout with compact spacing, dark theme support, and efficient use of screen space:

**Section Headers:**
- **"Current Conditions"** header appears above city name and weather data
- **"Forecast & Charts"** header separates forecast section from current conditions
- Provides clear visual hierarchy and improved navigation
- Reduced vertical spacing throughout for compact, efficient layout

**Layout Structure:**
- **65% - Current Conditions & Highlights Panel:**
  - **Current Conditions Header:**
    - Section header: "🌡️ Current Conditions"
    - City name (left) and coordinates/timezone (right)
    - Current weather: temperature, feels-like, conditions
    - **5 compact stat boxes**: Wind, Humidity, Visibility, Clouds, 24h Precipitation
  - **Interactive Radar Map** (350px height, zoom level 7.5)
    - Fixed height provides consistent sizing
    - User-controllable zoom with + and − buttons
    - Animation controls and toggleable layers
    - Dark mode support for all controls
  - **Today's Highlights Section:**
    - 2x2 grid of info cards
    - 🌅 Sunrise/Sunset times (12-hour format with AM/PM)
    - ☀️ UV Index with severity level (Low/Moderate/High/Very High/Extreme)
    - 🌡️ Atmospheric Pressure with High/Low indicator
    - 👁️ Visibility with quality rating (Excellent/Good/Moderate/Poor)
  - **Wind & Air Section:**
    - 2x2 grid of info cards
    - 💨 Wind speed (mph) with compass direction (N, NE, E, etc.)
    - ☁️ Cloud cover percentage with description (Clear/Partly Cloudy/Mostly Cloudy/Overcast)
    - 💧 Dew point temperature with comfort level (Dry/Comfortable/Sticky/Humid/Oppressive)
    - 🌧️ Precipitation type (Rain/Snow/None) with expected amount
  - **Conditions Summary:**
    - Full-width card with weather icon and description
    - Current conditions title (e.g., "Rain, Partially cloudy")
    - Detailed text description from API
    - Precipitation probability and amount (when applicable)
- **35% - Unified Controls Panel:**
  - **Location Section:**
    - Location search bar with autocomplete and recent history
    - "Use My Location" button with robust geolocation
    - "Compare Locations" navigation link
  - **Temperature Unit Toggle**: Celsius/Fahrenheit selector
  - **Prominent Forecast Button:**
    - "View [CityName] Forecast & Charts" - personalized with current city
    - Gradient purple styling matching app theme
    - Smooth scroll to forecast section with one click
    - Replaces confusing "Forecast Days" dropdown (fixed to 7 days)
  - **Charts Section:** (15 navigation buttons)
    - Show All / Hide All buttons control chart visibility
    - Click any chart button → Smoothly scrolls to that chart
    - Panel scrolls vertically if needed to access all options
- **Below:** "Forecast & Charts" section with interactive visualizations (dark theme enabled)

**Chart Navigation:**
- Large "View [CityName] Forecast & Charts" button provides quick access
- Individual chart navigation buttons for precise scrolling
- All charts have unique IDs (chart-hourly, chart-temperature, etc.)
- Smooth scroll animation for better UX
- Charts remain visible by default for discoverability

**Chart Visibility Enhancements:**
- All charts feature bold, clearly visible titles (22px, weight 700)
- Explicit color values ensure labels render in both light/dark modes
- Axis labels with units (e.g., "Humidity (%)", "Temperature (°F)", "Time of Day")
- Larger tick labels (13px, weight 500) for better readability
- Bold legends (14px, weight 600) for clear data identification
- Increased chart height (450px) for improved visualization
- Enhanced grid lines with proper opacity for subtle guidance

### Interactive 48-Hour Forecast Chart
The hourly forecast chart features multiple clickable views for focused analysis:

**View Modes:**
- 📊 **Overview** (default) - Combined view showing temperature, feels-like, and precipitation on dual Y-axes
- 🔥 **High Temperature** - Focused high temp view with area fill visualization
- ❄️ **Low Temperature** - Detailed low temp analysis with blue gradient
- 🌧️ **Precipitation** - Rainfall amounts with precipitation probability overlay
- 💨 **Wind Speed** - Wind analysis with area fill and average calculations

**Interactive Features:**
- Click "Overview" button to return to combined view
- **Clickable Summary Cards** - Four stat cards showing:
  - High temperature (with fire emoji)
  - Low temperature (with snowflake emoji)
  - Total precipitation (with rain emoji)
  - Average wind speed (with wind emoji)
- Clicking any summary card switches to that metric's focused view
- Card highlights and scales up when selected
- Hover effects on all interactive elements

**Technical Implementation:**
- State management with `useState` for selected metric
- Dynamic chart rendering based on `selectedMetric` state
- Calculated statistics stored in `stats` object
- Area charts with gradient fills for temperature views
- All views maintain consistent tooltip and legend formatting
- **Component:** `HourlyForecastChart.jsx`

### Weather Radar Map
The app features a professional-grade interactive radar map powered by RainViewer with real historical precipitation data:

**Data Sources:**
- **Precipitation**: RainViewer API (real historical data, past 2 hours + 30 min forecast)
- **Clouds**: OpenWeather clouds_new tiles
- **Temperature**: OpenWeather temp_new tiles

**Core Features:**
- **Real historical data**: 12-15 radar frames at 10-minute intervals
- **Automatic updates**: Refreshes every 10 minutes when new frames available
- **5-minute API caching**: Reduces redundant API calls, improves performance
- **Hybrid data approach**: RainViewer for precipitation, OpenWeather for overlays
- **Graceful fallback**: Switches to OpenWeather if RainViewer unavailable
- **Full dark mode support**: All UI elements adapt to theme

**Layer Controls (Top-Right):**
- 💧 **Precipitation** - Toggle RainViewer radar overlay
- ☁️ **Clouds** - Toggle OpenWeather cloud cover
- 🌡️ **Temperature** - Toggle OpenWeather temperature overlay
- **+** **Zoom In** - Increase map zoom level (max 18)
- **−** **Zoom Out** - Decrease map zoom level (min 1)
  - Bold, high-contrast buttons with dark mode support
  - Disabled states when reaching zoom limits
- ⚠️ **Weather Alerts** - Show/hide alert markers on map (when available)
- 🌀 **Storm Tracking** - Enable movement analysis panel
- 📷 **Screenshot** - Download current view as PNG image
- 💾 **Export Data** - Download all frame metadata as JSON

**Animation Controls (Bottom):**
- ▶️/⏸ **Play/Pause** - Animate through historical radar frames
- **Speed selector** - 0.5x, 1x, 2x playback rates
- 🕐 **Time selector** - Dropdown to jump to specific frame
- **Clickable timestamp** - Opens frame selector for manual navigation
- **Interactive progress bar** - Click anywhere to scrub through timeline
- **Frame counter** - Shows current position (e.g., "8 / 14")

**Advanced Features:**
- **Precipitation Intensity Legend**: Color-coded gradient (light → moderate → heavy)
- **Weather Alerts Overlay**:
  - Animated pulsing markers color-coded by severity
  - Red (warnings), Orange (watches), Blue (advisories)
  - Clickable popups with full alert details
- **Storm Tracking Panel**:
  - Movement direction (N, NE, E, SE, S, SW, W, NW)
  - Estimated speed in km/h
  - Frame-by-frame position tracking
  - Simulated from radar data progression
- **Screenshot Export**:
  - Captures full map with all active layers
  - PNG format with timestamp: `radar-2025-10-25T20-55-30.png`
  - Uses html2canvas for accurate rendering
- **Data Export**:
  - JSON export of all frame metadata
  - Includes timestamps, coordinates, tile paths
  - Perfect for data analysis: `radar-data-2025-10-25.json`

**Technical Implementation:**
- **RainViewer API**: `https://api.rainviewer.com/public/weather-maps.json`
- **Rate limits**: 1000 requests/IP/minute (very generous)
- **Free tier limitation**: Max zoom level 10
- **Coverage**: Global precipitation radar
- **Caching**: 5-minute in-memory cache via `radarService.js`
- **Auto-refresh**: Fetches new data every 10 minutes
- **Components**: `RadarMap.jsx`, `RadarMap.css`, `radarService.js`
- **Dependencies**: Leaflet, React-Leaflet, html2canvas
- **Base map**: OpenStreetMap tiles
- **Default zoom**: Level 7.5 (balanced regional view)
- **Map height**: Fixed 350px for consistent sizing
- **Zoom controls**: Custom React state-managed zoom with +/− buttons

### Location Search & Geolocation
Enhanced location detection with multiple fallback mechanisms:

**Search Features:**
- **Autocomplete:** Real-time city search with debouncing (300ms)
- **Recent History:** Last 5 searches stored in localStorage (`meteo_recent_searches`)
- **Press Enter:** Automatically selects first search result
- **Dark Mode:** Fully styled dropdown with readable text on dark backgrounds
- **Persistence:** Current location saved to localStorage, survives page refresh
- **Default Location:** Seattle, WA (neutral starting point for first-time users)

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
   - Services: ipapi.co (primary), geojs.io (backup)
   - **Both services use HTTPS** to avoid Mixed Content errors on secure sites
   - Works even when CoreLocation is unavailable
   - City-level accuracy (~5km)
   - **Critical for macOS users** where browser geolocation often fails
   - Accurately detects VPN endpoint locations

**Why This Matters:**
macOS often returns `kCLErrorLocationUnknown` (POSITION_UNAVAILABLE) due to:
- Wi-Fi disabled (primary desktop geolocation method)
- Location Services disabled in System Settings
- Browser lacking Location Services permission
The IP fallback ensures location detection works 99% of the time.

**User-Friendly Displays:**
- When reverse geocoding fails or returns coordinates only, displays "Your Location" instead of raw lat/long
- Regex detection: `/^-?\d+\.\d+,\s*-?\d+\.\d+$/` identifies coordinate-only addresses
- Improves UX when API rate limits prevent address lookups
- Coordinates still available in location metadata for API calls

### Global Controls
- **Temperature Unit Toggle** (Dashboard Controls): Switches between °C and °F
  - Persists to localStorage for guests
  - Syncs to cloud for authenticated users
  - Updates all components in real-time via TemperatureUnitContext
- **Theme Toggle** (Header): Simple cycling button
  - Click to cycle: Light → Dark → Auto → Light
  - Simplified from dropdown menu for better UX
  - Follows system preferences in Auto mode
  - Persists to localStorage/cloud
  - CSS variables ensure smooth transitions
  - **Component:** `ThemeToggle.jsx` with `cycleTheme()` function

### Favorites Management
- Moved to user profile modal (authentication required)
- Accessed via "Favorites" tab in profile
- Cloud-synced across all devices
- Click any favorite to load location instantly

### Compare Locations
Enhanced side-by-side weather comparison for multiple cities (accessible via dashboard link):
- **Features:**
  - Compare 2-4 locations simultaneously
  - **Pre-populated with Seattle vs New Smyrna Beach** - Shows functionality immediately on page load
  - **Time Range Selector** - Choose from:
    - 7 days (current forecast)
    - 1, 3, 6 months (historical data)
    - 1, 3, 5 years (long-term climate comparison)
  - **Smart Data Aggregation** - Automatic chart optimization based on time range:
    - 7 days - 1 month: Daily data (7-30 points, no aggregation)
    - 3-6 months: Weekly averages (~13-26 points)
    - 1+ years: Monthly averages (12-60 points)
    - Aggregation indicator badge shows when data is averaged
    - Tooltips display number of days aggregated
    - Prevents chart overcrowding and improves readability for climate trends
  - **AI-Powered Location Finder**:
    - Natural language climate search using Claude Sonnet 4.5
    - Compact prompt card with auto-detected user location
    - Friendly button: "Can I just tell you what I want to compare and you show me some data and pretty charts and graphs?"
    - Expands to full AI search interface with smooth scroll animation
    - Two-step validation system (quick check + full parse)
    - Extracts structured criteria: location, time period, temperature delta, humidity, precipitation, lifestyle factors
    - Cost-transparent: Shows token usage and estimated cost per query (~$0.005)
    - Example queries: "I want somewhere 15 degrees cooler from June-October, less humid, not rainy"
    - **Auto-populates comparison cards** with AI-recommended locations based on parsed criteria
    - Curated database of 25+ cities with climate characteristics (temperature, humidity, precipitation)
    - Smart matching algorithm scores locations based on user preferences
    - Displays AI insights and suggestions after successful query
  - **Weather Comparison Charts** - Visual comparisons for:
    - Temperature bands (high/low) with color-coded ranges
    - Precipitation patterns with enhanced probability line (orange, dashed, 0-100% scale)
    - Wind speeds with direction indicators
    - Historical comparison with 10-year averages (for historical ranges)
    - Smart X-axis label rotation for large datasets
  - Interactive search for each location slot
  - Real-time weather data + historical climate data for each city
  - Comparison insights (warmest, coldest, wettest)
  - Temperature difference calculations
  - Add/remove locations dynamically
- **Display:**
  - Large temperature display with high/low range
  - Averages calculated based on selected time range
  - Total precipitation for period
  - Average humidity percentage
  - Current conditions badge
- **Insights Panel:**
  - 🔥 Warmest location with average temp
  - ❄️ Coldest location with average temp
  - 🌧️ Wettest location with total precipitation
  - 📊 Temperature difference between extremes
- **Dark Mode:** Fully supported with readable text and proper contrast
- **Components:** `LocationComparisonView.jsx`, `LocationComparisonView.css`
- **State Management:** Time range selector, guide visibility, pre-populated locations on mount

### Temperature Conversion
Temperature unit preference is managed globally through TemperatureUnitContext:

**Architecture:**
- **Context:** `TemperatureUnitContext` provides global `unit` state and `setUnit` function
- **Page Components:** Use `useTemperatureUnit()` hook to access and update unit preference
- **Child Components:** Receive `unit` as a prop from parent page components
- **Persistence:** Saves to localStorage for guests, cloud-synced for authenticated users

**Conversion:**
All temperature values from the API (Celsius) are converted using:
```javascript
// frontend/src/utils/weatherHelpers.js
celsiusToFahrenheit(celsius) = (celsius * 9/5) + 32
formatTemperature(value, unit) // Returns formatted string with °C or °F
```

**Data Aggregation:**
Smart weather data aggregation for improved chart readability:
```javascript
// frontend/src/utils/weatherHelpers.js
aggregateWeatherData(data, timeRange) // Returns { aggregatedData, aggregationLabel }
// Automatically aggregates based on time range:
// - '7days', '1month': No aggregation (daily data)
// - '3months', '6months': Weekly averages
// - '1year', '3years', '5years': Monthly averages
formatAggregatedDate(dateString, aggregationType) // Format labels for aggregated data
```

**Important:**
- Page components (WeatherDashboard, LocationComparisonView) MUST use `useTemperatureUnit()` hook
- Never create local `unit` state - always use the global context
- Temperature toggles anywhere in the app sync globally via this context
- Use `aggregateWeatherData()` in comparison views to prevent chart overcrowding
- Always use `useMemo` for aggregation to prevent unnecessary recalculations

### Dark Mode Support
The application uses a comprehensive CSS variable system for full dark mode compatibility across all components.

**Text Colors:**
- `--text-primary`: Main text (white in dark mode)
- `--text-secondary`: Secondary text (light gray in dark mode)
- `--text-tertiary`: Tertiary text (medium gray in dark mode)

**Background Colors:**
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary`: Background layers
- `--bg-elevated`: Elevated surfaces (cards, modals)

**Accent & State Colors:**
- `--accent-primary`, `--accent-bg`, `--accent-text`: Primary accent colors
- `--error-bg`, `--error-border`, `--error-text`: Error states
- `--warning-bg`, `--warning-border`, `--warning-text`: Warning states
- `--success-bg`, `--success-border`, `--success-text`: Success states
- `--info-bg`, `--info-border`, `--info-text`: Info states

**Temperature & Insight Colors:**
- `--temp-hot`, `--temp-cold`: Temperature indicators
- `--insight-warm-bg/border`, `--insight-cold-bg/border`: Comparison insights
- `--insight-wet-bg/border`, `--insight-diff-bg/border`: Weather insights

**Best Practices:**
- Always use CSS variables with fallback values: `var(--text-primary, #111827)`
- Use `!important` when needed to override specificity issues
- All CSS variables defined in `src/styles/themes.css` with light and dark variants
- Avoids hardcoded hex colors to ensure consistent theming

### Mobile Responsiveness
The application is fully optimized for mobile devices with comprehensive responsive design:

**Breakpoints:**
- **Desktop**: 1024px+ (full 2-column layout, expanded controls)
- **Tablet**: 768px-1023px (stacked layout, optimized spacing)
- **Mobile**: 480px-767px (touch-optimized, compact UI)
- **Small Mobile**: <480px (minimal layout, essential features only)

**Dashboard Optimizations:**
- **Layout**: 65/35 desktop split → stacked single column on mobile
- **Current Conditions**: Highlights grid adapts from 2 columns to responsive flow
- **Stat Boxes**: Grid from 5 columns → 2 columns on mobile
- **Typography**: Responsive font sizes (64px temp → proportional scaling)

**Touch-Friendly Controls:**
- **Minimum Touch Targets**: 44×44px (iOS guidelines) for all interactive elements
- **Radar Map Controls**: Larger buttons (44px), increased spacing, full-width dividers on mobile
- **Layer Toggles**: Enhanced emoji size (20px), prominent visual feedback
- **Zoom Controls**: Touch-optimized +/− buttons with disabled states
- **Animation Controls**: 44px min-height for play/pause, speed selector, timestamp
- **Progress Bar**: Thicker (6px) for easier touch scrubbing on mobile

**Component-Specific Mobile Features:**
- **WeatherDashboard.css**: @media queries at 768px and 480px with layout stacking
- **RadarMap.css**: Touch controls, flexible wrapping, optimized legend positioning
- **LocationComparisonView.css**: Responsive cards, stacked insights, mobile-first forms
- **WeatherAlertsBanner.css**: Compact padding, readable text sizes (@media 640px)

**Performance:**
- CSS animations use GPU-accelerated properties (transform, opacity)
- Flexbox and Grid layouts prevent layout thrashing
- Radar map height dynamically adjusts (350px tablet, 300px mobile)
- Charts maintain aspect ratio and readability across screen sizes

## Data Visualization Strategy

Following Weather Spark's approach:
- **Interactive Charts**: Temperature ranges, precipitation, wind patterns with dynamic time labels
- **Color-coded Temperature Bands**: frigid → cold → cool → comfortable → warm → hot → sweltering
- **Multiple Time Scales**: Hourly, daily, weekly, yearly views
- **Dynamic Labels**: "Next Week" (7 days), "Next 2 Weeks" (14 days), "Next N Days" (custom)
- **Comparative Analysis**: Side-by-side city comparisons
- **Climate Categories**: Comfortable days, precipitation probability, cloud cover percentages

## Analytics

The application uses two complementary analytics platforms for traffic analysis and user behavior tracking:

### Matomo Analytics (Self-Hosted)
- **Platform**: Self-hosted Matomo instance at `matomo.tachyonfuture.com`
- **Site ID**: 4
- **Implementation**: Inline JavaScript in `frontend/public/index.html`
- **Tracking**: Page views, link clicks, custom events
- **Privacy**: Self-hosted for complete data ownership

### Plausible Analytics (Beta Site)
- **Platform**: Self-hosted Plausible instance at `plausible.tachyonfuture.com`
- **Domain Tracking**: `meteo-beta.tachyonfuture.com` only
- **Implementation**: Deferred script tag in `frontend/public/index.html`
- **Features**: Lightweight, privacy-focused, GDPR compliant
- **Script**: `<script defer data-domain="meteo-beta.tachyonfuture.com" src="https://plausible.tachyonfuture.com/js/script.js"></script>`
- **Note**: Beta site only - does not track local development or other domains

Both analytics platforms are configured in the HTML template and load automatically when the application is accessed.

## Progressive Web App (PWA)

The application is a fully-featured Progressive Web App with offline support, installability, and native app-like experience.

### Service Worker
**File:** `frontend/public/service-worker.js`

**Caching Strategies:**
- **Cache-First**: Static assets (JS, CSS, images, fonts)
  - Instant loading from cache
  - Falls back to network if not cached
  - Best for assets that rarely change

- **Network-First**: API calls and dynamic content
  - Tries network first for fresh data
  - Falls back to cache when offline
  - TTL: 30min for API, 15min for weather data

- **Stale-While-Revalidate**: Weather data
  - Returns cached data immediately
  - Updates cache in background
  - Zero perceived latency for users

**Cache Management:**
- Automatic versioning: `meteo-v1.0.0`
- Size limits: 50 dynamic items, 100 API items
- Auto-cleanup of old caches
- Background sync for weather updates

**Offline Support:**
- Beautiful offline fallback page (`/offline.html`)
- Works after first visit
- Real-time connection status monitoring
- Auto-reload when connection restored
- Lists available offline features

### PWA Manifest
**File:** `frontend/public/manifest.json`

**Features:**
- App name: "Meteo Weather"
- Theme colors: #667eea (light), #1f2937 (dark)
- Standalone display mode (full-screen)
- App shortcuts: Current Weather, Compare Locations
- Categories: weather, utilities, lifestyle
- Icons: 192x192, 512x512 (maskable)

### Installation
The app can be installed on:
- **iOS**: Add to Home Screen
- **Android**: Install app prompt
- **Desktop Chrome/Edge**: Install icon in address bar
- **Windows**: Microsoft Store-like experience

When installed:
- Runs in standalone mode (no browser UI)
- App icon on home screen/desktop
- Splash screen on launch
- Works like a native app
- App shortcuts (long-press icon on mobile)

### PWA Testing
**Local:**
```bash
npm run build
npx serve -s build
# Open http://localhost:3000
# DevTools → Application → Service Workers
```

**Production:**
- Visit https://meteo-beta.tachyonfuture.com
- Look for install prompt (⊕ icon in address bar)
- Test offline: DevTools → Network → Offline checkbox

## Error Handling

### ErrorBoundary Component
**File:** `frontend/src/components/common/ErrorBoundary.jsx`

React Error Boundary that catches JavaScript errors anywhere in the component tree and displays a user-friendly fallback UI.

**Features:**
- Catches all React errors before they crash the app
- Beautiful fallback UI with recovery options:
  - "Try Again" button - Resets error state
  - "Refresh Page" button - Full page reload
  - "Report Issue" button - Opens GitHub issue with error details
- Multiple error detection warnings
- Development mode shows detailed stack traces
- Production mode hides technical details
- Error logging infrastructure (ready for Sentry/LogRocket)
- Dark mode support
- Mobile responsive

**Integration:**
```javascript
// App.js wraps entire application
<ErrorBoundary>
  <AuthProvider>
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  </AuthProvider>
</ErrorBoundary>
```

**Error Logging:**
The component logs errors with:
- Error message and stack trace
- Component stack
- Timestamp
- User agent
- Current URL

In production, errors can be sent to monitoring services:
```javascript
// Example integration (in ErrorBoundary.jsx)
if (process.env.NODE_ENV === 'production') {
  fetch('/api/errors/log', {
    method: 'POST',
    body: JSON.stringify(errorDetails)
  });
}
```

### Loading States

**Components:**
- `Skeleton.jsx` - Base skeleton primitives
- `DashboardSkeleton.jsx` - Full dashboard loading state
- `ChartSkeleton.jsx` - Chart loading visualization

**Features:**
- Content-aware loading placeholders
- Smooth shimmer animation
- Mimics actual content structure
- Replaces generic spinners
- Better perceived performance
- Respects `prefers-reduced-motion`
- Dark mode support

**Usage:**
```javascript
// WeatherDashboard.jsx
{loading && <DashboardSkeleton />}
{!loading && <ActualContent />}
```

**Skeleton Types:**
- Rectangular: Cards, images, charts
- Circular: Avatars, icons
- Text: Single/multi-line text
- Custom: Weather stats, temperature displays

## Accessibility & Keyboard Navigation

The application is fully accessible and compliant with WCAG 2.1 AA guidelines.

### Keyboard Shortcuts
**File:** `frontend/src/hooks/useKeyboardShortcuts.js`

**Available Shortcuts:**
- **`/`** - Focus location search (like GitHub/Slack)
- **`Escape`** - Clear focus, close dropdowns
- **`Ctrl/Cmd+K`** - Quick search (prepared for future features)
- **`Tab`** - Navigate through interactive elements
- **`Shift+Tab`** - Navigate backwards

**Usage:**
```javascript
// In any component
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';

useKeyboardShortcuts({
  onFocusSearch: () => { /* focus search */ },
  onEscape: () => { /* clear focus */ }
});
```

### Skip Navigation Links
**Component:** `SkipToContent.jsx`

Provides quick navigation for keyboard users to bypass repetitive content:
- Skip to main content
- Skip to location search
- Skip to weather charts

**Features:**
- Only visible when focused (Tab key)
- Smooth scroll with focus management
- High contrast mode support
- WCAG 2.1 compliant

### ARIA Labels & Semantic HTML

**LocationSearchBar:**
- `role="combobox"` - Search input
- `aria-autocomplete="list"` - Dropdown suggestions
- `aria-controls` - Links input to results
- `aria-expanded` - Dropdown state
- `aria-activedescendant` - Active result
- `role="listbox"` - Results container
- `role="option"` - Individual results

**Interactive Elements:**
- All buttons have descriptive `aria-label` attributes
- Loading states use `aria-busy`
- Decorative icons marked with `aria-hidden="true"`
- Proper semantic HTML (`<main>`, `<nav>`, etc.)

### Screen Reader Support

**Announcements:**
- Location changes announced automatically
- Search focus announced
- Loading states announced
- Status updates for location detection

**Implementation:**
```javascript
import { useScreenReaderAnnouncement } from '../../hooks/useKeyboardShortcuts';

const { announce } = useScreenReaderAnnouncement();
announce('Location changed to New York, NY');
```

### Focus Management

**Features:**
- Sections focusable via `tabIndex={-1}`
- Skip links manage focus automatically
- Smooth scroll to content
- Visual focus indicators throughout
- Focus trap prepared for modals

**Testing Accessibility:**
1. **Keyboard-only navigation:** Unplug mouse, navigate with Tab/Enter/Escape
2. **Screen reader:** Test with NVDA (Windows), JAWS (Windows), or VoiceOver (Mac)
3. **High contrast mode:** Enable in OS settings
4. **Zoom:** Test at 200% zoom
5. **Browser extensions:** Use axe DevTools or Lighthouse

## Testing

Frontend uses Jest and React Testing Library (configured via react-scripts).
Backend testing framework not yet implemented.
- 1 is done by me and two other people, great job! let's move forward with 3, 4 and 5