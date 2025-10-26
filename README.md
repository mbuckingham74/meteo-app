# Meteo Weather App

A comprehensive weather dashboard inspired by Weather Spark, providing detailed weather forecasts, historical climate data analysis, air quality monitoring, and location comparison tools.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## 🌟 Key Highlights

- **📊 Rich Data Visualization** - 15+ interactive charts for weather analysis
- **⚠️ Weather Alerts** - Real-time severe weather warnings and advisories
- **💨 Air Quality Monitoring** - Live AQI data with health recommendations
- **📈 10-Year Climate Analysis** - Historical trends and statistical insights
- **🔐 User Accounts** - Cloud-synced favorites and preferences
- **🎨 Theme System** - Light, dark, and auto modes
- **🌍 Location Comparison** - Compare weather across multiple cities
- **📱 Mobile Responsive** - Fully optimized for all device sizes

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 🌤️ Weather Forecasts

- **Multi-Day Forecasts** - 3, 7, or 14-day weather forecasts with dynamic time labels
- **48-Hour Detailed View** - Hourly forecasts with temperature, feels-like, precipitation, and wind data
- **Current Conditions Display** - Real-time temperature, feels-like, weather conditions, wind speed, humidity, visibility, and cloud cover
- **Temperature Unit Toggle** - Global Celsius/Fahrenheit toggle in header that syncs across all components
  - Persists to localStorage for guest users
  - Cloud-synced for authenticated users
  - Works consistently on all pages including location comparison
- **Weather Alerts** - Real-time severe weather warnings, watches, and advisories with color-coded severity levels
  - Expandable alert details with onset/end times
  - Automatic severity classification (warning, watch, advisory)

### 📊 Interactive Charts

#### Current Weather Charts
- **Temperature Bands** - Daily high/low/average temperature visualization
- **Feels-Like Temperature** - Compare actual temperature vs. feels-like temperature (wind chill/heat index)
- **Humidity & Dewpoint** - Dual-axis chart showing humidity percentage and dewpoint temperature
- **Sunrise & Sunset** - Visualize sunrise/sunset times with daylight duration calculations
- **Precipitation** - Daily rainfall and precipitation probability
- **Wind** - Wind speed and direction analysis
- **Cloud Cover** - Cloud coverage percentage over time
- **UV Index** - Daily UV exposure levels
- **Multi-Metric Overview** - Combined view of multiple weather metrics

#### Historical Climate Analysis
- **This Day in History** - Historical weather data for the current date over the past 10 years
- **Historical Comparison** - Compare current forecasts against 10-year climate normals
- **Record Temperatures** - Track record highs and lows for date ranges
- **Temperature Probability** - Statistical temperature distribution analysis

### 📍 Location Management

- **Smart Search** - Location search with autocomplete and keyboard navigation
- **Popular Locations** - Quick access to major cities worldwide
- **Geolocation Detection** - Automatic detection of current location via browser with intelligent fallback
  - Works even when reverse geocoding is rate-limited
  - Uses coordinates directly if address lookup fails
- **Favorites System** - Save and manage favorite locations with cloud sync (authentication required)
  - Access favorites from user profile modal
  - Automatic sync across all devices
- **Location Comparison** - Side-by-side weather comparison for 2-4 locations with insights

### 💨 Air Quality Index (AQI)

- **Real-Time AQI Data** - Current air quality index with color-coded severity levels
  - Good (0-50): Green
  - Moderate (51-100): Yellow
  - Unhealthy for Sensitive Groups (101-150): Orange
  - Unhealthy (151-200): Red
  - Very Unhealthy (201-300): Purple
  - Hazardous (301+): Maroon
- **Pollutant Breakdown** - Detailed measurements for:
  - PM2.5 (Fine particulate matter)
  - PM10 (Coarse particulate matter)
  - O₃ (Ozone)
  - NO₂ (Nitrogen dioxide)
  - CO (Carbon monoxide)
  - SO₂ (Sulphur dioxide)
- **Health Recommendations** - Context-aware advice based on current AQI levels
- **Both AQI Standards** - Support for US AQI and European AQI metrics
- **5-Day Forecast** - Hourly air quality predictions

### 👤 User Authentication & Profiles

- **User Registration** - Create account with email and password
- **Secure Login** - JWT-based authentication with token refresh
- **User Profiles** - Manage name, email, and password
- **Cloud Sync** - Favorites automatically sync across all devices
- **Auto-Migration** - localStorage favorites migrate to cloud on login
- **User Preferences** - Save default temperature units, forecast days, and theme
- **Profile Management** - Tab-based interface for profile, preferences, and security settings

### 🎨 Theme System

- **Light Mode** - Clean, bright interface for daytime use
- **Dark Mode** - Easy on the eyes for low-light environments with comprehensive CSS variable system
- **Auto Mode** - Automatically follows system preferences
- **Smart Persistence** - Theme saved to cloud for logged-in users, localStorage for guests
- **Real-time Sync** - Theme preference syncs across all devices for authenticated users
- **Complete Dark Mode Coverage** - All components fully optimized for dark theme including:
  - All charts and visualizations
  - Location search and comparison views
  - Weather alerts and air quality cards
  - User profile and authentication modals
  - Consistent theming across all UI elements

### ⚙️ Customization

- **Chart Visibility Controls** - Show/hide individual charts
- **Quick Toggle** - Show all or hide all charts with one click
- **User Preferences** - Persistent settings for logged-in users
- **Responsive Design** - Mobile-friendly interface

---

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework with Context API for state management
  - AuthContext - User authentication state
  - ThemeContext - Light/dark/auto theme management
  - LocationContext - Global location selection state
  - TemperatureUnitContext - Celsius/Fahrenheit preference
- **Recharts** - Data visualization library
- **CSS3** - Custom styling with CSS variables for theming and gradient designs
- **localStorage** - Client-side preferences and theme storage (with cloud sync for authenticated users)

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database for user data, preferences, and API response caching
- **bcryptjs** - Secure password hashing
- **jsonwebtoken (JWT)** - Token-based authentication
- **Docker** - Containerized development environment
- **Intelligent API Caching** - MySQL-based cache layer reducing API calls by 99%

### External APIs
- **Visual Crossing Weather API** - Weather data, forecasts, historical climate data, and weather alerts
- **Open-Meteo Air Quality API** - Real-time and forecast air quality data (PM2.5, PM10, O₃, NO₂, CO, SO₂)
- **Browser Geolocation API** - Current location detection

---

## 🚀 Setup Instructions

### Prerequisites
- Docker and Docker Compose installed
- Visual Crossing Weather API key ([get free tier](https://www.visualcrossing.com/weather-api))

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/mbuckingham74/meteo-app.git
cd meteo-app
```

#### 2. Configure environment variables

Create `backend/.env`:
```env
VISUAL_CROSSING_API_KEY=your_api_key_here
DB_HOST=db
DB_USER=weather_user
DB_PASSWORD=secure_password
DB_NAME=weather_db
PORT=5001
JWT_SECRET=your_secret_key_here_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_key_here_change_in_production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

#### 3. Start the application
```bash
docker-compose up --build
```

#### 4. Access the application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

---

## 🌐 API Endpoints

### Weather Forecasts

#### Get Multi-Day Forecast
```
GET /api/weather/forecast/:location?days=7
```
- **Parameters**: `days` (3, 7, or 14)
- **Returns**: Daily weather forecast with temperature, precipitation, wind, etc.

#### Get Hourly Forecast
```
GET /api/weather/hourly/:location?hours=48
```
- **Parameters**: `hours` (up to 240)
- **Returns**: Hourly weather data

---

### Historical Climate Data

#### Get Climate Normals
```
GET /api/weather/climate/normals/:location?date=MM-DD&years=10
```
- **Parameters**: `date` (MM-DD format), `years` (default: 10)
- **Returns**: Historical averages and percentiles

#### Get Record Temperatures
```
GET /api/weather/climate/records/:location?start=MM-DD&end=MM-DD&years=10
```
- **Parameters**: `start` date, `end` date, `years`
- **Returns**: Record high/low temperatures for date range

#### Compare Forecast to Historical
```
POST /api/weather/climate/compare/:location
```
- **Body**: `{ forecastData: [...] }`
- **Returns**: Comparison with historical climate normals

#### Get This Day in History
```
GET /api/weather/climate/this-day/:location?date=MM-DD&years=10
```
- **Parameters**: `date` (optional), `years`
- **Returns**: Historical data for specific date

#### Get Temperature Probability
```
GET /api/weather/climate/probability/:location?start=MM-DD&end=MM-DD&years=10
```
- **Parameters**: `start` date, `end` date, `years`
- **Returns**: Temperature distribution statistics

---

### Location Services

#### Search Locations
```
GET /api/locations/geocode?q=London&limit=5
```
- **Parameters**: `q` (query), `limit` (max results)
- **Returns**: List of matching locations

#### Reverse Geocode
```
GET /api/locations/reverse?lat=51.5074&lon=-0.1278
```
- **Parameters**: `lat` (latitude), `lon` (longitude)
- **Returns**: Location details for coordinates

#### Get Popular Locations
```
GET /api/locations/popular
```
- **Returns**: List of popular cities worldwide

---

### Authentication & User Management

#### Register User
```
POST /api/auth/register
```
- **Body**: `{ email, password, name }`
- **Returns**: User object with JWT tokens

#### Login User
```
POST /api/auth/login
```
- **Body**: `{ email, password }`
- **Returns**: User object with JWT tokens

#### Get Current User
```
GET /api/auth/me
```
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: Current user profile

#### Update Profile
```
PUT /api/auth/profile
```
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ name, email }`
- **Returns**: Updated user object

#### Change Password
```
POST /api/auth/change-password
```
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ currentPassword, newPassword }`
- **Returns**: Success message

---

### User Preferences & Favorites

#### Get User Preferences
```
GET /api/user/preferences
```
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: User preferences object

#### Update Preferences
```
PUT /api/user/preferences
```
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ temperature_unit, default_forecast_days, theme }`
- **Returns**: Updated preferences

#### Get Cloud Favorites
```
GET /api/user/favorites
```
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: Array of favorite locations

#### Add Favorite
```
POST /api/user/favorites
```
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ location_name, latitude, longitude, address, timezone }`
- **Returns**: Created favorite object

#### Remove Favorite
```
DELETE /api/user/favorites/:id
```
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: Success message

#### Import Favorites
```
POST /api/user/favorites/import
```
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ favorites: [...] }`
- **Returns**: Import results with count

---

### Air Quality

#### Get Air Quality Data
```
GET /api/air-quality?lat=37.7749&lon=-122.4194&days=5
```
- **Parameters**: `lat` (latitude), `lon` (longitude), `days` (forecast days, max 5)
- **Returns**: Current and forecast air quality data with:
  - US AQI and European AQI values
  - AQI level classification with colors
  - All pollutant measurements (PM2.5, PM10, O₃, NO₂, CO, SO₂)
  - Health recommendations
  - Hourly forecast data
  - Summary statistics

#### Get Air Quality by Location Name
```
GET /api/air-quality/location/:location?lat=37.7749&lon=-122.4194&days=5
```
- **Parameters**: `location` (location name), `lat`, `lon`, `days`
- **Returns**: Air quality data with location context

---

## 📁 Project Structure

```
meteo-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/              # Weather visualization charts
│   │   │   │   ├── TemperatureBandChart.jsx
│   │   │   │   ├── FeelsLikeChart.jsx           # NEW: Feels-like vs actual temp
│   │   │   │   ├── HumidityDewpointChart.jsx    # NEW: Humidity & dewpoint
│   │   │   │   ├── SunChart.jsx                 # NEW: Sunrise/sunset visualization
│   │   │   │   ├── PrecipitationChart.jsx
│   │   │   │   ├── WindChart.jsx
│   │   │   │   ├── CloudCoverChart.jsx
│   │   │   │   ├── UVIndexChart.jsx
│   │   │   │   ├── WeatherOverviewChart.jsx
│   │   │   │   ├── HourlyForecastChart.jsx
│   │   │   │   ├── HistoricalComparisonChart.jsx
│   │   │   │   ├── RecordTemperaturesChart.jsx
│   │   │   │   └── TemperatureProbabilityChart.jsx
│   │   │   ├── cards/               # Weather data cards
│   │   │   │   ├── ThisDayInHistoryCard.jsx
│   │   │   │   └── AirQualityCard.jsx           # NEW: AQI display
│   │   │   ├── auth/                # Authentication components
│   │   │   │   ├── AuthHeader.jsx
│   │   │   │   ├── AuthModal.jsx
│   │   │   │   └── UserProfileModal.jsx         # Includes favorites tab
│   │   │   ├── theme/               # Theme components
│   │   │   │   └── ThemeToggle.jsx
│   │   │   ├── units/               # NEW: Unit preference components
│   │   │   │   └── TemperatureUnitToggle.jsx    # NEW: C/F toggle
│   │   │   ├── location/            # Location management
│   │   │   │   ├── LocationSearchBar.jsx
│   │   │   │   ├── FavoritesPanel.jsx
│   │   │   │   └── LocationComparisonView.jsx
│   │   │   └── weather/             # Main dashboard
│   │   │       ├── WeatherDashboard.jsx
│   │   │       └── WeatherAlertsBanner.jsx      # NEW: Weather alerts display
│   │   ├── contexts/                # React Context providers
│   │   │   ├── AuthContext.js
│   │   │   ├── ThemeContext.js
│   │   │   ├── LocationContext.js               # NEW: Global location state
│   │   │   └── TemperatureUnitContext.js        # NEW: C/F preference
│   │   ├── styles/                  # Global styles
│   │   │   └── themes.css
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useWeatherData.js
│   │   │   └── useClimateData.js
│   │   ├── services/                # API and local services
│   │   │   ├── weatherApi.js
│   │   │   ├── authApi.js
│   │   │   ├── favoritesService.js
│   │   │   └── geolocationService.js
│   │   └── utils/                   # Helper functions
│   │       └── weatherHelpers.js
│   └── public/
│
├── backend/
│   ├── routes/
│   │   ├── weather.js               # Weather API endpoints
│   │   ├── airQuality.js            # NEW: Air quality API endpoints
│   │   ├── locations.js             # Location API endpoints
│   │   ├── auth.js                  # Authentication endpoints
│   │   └── user.js                  # User preferences & favorites
│   ├── services/
│   │   ├── weatherService.js        # Weather data fetching (includes alerts)
│   │   ├── airQualityService.js     # NEW: Air quality data from Open-Meteo
│   │   ├── climateService.js        # Historical climate analysis
│   │   ├── geocodingService.js      # Location search
│   │   ├── authService.js           # Authentication logic
│   │   ├── userPreferencesService.js # User preferences management
│   │   └── userFavoritesService.js  # Cloud favorites management
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT authentication middleware
│   ├── database/
│   │   └── auth-schema.sql          # User & auth database schema
│   └── server.js
│
└── docker-compose.yml
```

---

## 📖 Usage

### Main Dashboard

1. **Search for a location** using the search bar in the controls panel
2. **Use your current location** via the "Use My Location" button
3. **Adjust settings**:
   - Toggle temperature units (°C/°F) in the header (persists for all users)
   - Select forecast duration (3, 7, or 14 days) in the controls panel
4. **View current conditions** - See real-time temperature, weather, wind, humidity, and more
5. **Customize chart visibility** using the chart controls panel
6. **Save favorite locations** (requires login) - Access from user profile modal

### Location Comparison

1. Click **"Compare Locations"** from the main dashboard
2. Search and select locations to compare (2-4 locations)
3. View side-by-side weather data and comparison insights
4. See which location is warmest, coldest, wettest, and temperature differences

### Favorites Management

1. **Login or create an account** (favorites require authentication)
2. **Search for and select a location** on the main dashboard
3. **Open your user profile** by clicking your profile icon in the header
4. **Navigate to the Favorites tab** in the profile modal
5. **Add the current location to favorites** from within the favorites tab
6. **Click any favorite** to quickly load that location's weather data
7. **Remove favorites** by clicking the trash icon next to any saved location

Note: Favorites automatically sync across all your devices when you're logged in.

---

## 🔍 Features in Detail

### Historical Climate Analysis

The app analyzes **10 years of historical weather data** to provide:

- **Climate Normals** - 30-day rolling averages with percentile bands (10th-90th)
- **Record Tracking** - Historical record high and low temperatures
- **Statistical Analysis** - Mean, median, standard deviation for temperature distributions
- **Forecast Context** - Compare current forecasts against historical norms to understand if weather is typical

### Smart Location Search

- **Autocomplete** - Real-time suggestions as you type
- **Debounced Search** - Optimized to reduce API calls (300ms delay)
- **Keyboard Navigation** - Use arrow keys and Enter to navigate results
- **Popular Locations** - Quick access to major cities when search is empty
- **Geolocation** - Automatically detect and reverse geocode your current position

### Data Visualization

All charts are built with **Recharts** and feature:
- Responsive design
- Interactive tooltips
- Custom color schemes
- Gradient fills and area charts
- Dual Y-axes for multi-metric charts
- Summary statistics

---

## 🚀 Performance & Caching

### Intelligent API Caching

The application implements a **MySQL-based caching layer** that dramatically reduces API calls and improves response times:

**Cache Performance:**
- ⚡ **99% reduction** in API requests for repeat queries
- 🏎️ **282x faster** responses (from 850ms to 3ms)
- 💾 Automatic cleanup of expired entries every hour

**Cache TTL (Time To Live):**
- Current Weather: 30 minutes (optimized from 15 min)
- Forecasts: 6 hours (optimized from 2 hours)
- Historical Data: 7 days (optimized from 24 hours)
- Air Quality: 60 minutes (optimized from 30 min)
- Climate Stats: 30 days (optimized from 7 days)

**Cache Management Endpoints:**
- `GET /api/cache/stats` - View cache statistics
- `DELETE /api/cache/expired` - Clear expired entries
- `DELETE /api/cache/location/:id` - Clear location-specific cache

**Benefits:**
- Reduced API costs (stay within free tier limits)
- Faster page loads for cached data
- Better user experience with instant responses
- Automatic expiration ensures fresh data

### Request Throttling & Rate Limit Protection

The application includes intelligent request management to prevent API rate limiting:

**Throttling Features:**
- 🚦 **Max 3 concurrent requests** - Prevents API stampeding
- ⏱️ **100ms minimum interval** - Spaces out requests to avoid rate limits
- 🔄 **Exponential backoff retry** - Automatically retries failed requests with increasing delays
- 🛡️ **Graceful fallbacks** - Continues to work even when API limits are hit
  - Geolocation uses coordinates if reverse geocoding fails
  - Cached data served when fresh requests are blocked

**How it Works:**
- Requests queue automatically when limits are reached
- Retry logic: Initial request → Wait 1s → Retry → Wait 2s → Final retry
- Prevents cascade failures across multiple components
- User experience maintained even during high API usage

## ⚠️ API Rate Limiting

The Visual Crossing API has rate limits on the free tier:
- **1,000 records per day**
- Historical climate features make multiple API calls (10+ for 10-year analysis)
- **With caching enabled**, most requests are served from cache, dramatically reducing API usage
- Consider the API costs when enabling multiple historical charts

---

## 🤝 Contributing

This is a learning project inspired by Weather Spark. Contributions and suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use this project for learning and development.

---

## 🙏 Data Attribution

- Weather data and alerts provided by **[Visual Crossing Weather API](https://www.visualcrossing.com/)**
- Air quality data provided by **[Open-Meteo Air Quality API](https://open-meteo.com/)**
- Visualizations inspired by **[Weather Spark](https://weatherspark.com/)**

---

## 🗺️ Project Status & Roadmap

### ✅ Completed Features

**Core Weather Functionality**
- [x] Multi-day forecasts (3, 7, 14 days) with Visual Crossing API
- [x] 48-hour detailed hourly forecasts
- [x] Interactive weather charts (temperature, precipitation, wind, UV, cloud cover)
- [x] Real-time weather alerts and severe weather warnings
- [x] Air quality index (AQI) with pollutant breakdown
- [x] Enhanced visualizations (humidity/dewpoint, sunrise/sunset, feels-like temps)

**Historical Climate Analysis**
- [x] 10-year historical climate data analysis
- [x] "This Day in History" feature
- [x] Historical comparison charts (forecast vs. climate normals)
- [x] Record temperature tracking
- [x] Temperature probability distributions

**User Experience**
- [x] User authentication system (JWT-based)
- [x] Cloud-synced favorites across devices
- [x] Light/dark/auto theme system with cloud persistence
- [x] User profiles with customizable preferences
- [x] Location search with autocomplete and geolocation
- [x] Location comparison tool (2-4 locations side-by-side)
- [x] Responsive mobile design
- [x] Chart visibility controls

**Performance & Infrastructure**
- [x] MySQL-based API response caching (99% reduction in API calls)
- [x] Automatic cache expiration and cleanup
- [x] Cache monitoring and management endpoints
- [x] Request throttling and exponential backoff retry
- [x] Graceful API rate limit handling

**Recent Enhancements (2025)**
- [x] Comprehensive dark mode CSS refactor using variable system
- [x] Global temperature unit sync across all components
- [x] Enhanced location comparison insights
- [x] Improved theme consistency across all UI elements
- [x] Better error handling and fallback mechanisms

### 🚧 Planned Enhancements

**Data & Features**
- [ ] Push notifications for severe weather alerts
- [ ] Extended historical data (20+ years of climate analysis)
- [ ] Seasonal climate summaries and trends
- [ ] Weather radar integration
- [ ] Marine and aviation weather data
- [ ] Pollen and allergen forecasts

**User Experience**
- [ ] Mobile app (iOS/Android with React Native)
- [ ] Data export capabilities (CSV, PDF reports)
- [ ] Customizable dashboard layouts (drag-and-drop widgets)
- [ ] Multi-language support (i18n)
- [ ] Accessibility improvements (WCAG compliance)

**Performance & Technical**
- [ ] Redis caching layer (upgrade from MySQL cache)
- [ ] Offline mode with local data storage
- [ ] Progressive Web App (PWA) capabilities
- [ ] GraphQL API option
- [ ] Webhook support for automated weather updates
- [ ] CDN integration for static assets

---

**Built with ❤️ using React, Node.js, and the Visual Crossing Weather API**
