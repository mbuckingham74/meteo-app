# Database Documentation

This directory contains the database schema and seed data for the Meteo App.

## Files

- **schema.sql** - Complete database schema with all tables and indexes
- **seed.sql** - Sample location data for testing and development

## Database Tables

### locations
Stores geographic information for cities and weather stations:
- City name, country, coordinates
- Timezone and elevation data
- Indexed for fast location lookups

### weather_data
Historical and current weather observations:
- Temperature (high, low, average, feels-like)
- Precipitation, humidity, pressure
- Wind speed and direction
- UV index, visibility, cloud cover
- Supports both OpenWeather and Visual Crossing data sources

### climate_stats
Long-term climate statistics by month:
- Average and record temperatures
- Precipitation averages
- Sunny/rainy/snowy day counts
- Based on 10-year historical data

### users
User accounts with preferences:
- Email and password authentication
- Temperature unit preference (Celsius/Fahrenheit)
- Wind speed unit preference
- Language preference

### user_favorites
User's saved favorite locations for quick access

### api_cache
Caches weather API responses:
- Reduces API calls and costs
- Improves response times
- Configurable expiration times

## Initialization

### Option 1: Using Node.js script (Recommended)
```bash
cd backend
npm run db:init
```

This will:
1. Test database connection
2. Create all tables
3. Insert sample location data

### Option 2: Manual SQL execution
```bash
# From the project root
mysql -h localhost -P 3307 -u root -p meteo_app < database/schema.sql
mysql -h localhost -P 3307 -u root -p meteo_app < database/seed.sql
```

### Option 3: Inside Docker container
```bash
docker exec -i meteo-mysql mysql -uroot -p meteo_app < database/schema.sql
docker exec -i meteo-mysql mysql -uroot -p meteo_app < database/seed.sql
```

## Sample Locations

The seed file includes 10 major cities:
- New York, USA
- London, UK
- Tokyo, Japan
- Paris, France
- Sydney, Australia
- Los Angeles, USA
- Singapore
- Dubai, UAE
- Berlin, Germany
- Toronto, Canada

## Database Indexes

The schema includes indexes for optimal query performance:
- Location coordinates (for geo-based searches)
- Date ranges (for historical queries)
- User favorites
- API cache lookups
