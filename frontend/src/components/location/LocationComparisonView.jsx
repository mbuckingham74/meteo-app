import React, { useState } from 'react';
import { useForecast } from '../../hooks/useWeatherData';
import { formatTemperature } from '../../utils/weatherHelpers';
import LocationSearchBar from './LocationSearchBar';
import './LocationComparisonView.css';

/**
 * LocationComparisonView Component
 * Compare weather between multiple locations side-by-side
 */
function LocationComparisonView() {
  const [locations, setLocations] = useState([
    'London,UK',
    'New York,NY'
  ]);

  const [unit, setUnit] = useState('C');

  // Fetch weather data for each location
  const location1Data = useForecast(locations[0], 7);
  const location2Data = useForecast(locations[1], 7);
  const location3Data = locations[2] ? useForecast(locations[2], 7) : null;
  const location4Data = locations[3] ? useForecast(locations[3], 7) : null;

  const allData = [location1Data, location2Data, location3Data, location4Data].filter(Boolean);

  const handleAddLocation = () => {
    if (locations.length < 4) {
      setLocations([...locations, '']);
    }
  };

  const handleRemoveLocation = (index) => {
    if (locations.length > 2) {
      const newLocations = locations.filter((_, i) => i !== index);
      setLocations(newLocations);
    }
  };

  const handleLocationSelect = (index, location) => {
    const newLocations = [...locations];
    newLocations[index] = location.address;
    setLocations(newLocations);
  };

  // Calculate comparison metrics
  const getComparisonMetrics = () => {
    const metrics = [];

    allData.forEach((locationData, index) => {
      if (!locationData.data || !locationData.data.forecast) return;

      const forecast = locationData.data.forecast;
      const avgTemp = forecast.reduce((sum, day) => sum + (day.tempAvg || day.temp), 0) / forecast.length;
      const totalPrecip = forecast.reduce((sum, day) => sum + (day.precipitation || 0), 0);
      const avgHumidity = forecast.reduce((sum, day) => sum + day.humidity, 0) / forecast.length;

      metrics.push({
        index,
        location: locationData.data.location?.address || locations[index],
        avgTemp,
        totalPrecip,
        avgHumidity,
        highTemp: Math.max(...forecast.map(d => d.tempMax)),
        lowTemp: Math.min(...forecast.map(d => d.tempMin))
      });
    });

    return metrics;
  };

  const metrics = getComparisonMetrics();

  // Find extremes
  const warmestLocation = metrics.length > 0 ? metrics.reduce((max, m) => m.avgTemp > max.avgTemp ? m : max) : null;
  const coldestLocation = metrics.length > 0 ? metrics.reduce((min, m) => m.avgTemp < min.avgTemp ? m : min) : null;
  const wettestLocation = metrics.length > 0 ? metrics.reduce((max, m) => m.totalPrecip > max.totalPrecip ? m : max) : null;

  return (
    <div className="location-comparison-view">
      <div className="comparison-header">
        <h2>📊 Location Comparison</h2>
        <div className="comparison-controls">
          <select
            className="unit-select"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            <option value="C">Celsius</option>
            <option value="F">Fahrenheit</option>
          </select>
          {locations.length < 4 && (
            <button className="add-location-button" onClick={handleAddLocation}>
              + Add Location
            </button>
          )}
        </div>
      </div>

      {/* Location Cards Grid */}
      <div className="comparison-grid">
        {locations.map((location, index) => {
          const data = allData[index];
          const loading = data?.loading;
          const error = data?.error;
          const forecast = data?.data?.forecast;

          return (
            <div key={index} className="comparison-card">
              <div className="card-header">
                <span className="card-number">{index + 1}</span>
                {locations.length > 2 && (
                  <button
                    className="remove-card-button"
                    onClick={() => handleRemoveLocation(index)}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="card-search">
                <LocationSearchBar
                  onLocationSelect={(loc) => handleLocationSelect(index, loc)}
                  currentLocation={{ address: location }}
                />
              </div>

              {loading && (
                <div className="card-loading">
                  <div className="spinner"></div>
                  <p>Loading weather...</p>
                </div>
              )}

              {error && (
                <div className="card-error">
                  <p>⚠️ {error}</p>
                </div>
              )}

              {!loading && !error && forecast && (
                <div className="card-content">
                  <h3 className="location-name">
                    {data.data.location?.address || location}
                  </h3>

                  <div className="current-weather">
                    <div className="temp-display">
                      <span className="current-temp">
                        {formatTemperature(forecast[0].tempAvg || forecast[0].temp, unit)}
                      </span>
                      <span className="temp-label">Current</span>
                    </div>
                    <div className="temp-range">
                      <span className="high-temp">
                        H: {formatTemperature(forecast[0].tempMax, unit)}
                      </span>
                      <span className="low-temp">
                        L: {formatTemperature(forecast[0].tempMin, unit)}
                      </span>
                    </div>
                  </div>

                  <div className="forecast-summary">
                    <div className="summary-item">
                      <span className="summary-label">7-Day Avg</span>
                      <span className="summary-value">
                        {formatTemperature(
                          forecast.reduce((sum, d) => sum + (d.tempAvg || d.temp), 0) / forecast.length,
                          unit
                        )}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Precipitation</span>
                      <span className="summary-value">
                        {forecast.reduce((sum, d) => sum + (d.precipitation || 0), 0).toFixed(1)} mm
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Humidity</span>
                      <span className="summary-value">
                        {Math.round(forecast.reduce((sum, d) => sum + d.humidity, 0) / forecast.length)}%
                      </span>
                    </div>
                  </div>

                  <div className="conditions-badge">
                    {forecast[0].conditions}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison Insights */}
      {metrics.length > 1 && (
        <div className="comparison-insights">
          <h3>🔍 Comparison Insights</h3>
          <div className="insights-grid">
            {warmestLocation && (
              <div className="insight-card warm">
                <span className="insight-icon">🔥</span>
                <div>
                  <p className="insight-label">Warmest</p>
                  <p className="insight-value">{warmestLocation.location}</p>
                  <p className="insight-detail">
                    {formatTemperature(warmestLocation.avgTemp, unit)} avg
                  </p>
                </div>
              </div>
            )}

            {coldestLocation && warmestLocation !== coldestLocation && (
              <div className="insight-card cold">
                <span className="insight-icon">❄️</span>
                <div>
                  <p className="insight-label">Coldest</p>
                  <p className="insight-value">{coldestLocation.location}</p>
                  <p className="insight-detail">
                    {formatTemperature(coldestLocation.avgTemp, unit)} avg
                  </p>
                </div>
              </div>
            )}

            {wettestLocation && (
              <div className="insight-card wet">
                <span className="insight-icon">🌧️</span>
                <div>
                  <p className="insight-label">Wettest</p>
                  <p className="insight-value">{wettestLocation.location}</p>
                  <p className="insight-detail">
                    {wettestLocation.totalPrecip.toFixed(1)} mm total
                  </p>
                </div>
              </div>
            )}

            {warmestLocation && coldestLocation && warmestLocation !== coldestLocation && (
              <div className="insight-card difference">
                <span className="insight-icon">📊</span>
                <div>
                  <p className="insight-label">Temperature Difference</p>
                  <p className="insight-value">
                    {Math.abs(warmestLocation.avgTemp - coldestLocation.avgTemp).toFixed(1)}°{unit}
                  </p>
                  <p className="insight-detail">
                    Between warmest and coldest
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationComparisonView;
