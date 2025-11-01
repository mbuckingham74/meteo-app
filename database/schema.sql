-- Meteo App Database Schema
-- Weather Spark Clone - Database Structure

-- Shared AI Answers table: stores shareable AI weather analysis results
CREATE TABLE IF NOT EXISTS shared_ai_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    share_id VARCHAR(10) NOT NULL UNIQUE COMMENT 'Short URL-safe ID (e.g., "abc123xyz")',
    question TEXT NOT NULL COMMENT 'Original user question',
    answer TEXT NOT NULL COMMENT 'AI generated answer',
    location VARCHAR(255) NOT NULL COMMENT 'Location the question was about',
    weather_data JSON COMMENT 'Weather data snapshot at time of query',
    visualizations JSON COMMENT 'Suggested visualizations array',
    follow_up_questions JSON COMMENT 'Follow-up questions array',
    confidence VARCHAR(20) COMMENT 'AI confidence level (high/medium/low)',
    tokens_used INT COMMENT 'Number of tokens used for this query',
    model VARCHAR(50) COMMENT 'AI model used (e.g., claude-sonnet-4-20250514)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the answer was created',
    expires_at TIMESTAMP NOT NULL COMMENT 'When the share link expires (7 days from creation)',
    views INT DEFAULT 0 COMMENT 'Number of times this shared answer was viewed',
    INDEX idx_share_id (share_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Locations table: stores cities and geographic data
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    country_code CHAR(2),
    state VARCHAR(100),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    timezone VARCHAR(100),
    elevation INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_city_country (city_name, country),
    INDEX idx_coordinates (latitude, longitude),
    UNIQUE KEY unique_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Weather data table: stores historical and current weather observations
CREATE TABLE IF NOT EXISTS weather_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL,
    observation_date DATE NOT NULL,
    observation_time TIME,
    temperature_high DECIMAL(5, 2),
    temperature_low DECIMAL(5, 2),
    temperature_avg DECIMAL(5, 2),
    feels_like DECIMAL(5, 2),
    humidity INT,
    pressure DECIMAL(6, 2),
    wind_speed DECIMAL(5, 2),
    wind_direction INT,
    precipitation DECIMAL(6, 2),
    precipitation_probability INT,
    cloud_cover INT,
    uv_index INT,
    visibility DECIMAL(6, 2),
    weather_condition VARCHAR(100),
    weather_description TEXT,
    sunrise TIME,
    sunset TIME,
    data_source VARCHAR(50) COMMENT 'openweather or visualcrossing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    INDEX idx_location_date (location_id, observation_date),
    INDEX idx_date (observation_date),
    INDEX idx_source (data_source),
    UNIQUE KEY unique_observation (location_id, observation_date, observation_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Climate statistics table: stores monthly/yearly averages
CREATE TABLE IF NOT EXISTS climate_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL,
    month INT NOT NULL COMMENT '1-12',
    avg_temp_high DECIMAL(5, 2),
    avg_temp_low DECIMAL(5, 2),
    record_high DECIMAL(5, 2),
    record_low DECIMAL(5, 2),
    avg_precipitation DECIMAL(6, 2),
    avg_humidity INT,
    avg_wind_speed DECIMAL(5, 2),
    sunny_days INT,
    rainy_days INT,
    snowy_days INT,
    data_year_start INT,
    data_year_end INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    INDEX idx_location_month (location_id, month),
    UNIQUE KEY unique_climate_stat (location_id, month, data_year_start, data_year_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table: for user accounts and preferences
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    preferred_temp_unit ENUM('celsius', 'fahrenheit') DEFAULT 'fahrenheit',
    preferred_wind_unit ENUM('mph', 'kmh', 'ms', 'knots') DEFAULT 'mph',
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User favorite locations table
CREATE TABLE IF NOT EXISTS user_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    location_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, location_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API cache table: cache API responses to reduce API calls
CREATE TABLE IF NOT EXISTS api_cache (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    location_id INT,
    api_source VARCHAR(50) NOT NULL,
    request_params JSON,
    response_data JSON NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    INDEX idx_cache_key (cache_key),
    INDEX idx_expiry (expires_at),
    INDEX idx_location_source (location_id, api_source)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
