import React, { useState } from 'react';
import { useForecast } from '../../hooks/useWeatherData';
import {
  useThisDayInHistory,
  useForecastComparison,
  useRecordTemperatures,
  useTemperatureProbability
} from '../../hooks/useClimateData';
import TemperatureBandChart from '../charts/TemperatureBandChart';
import PrecipitationChart from '../charts/PrecipitationChart';
import WindChart from '../charts/WindChart';
import CloudCoverChart from '../charts/CloudCoverChart';
import UVIndexChart from '../charts/UVIndexChart';
import WeatherOverviewChart from '../charts/WeatherOverviewChart';
import HistoricalComparisonChart from '../charts/HistoricalComparisonChart';
import RecordTemperaturesChart from '../charts/RecordTemperaturesChart';
import TemperatureProbabilityChart from '../charts/TemperatureProbabilityChart';
import ThisDayInHistoryCard from '../cards/ThisDayInHistoryCard';
import './WeatherDashboard.css';

/**
 * Weather Dashboard Component
 * Main dashboard displaying weather charts and data
 */
function WeatherDashboard() {
  const [location, setLocation] = useState('London,UK');
  const [days, setDays] = useState(7);
  const [unit, setUnit] = useState('C');
  const [inputLocation, setInputLocation] = useState('London,UK');

  // Chart visibility state
  const [visibleCharts, setVisibleCharts] = useState({
    temperature: true,
    precipitation: true,
    wind: true,
    cloudCover: true,
    uvIndex: true,
    overview: true,
    // Historical/Climate charts
    thisDayHistory: true,
    historicalComparison: false,
    recordTemps: false,
    tempProbability: false
  });

  // Fetch weather data
  const { data, loading, error } = useForecast(location, days);

  // Fetch climate/historical data
  const thisDayHistory = useThisDayInHistory(location, null, 10);
  const forecastComparison = useForecastComparison(location, data?.forecast || [], 10);

  // Get date ranges for records and probability
  const today = new Date();
  const startDate = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const endDateObj = new Date(today);
  endDateObj.setDate(today.getDate() + days);
  const endDate = `${String(endDateObj.getMonth() + 1).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`;

  const recordTemps = useRecordTemperatures(location, startDate, endDate, 10);
  const tempProbability = useTemperatureProbability(location, startDate, endDate, 10);

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (inputLocation.trim()) {
      setLocation(inputLocation.trim());
    }
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

      {/* Controls */}
      <div className="dashboard-controls">
        <form onSubmit={handleLocationSubmit} className="location-form">
          <input
            type="text"
            className="location-input"
            placeholder="Enter location (e.g., London,UK)"
            value={inputLocation}
            onChange={(e) => setInputLocation(e.target.value)}
          />
          <button type="submit" className="location-button">
            Search
          </button>
        </form>

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

          <label className="control-label">
            Units:
            <select
              className="control-select"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="C">Celsius</option>
              <option value="F">Fahrenheit</option>
            </select>
          </label>
        </div>
      </div>

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
          {/* Location Info */}
          <div className="location-info">
            <h2 className="location-name">{data.location?.address || location}</h2>
            <p className="location-coords">
              {data.location?.latitude?.toFixed(4)}, {data.location?.longitude?.toFixed(4)}
            </p>
            <p className="location-timezone">{data.location?.timezone}</p>
          </div>

          {/* Chart Visibility Controls */}
          <div className="chart-controls">
            <div className="chart-controls-header">
              <h3>📊 Charts ({visibleChartCount}/{Object.keys(visibleCharts).length} visible)</h3>
              <div className="chart-toggle-buttons">
                <button
                  className="toggle-all-button"
                  onClick={() => setVisibleCharts({
                    temperature: true,
                    precipitation: true,
                    wind: true,
                    cloudCover: true,
                    uvIndex: true,
                    overview: true,
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
                    temperature: false,
                    precipitation: false,
                    wind: false,
                    cloudCover: false,
                    uvIndex: false,
                    overview: false,
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

              {/* Historical/Climate toggles */}
              <div style={{ width: '100%', height: '1px', background: '#e5e7eb', margin: '8px 0' }} />

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
            {visibleCharts.temperature && (
              <div className="chart-card">
                <TemperatureBandChart
                  data={data.forecast || []}
                  unit={unit}
                  height={400}
                />
              </div>
            )}

            {visibleCharts.precipitation && (
              <div className="chart-card">
                <PrecipitationChart
                  data={data.forecast || []}
                  height={350}
                />
              </div>
            )}

            {visibleCharts.wind && (
              <div className="chart-card">
                <WindChart
                  data={data.forecast || []}
                  height={350}
                />
              </div>
            )}

            {visibleCharts.cloudCover && (
              <div className="chart-card">
                <CloudCoverChart
                  data={data.forecast || []}
                  height={350}
                />
              </div>
            )}

            {visibleCharts.uvIndex && (
              <div className="chart-card">
                <UVIndexChart
                  data={data.forecast || []}
                  height={350}
                />
              </div>
            )}

            {visibleCharts.overview && (
              <div className="chart-card chart-card-wide">
                <WeatherOverviewChart
                  data={data.forecast || []}
                  unit={unit}
                  height={450}
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
