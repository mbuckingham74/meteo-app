import React, { useState } from 'react';
import { useForecast } from '../../hooks/useWeatherData';
import TemperatureBandChart from '../charts/TemperatureBandChart';
import PrecipitationChart from '../charts/PrecipitationChart';
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

  const { data, loading, error } = useForecast(location, days);

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (inputLocation.trim()) {
      setLocation(inputLocation.trim());
    }
  };

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

          {/* Charts */}
          <div className="charts-grid">
            <div className="chart-card">
              <TemperatureBandChart
                data={data.forecast || []}
                unit={unit}
                height={400}
              />
            </div>

            <div className="chart-card">
              <PrecipitationChart
                data={data.forecast || []}
                height={350}
              />
            </div>
          </div>

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
