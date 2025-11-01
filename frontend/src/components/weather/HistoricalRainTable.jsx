import React, { useState, useEffect } from 'react';
import './HistoricalRainTable.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

/**
 * Historical Rain Table Component
 * Displays precipitation data for a specific date across multiple years
 *
 * @param {string} location - Location name
 * @param {string} date - Date in MM-DD format (e.g., "11-01")
 * @param {number} years - Number of years to display (default: 25)
 */
function HistoricalRainTable({ location, date, years = 25 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          location,
          date,
          years: years.toString()
        });

        const response = await fetch(`${API_BASE_URL}/weather/historical-date?${params}`);
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to load historical data');
        }
      } catch (err) {
        console.error('Error fetching historical data:', err);
        setError('Failed to load historical data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (location && date) {
      fetchHistoricalData();
    }
  }, [location, date, years]);

  if (loading) {
    return (
      <div className="historical-rain-table loading">
        <div className="loading-spinner">🔄 Loading {years} years of historical data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="historical-rain-table error">
        <p>❌ {error}</p>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="historical-rain-table no-data">
        <p>No historical data available for this date.</p>
      </div>
    );
  }

  const { data: historicalData, statistics } = data;
  const [monthName, dayNum] = getDateDisplay(date);

  return (
    <div className="historical-rain-table">
      <div className="table-header">
        <h3>📊 Historical Weather for {monthName} {dayNum}</h3>
        <p className="table-subtitle">
          Showing {historicalData.length} years of data for {location}
        </p>
      </div>

      <div className="statistics-summary">
        <div className="stat-card">
          <div className="stat-label">Average Precipitation</div>
          <div className="stat-value">{statistics.averagePrecipitation.toFixed(2)} mm</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Rainy Days</div>
          <div className="stat-value">{statistics.rainyDayPercentage}%</div>
          <div className="stat-note">({statistics.rainyDays}/{historicalData.length} years)</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Wettest Year</div>
          <div className="stat-value">{statistics.maxPrecipitation.toFixed(2)} mm</div>
        </div>
      </div>

      <div className="table-scroll-container">
        <table className="historical-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Precipitation</th>
              <th>Temperature</th>
              <th>Conditions</th>
            </tr>
          </thead>
          <tbody>
            {historicalData.map((row) => (
              <tr key={row.year} className={row.precip > 0.1 ? 'rainy-day' : ''}>
                <td className="year-cell">{row.year}</td>
                <td className="precip-cell">
                  <div className="precip-bar-container">
                    <div
                      className="precip-bar"
                      style={{
                        width: `${Math.min((row.precip / statistics.maxPrecipitation) * 100, 100)}%`
                      }}
                    />
                    <span className="precip-value">
                      {row.precip > 0 ? `${row.precip.toFixed(1)} mm` : 'No rain'}
                    </span>
                  </div>
                </td>
                <td className="temp-cell">
                  {row.temp ? `${row.temp.toFixed(1)}°C` : 'N/A'}
                  {row.tempmax && row.tempmin && (
                    <span className="temp-range"> ({row.tempmin.toFixed(0)}° - {row.tempmax.toFixed(0)}°)</span>
                  )}
                </td>
                <td className="conditions-cell">
                  {row.icon && <span className="weather-icon">{getWeatherIcon(row.icon)}</span>}
                  <span className="conditions-text">{row.conditions || 'Unknown'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <p className="data-note">
          💡 Data sourced from Visual Crossing Weather API. Precipitation measured in millimeters.
        </p>
      </div>
    </div>
  );
}

// Helper function to get month name and day
function getDateDisplay(date) {
  const [month, day] = date.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return [monthNames[parseInt(month) - 1], parseInt(day)];
}

// Helper function to map icon codes to emojis
function getWeatherIcon(icon) {
  const iconMap = {
    'clear-day': '☀️',
    'clear-night': '🌙',
    'partly-cloudy-day': '⛅',
    'partly-cloudy-night': '☁️',
    'cloudy': '☁️',
    'rain': '🌧️',
    'snow': '🌨️',
    'sleet': '🌨️',
    'wind': '💨',
    'fog': '🌫️'
  };
  return iconMap[icon] || '🌤️';
}

export default HistoricalRainTable;
