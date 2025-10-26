import React, { useState } from 'react';
import { useLocation } from '../../contexts/LocationContext';
import { useTemperatureUnit } from '../../contexts/TemperatureUnitContext';
import { useForecast, useHourlyForecast, useCurrentWeather } from '../../hooks/useWeatherData';
import {
  useThisDayInHistory,
  useForecastComparison,
  useRecordTemperatures,
  useTemperatureProbability
} from '../../hooks/useClimateData';
import { getCurrentLocation } from '../../services/geolocationService';
import { celsiusToFahrenheit } from '../../utils/weatherHelpers';
import TemperatureBandChart from '../charts/TemperatureBandChart';
import PrecipitationChart from '../charts/PrecipitationChart';
import WindChart from '../charts/WindChart';
import CloudCoverChart from '../charts/CloudCoverChart';
import UVIndexChart from '../charts/UVIndexChart';
import WeatherOverviewChart from '../charts/WeatherOverviewChart';
import HourlyForecastChart from '../charts/HourlyForecastChart';
import HistoricalComparisonChart from '../charts/HistoricalComparisonChart';
import RecordTemperaturesChart from '../charts/RecordTemperaturesChart';
import TemperatureProbabilityChart from '../charts/TemperatureProbabilityChart';
import HumidityDewpointChart from '../charts/HumidityDewpointChart';
import SunChart from '../charts/SunChart';
import FeelsLikeChart from '../charts/FeelsLikeChart';
import ThisDayInHistoryCard from '../cards/ThisDayInHistoryCard';
import AirQualityCard from '../cards/AirQualityCard';
import WeatherAlertsBanner from './WeatherAlertsBanner';
import LocationSearchBar from '../location/LocationSearchBar';
import RadarMap from './RadarMap';
import './WeatherDashboard.css';

/**
 * Weather Dashboard Component
 * Main dashboard displaying weather charts and data
 */
function WeatherDashboard() {
  // Use shared location state from context
  const { location, locationData, selectLocation } = useLocation();
  const { unit } = useTemperatureUnit();

  const [days, setDays] = useState(7);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Chart visibility state
  const [visibleCharts, setVisibleCharts] = useState({
    hourly: true,
    temperature: true,
    precipitation: true,
    wind: true,
    cloudCover: true,
    uvIndex: true,
    overview: true,
    // New enhanced charts
    humidityDew: true,
    sunriseSunset: true,
    feelsLike: true,
    airQuality: true,
    // Historical/Climate charts
    thisDayHistory: true,
    historicalComparison: false,
    recordTemps: false,
    tempProbability: false
  });

  // Fetch weather data
  const { data, loading, error } = useForecast(location, days);
  const hourlyData = useHourlyForecast(location, 48);
  const currentWeather = useCurrentWeather(location);

  // Get date ranges for records and probability
  const today = new Date();
  const startDate = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const endDateObj = new Date(today);
  endDateObj.setDate(today.getDate() + days);
  const endDate = `${String(endDateObj.getMonth() + 1).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`;

  // Fetch climate/historical data ONLY if charts are visible
  // This prevents unnecessary API calls and helps stay within rate limits
  const thisDayHistory = useThisDayInHistory(
    visibleCharts.thisDayHistory ? location : null,
    null,
    10
  );
  const forecastComparison = useForecastComparison(
    visibleCharts.historicalComparison ? location : null,
    visibleCharts.historicalComparison ? (data?.forecast || []) : [],
    10
  );
  const recordTemps = useRecordTemperatures(
    visibleCharts.recordTemps ? location : null,
    startDate,
    endDate,
    10
  );
  const tempProbability = useTemperatureProbability(
    visibleCharts.tempProbability ? location : null,
    startDate,
    endDate,
    10
  );

  // Handle location selection from search
  const handleLocationSelect = (locationObj) => {
    selectLocation(locationObj);
    setLocationError(null);
  };

  // Handle current location detection
  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    setLocationError(null);

    try {
      const currentLoc = await getCurrentLocation();
      selectLocation(currentLoc);
    } catch (error) {
      setLocationError(error.message);
    } finally {
      setDetectingLocation(false);
    }
  };

  // Handle adding current location to favorites
  // Note: Currently unused - favorites are managed through FavoritesPanel
  // Keeping for potential future use (quick-add button in dashboard)
  // const handleToggleFavorite = () => {
  //   if (locationData) {
  //     const favorited = isFavorite(locationData.latitude, locationData.longitude);
  //     if (!favorited) {
  //       addFavorite(locationData);
  //     }
  //   }
  // };

  // Helper to convert temperature from API (Celsius) to selected unit
  const convertTemp = (tempCelsius) => {
    if (tempCelsius === null || tempCelsius === undefined) return '--';
    return unit === 'F' ? Math.round(celsiusToFahrenheit(tempCelsius)) : Math.round(tempCelsius);
  };

  // Toggle chart visibility
  const toggleChart = (chartName) => {
    setVisibleCharts(prev => ({
      ...prev,
      [chartName]: !prev[chartName]
    }));
  };

  // Count visible charts
  const visibleChartCount = Object.values(visibleCharts).filter(Boolean).length;

  return (
    <div className="weather-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">
          <span className="title-icon">🌤️</span>
          Meteo Weather
        </h1>
        <p className="dashboard-subtitle">Historical Weather Data & Forecasts</p>
      </header>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading weather data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p className="error-icon">⚠️</p>
          <p className="error-message">Error: {error}</p>
          <p className="error-hint">Please check the location and try again.</p>
        </div>
      )}

      {/* Data Display */}
      {!loading && !error && data && (
        <>
          {/* City Box and Lookup Controls - Side by Side */}
          <div className="dashboard-main-row">
            {/* Location Info with Current Conditions - 75% */}
            <div className="location-info">
              {/* Header: City name left, Coords/Timezone right */}
              <div className="location-header">
                <h2 className="location-name">
                  {data.location?.address || locationData?.address || location || 'Unknown Location'}
                </h2>
                <p className="location-coords">
                  {data.location?.latitude?.toFixed(4) || locationData?.latitude?.toFixed(4)}, {data.location?.longitude?.toFixed(4) || locationData?.longitude?.toFixed(4)}
                  {(data.location?.timezone || locationData?.timezone) && ` • ${data.location?.timezone || locationData?.timezone}`}
                </p>
              </div>

              {/* Current Conditions - Centered */}
              {currentWeather.data && !currentWeather.loading && (
                <div className="current-conditions">
                  <div className="current-main">
                    <div className="current-temp">
                      {convertTemp(currentWeather.data.current.temperature)}°{unit}
                    </div>
                    <div className="current-details">
                      <div className="current-condition">{currentWeather.data.current.conditions}</div>
                      <div className="current-feels-like">
                        Feels like {convertTemp(currentWeather.data.current.feelsLike)}°{unit}
                      </div>
                    </div>
                  </div>

                  <div className="current-stats">
                    <div className="current-stat">
                      <span className="stat-icon">💨</span>
                      <span className="stat-value">{Math.round(currentWeather.data.current.windSpeed)} mph</span>
                      <span className="stat-label">Wind</span>
                    </div>
                    <div className="current-stat">
                      <span className="stat-icon">💧</span>
                      <span className="stat-value">{currentWeather.data.current.humidity}%</span>
                      <span className="stat-label">Humidity</span>
                    </div>
                    <div className="current-stat">
                      <span className="stat-icon">👁️</span>
                      <span className="stat-value">{currentWeather.data.current.visibility} mi</span>
                      <span className="stat-label">Visibility</span>
                    </div>
                    <div className="current-stat">
                      <span className="stat-icon">☁️</span>
                      <span className="stat-value">{currentWeather.data.current.cloudCover}%</span>
                      <span className="stat-label">Clouds</span>
                    </div>
                  </div>

                  <div className="current-footer">
                    {data.location && (
                      <RadarMap
                        latitude={data.location.latitude}
                        longitude={data.location.longitude}
                        zoom={8}
                        height={250}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

          {/* Lookup Controls - 25% */}
          <div className="dashboard-controls">
            <h3 className="controls-title">Location</h3>

            <div className="location-search-section">
              <LocationSearchBar
                onLocationSelect={handleLocationSelect}
                currentLocation={locationData}
              />
              <div className="location-actions">
                <button
                  className="location-action-button detect-location"
                  onClick={handleDetectLocation}
                  disabled={detectingLocation}
                >
                  {detectingLocation ? '🔄' : '📍'} {detectingLocation ? 'Detecting...' : 'Use My Location'}
                </button>
                <a href="/compare" className="location-action-button compare-link">
                  📊 Compare Locations
                </a>
              </div>
              {locationError && (
                <div className="location-error">
                  ⚠️ {locationError}
                </div>
              )}
            </div>

            <div className="control-group">
              <label className="control-label">
                Forecast Days:
                <select
                  className="control-select"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                >
                  <option value={3}>3 days</option>
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                </select>
              </label>
            </div>
          </div>
        </div>

          {/* Weather Alerts */}
          {data.alerts && data.alerts.length > 0 && (
            <WeatherAlertsBanner alerts={data.alerts} />
          )}

          {/* Chart Visibility Controls */}
          <div className="chart-controls">
            <div className="chart-controls-header">
              <h3>📊 Charts ({visibleChartCount}/{Object.keys(visibleCharts).length} visible)</h3>
              <div className="chart-toggle-buttons">
                <button
                  className="toggle-all-button"
                  onClick={() => setVisibleCharts({
                    hourly: true,
                    temperature: true,
                    precipitation: true,
                    wind: true,
                    cloudCover: true,
                    uvIndex: true,
                    overview: true,
                    humidityDew: true,
                    sunriseSunset: true,
                    feelsLike: true,
                    airQuality: true,
                    thisDayHistory: true,
                    historicalComparison: true,
                    recordTemps: true,
                    tempProbability: true
                  })}
                >
                  Show All
                </button>
                <button
                  className="toggle-all-button"
                  onClick={() => setVisibleCharts({
                    hourly: false,
                    temperature: false,
                    precipitation: false,
                    wind: false,
                    cloudCover: false,
                    uvIndex: false,
                    overview: false,
                    humidityDew: false,
                    sunriseSunset: false,
                    feelsLike: false,
                    airQuality: false,
                    thisDayHistory: false,
                    historicalComparison: false,
                    recordTemps: false,
                    tempProbability: false
                  })}
                >
                  Hide All
                </button>
              </div>
            </div>
            <div className="chart-toggles">
              <label className="chart-toggle">
                <input
                  type="checkbox"
                  checked={visibleCharts.hourly}
                  onChange={() => toggleChart('hourly')}
                />
                <span>🕐 48-Hour Forecast</span>
              </label>
              <label className="chart-toggle">
                <input
                  type="checkbox"
                  checked={visibleCharts.temperature}
                  onChange={() => toggleChart('temperature')}
                />
                <span>🌡️ Temperature Bands</span>
              </label>
              <label className="chart-toggle">
                <input
                  type="checkbox"
                  checked={visibleCharts.precipitation}
                  onChange={() => toggleChart('precipitation')}
                />
                <span>🌧️ Precipitation</span>
              </label>
              <label className="chart-toggle">
                <input
                  type="checkbox"
                  checked={visibleCharts.wind}
                  onChange={() => toggleChart('wind')}
                />
                <span>💨 Wind</span>
              </label>
              <label className="chart-toggle">
                <input
                  type="checkbox"
                  checked={visibleCharts.cloudCover}
                  onChange={() => toggleChart('cloudCover')}
                />
                <span>☁️ Cloud Cover</span>
              </label>
              <label className="chart-toggle">
                <input
                  type="checkbox"
                  checked={visibleCharts.uvIndex}
                  onChange={() => toggleChart('uvIndex')}
                />
                <span>☀️ UV Index</span>
              </label>
              <label className="chart-toggle">
                <input
                  type="checkbox"
                  checked={visibleCharts.overview}
                  onChange={() => toggleChart('overview')}
                />
                <span>📈 Multi-Metric Overview</span>
              </label>
              <label className="chart-toggle">
                <input
                  type="checkbox"
                  checked={visibleCharts.humidityDew}
                  onChange={() => toggleChart('humidityDew')}
                />
                <span>💧 Humidity & Dewpoint</span>
              </label>
              <label className="chart-toggle">
                <input
                  type="checkbox"
                  checked={visibleCharts.sunriseSunset}
                  onChange={() => toggleChart('sunriseSunset')}
                />
                <span>🌅 Sunrise & Sunset</span>
              </label>
              <label className="chart-toggle">
                <input
                  type="checkbox"
                  checked={visibleCharts.feelsLike}
                  onChange={() => toggleChart('feelsLike')}
                />
                <span>🌡️ Feels Like Temperature</span>
              </label>
              <label className="chart-toggle">
                <input
                  type="checkbox"
                  checked={visibleCharts.airQuality}
                  onChange={() => toggleChart('airQuality')}
                />
                <span>💨 Air Quality Index</span>
              </label>

              {/* Historical/Climate toggles */}
              <div style={{ width: '100%', height: '1px', background: 'var(--border-light)', margin: '8px 0' }} />

              <label className="chart-toggle">
                <input
                  type="checkbox"
                  checked={visibleCharts.thisDayHistory}
                  onChange={() => toggleChart('thisDayHistory')}
                />
                <span>📅 This Day in History</span>
              </label>
              <label className="chart-toggle">
                <input
                  type="checkbox"
                  checked={visibleCharts.historicalComparison}
                  onChange={() => toggleChart('historicalComparison')}
                />
                <span>📊 Historical Comparison</span>
              </label>
              <label className="chart-toggle">
                <input
                  type="checkbox"
                  checked={visibleCharts.recordTemps}
                  onChange={() => toggleChart('recordTemps')}
                />
                <span>🏆 Record Temperatures</span>
              </label>
              <label className="chart-toggle">
                <input
                  type="checkbox"
                  checked={visibleCharts.tempProbability}
                  onChange={() => toggleChart('tempProbability')}
                />
                <span>📉 Temperature Probability</span>
              </label>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            {/* Hourly Forecast - Full Width */}
            {visibleCharts.hourly && (
              <div className="chart-card chart-card-wide">
                <HourlyForecastChart
                  hourlyData={hourlyData.data?.hourly || []}
                  unit={unit}
                  height={400}
                />
              </div>
            )}

            {visibleCharts.temperature && (
              <div className="chart-card">
                <TemperatureBandChart
                  data={data.forecast || []}
                  unit={unit}
                  height={400}
                  days={days}
                />
              </div>
            )}

            {visibleCharts.precipitation && (
              <div className="chart-card">
                <PrecipitationChart
                  data={data.forecast || []}
                  height={350}
                  days={days}
                />
              </div>
            )}

            {visibleCharts.wind && (
              <div className="chart-card">
                <WindChart
                  data={data.forecast || []}
                  height={350}
                  days={days}
                />
              </div>
            )}

            {visibleCharts.cloudCover && (
              <div className="chart-card">
                <CloudCoverChart
                  data={data.forecast || []}
                  height={350}
                  days={days}
                />
              </div>
            )}

            {visibleCharts.uvIndex && (
              <div className="chart-card">
                <UVIndexChart
                  data={data.forecast || []}
                  height={350}
                  days={days}
                />
              </div>
            )}

            {visibleCharts.overview && (
              <div className="chart-card chart-card-wide">
                <WeatherOverviewChart
                  data={data.forecast || []}
                  unit={unit}
                  height={450}
                  days={days}
                />
              </div>
            )}

            {/* Enhanced Weather Charts */}
            {visibleCharts.humidityDew && (
              <div className="chart-card">
                <HumidityDewpointChart
                  data={data.forecast || []}
                  unit={unit}
                  days={days}
                />
              </div>
            )}

            {visibleCharts.sunriseSunset && (
              <div className="chart-card">
                <SunChart
                  data={data.forecast || []}
                  days={days}
                />
              </div>
            )}

            {visibleCharts.feelsLike && (
              <div className="chart-card">
                <FeelsLikeChart
                  data={data.forecast || []}
                  unit={unit}
                  days={days}
                />
              </div>
            )}

            {visibleCharts.airQuality && data.location && (
              <div className="chart-card">
                <AirQualityCard
                  latitude={data.location.latitude}
                  longitude={data.location.longitude}
                />
              </div>
            )}

            {/* Historical/Climate Charts */}
            {visibleCharts.thisDayHistory && (
              <div className="chart-card chart-card-wide">
                <ThisDayInHistoryCard
                  historyData={thisDayHistory.data}
                  unit={unit}
                />
              </div>
            )}

            {visibleCharts.historicalComparison && (
              <div className="chart-card chart-card-wide">
                <HistoricalComparisonChart
                  forecastData={data.forecast || []}
                  historicalData={forecastComparison.data || []}
                  unit={unit}
                  height={400}
                />
              </div>
            )}

            {visibleCharts.recordTemps && (
              <div className="chart-card chart-card-wide">
                <RecordTemperaturesChart
                  records={recordTemps.data?.records || []}
                  unit={unit}
                  height={400}
                />
              </div>
            )}

            {visibleCharts.tempProbability && (
              <div className="chart-card chart-card-wide">
                <TemperatureProbabilityChart
                  probabilityData={tempProbability.data}
                  unit={unit}
                  height={400}
                />
              </div>
            )}
          </div>

          {/* No charts selected message */}
          {visibleChartCount === 0 && (
            <div className="no-charts-message">
              <p>📊 No charts selected</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Use the toggles above to show weather charts
              </p>
            </div>
          )}

          {/* API Cost Info */}
          {data.queryCost && (
            <div className="api-info">
              <p>API Query Cost: {data.queryCost}</p>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>Data provided by Visual Crossing Weather API</p>
        <p>Weather Spark-inspired visualizations</p>
      </footer>
    </div>
  );
}

export default WeatherDashboard;
