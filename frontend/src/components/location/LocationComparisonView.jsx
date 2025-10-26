import React, { useState } from 'react';
import { useForecast, useHistoricalWeather } from '../../hooks/useWeatherData';
import { useForecastComparison, useThisDayInHistory } from '../../hooks/useClimateData';
import { formatTemperature } from '../../utils/weatherHelpers';
import { useTemperatureUnit } from '../../contexts/TemperatureUnitContext';
import LocationSearchBar from './LocationSearchBar';
import TemperatureUnitToggle from '../units/TemperatureUnitToggle';
import TemperatureBandChart from '../charts/TemperatureBandChart';
import PrecipitationChart from '../charts/PrecipitationChart';
import WindChart from '../charts/WindChart';
import HistoricalComparisonChart from '../charts/HistoricalComparisonChart';
import './LocationComparisonView.css';

/**
 * LocationComparisonView Component
 * Compare weather between multiple locations side-by-side
 */
function LocationComparisonView() {
  // Start with an interesting comparison pre-loaded
  const [locations, setLocations] = useState([
    'Seattle,WA',
    'New Smyrna Beach,FL'
  ]);

  const [timeRange, setTimeRange] = useState('3months'); // Default to 3 months to show summer comparison
  const [showGuide, setShowGuide] = useState(true); // Show guide by default

  const { unit } = useTemperatureUnit();

  // Calculate date range based on selected time range
  const getDateRange = () => {
    const now = new Date();
    const endDate = new Date(now);
    let startDate = new Date(now);
    let lookbackYears = 10; // Default years for historical comparison

    switch (timeRange) {
      case '7days':
        // Current week forecast
        return { type: 'forecast', days: 7 };
      case '1month':
        startDate.setMonth(now.getMonth() - 1);
        lookbackYears = 5;
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        lookbackYears = 5;
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        lookbackYears = 5;
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        lookbackYears = 10;
        break;
      case '3years':
        startDate.setFullYear(now.getFullYear() - 3);
        lookbackYears = 10;
        break;
      case '5years':
        startDate.setFullYear(now.getFullYear() - 5);
        lookbackYears = 10;
        break;
      default:
        return { type: 'forecast', days: 7 };
    }

    return {
      type: 'historical',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      lookbackYears
    };
  };

  const dateRange = getDateRange();

  // Fetch forecast data (always call hooks - pass null if not needed)
  const location1Forecast = useForecast(
    dateRange.type === 'forecast' ? (locations[0] || null) : null,
    dateRange.days || 7
  );
  const location2Forecast = useForecast(
    dateRange.type === 'forecast' ? (locations[1] || null) : null,
    dateRange.days || 7
  );
  const location3Forecast = useForecast(
    dateRange.type === 'forecast' ? (locations[2] || null) : null,
    dateRange.days || 7
  );
  const location4Forecast = useForecast(
    dateRange.type === 'forecast' ? (locations[3] || null) : null,
    dateRange.days || 7
  );

  // Fetch historical data (always call hooks - pass null if not needed)
  const location1Historical = useHistoricalWeather(
    dateRange.type === 'historical' ? (locations[0] || null) : null,
    dateRange.startDate,
    dateRange.endDate
  );
  const location2Historical = useHistoricalWeather(
    dateRange.type === 'historical' ? (locations[1] || null) : null,
    dateRange.startDate,
    dateRange.endDate
  );
  const location3Historical = useHistoricalWeather(
    dateRange.type === 'historical' ? (locations[2] || null) : null,
    dateRange.startDate,
    dateRange.endDate
  );
  const location4Historical = useHistoricalWeather(
    dateRange.type === 'historical' ? (locations[3] || null) : null,
    dateRange.startDate,
    dateRange.endDate
  );

  // Combine data based on current mode
  const location1Data = dateRange.type === 'forecast' ? location1Forecast : location1Historical;
  const location2Data = dateRange.type === 'forecast' ? location2Forecast : location2Historical;
  const location3Data = dateRange.type === 'forecast' ? location3Forecast : location3Historical;
  const location4Data = dateRange.type === 'forecast' ? location4Forecast : location4Historical;

  // Fetch historical comparison data for each location (only for forecast mode)
  const location1Comparison = useForecastComparison(
    dateRange.type === 'forecast' ? (locations[0] || null) : null,
    location1Data?.data?.forecast || [],
    10
  );
  const location2Comparison = useForecastComparison(
    dateRange.type === 'forecast' ? (locations[1] || null) : null,
    location2Data?.data?.forecast || [],
    10
  );
  const location3Comparison = useForecastComparison(
    dateRange.type === 'forecast' ? (locations[2] || null) : null,
    location3Data?.data?.forecast || [],
    10
  );
  const location4Comparison = useForecastComparison(
    dateRange.type === 'forecast' ? (locations[3] || null) : null,
    location4Data?.data?.forecast || [],
    10
  );

  // Fetch "This Day in History" for each location
  const location1History = useThisDayInHistory(locations[0] || null, null, 10);
  const location2History = useThisDayInHistory(locations[1] || null, null, 10);
  const location3History = useThisDayInHistory(locations[2] || null, null, 10);
  const location4History = useThisDayInHistory(locations[3] || null, null, 10);

  const allData = [
    locations[0] ? location1Data : null,
    locations[1] ? location2Data : null,
    locations[2] ? location3Data : null,
    locations[3] ? location4Data : null
  ].filter(Boolean);

  const allComparisonData = [
    locations[0] ? location1Comparison : null,
    locations[1] ? location2Comparison : null,
    locations[2] ? location3Comparison : null,
    locations[3] ? location4Comparison : null
  ];

  const allHistoryData = [
    locations[0] ? location1History : null,
    locations[1] ? location2History : null,
    locations[2] ? location3History : null,
    locations[3] ? location4History : null
  ];

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
      if (!locationData.data) return;

      // Handle both forecast and historical data formats
      const weatherData = locationData.data.forecast || locationData.data.historical || [];
      if (weatherData.length === 0) return;

      const avgTemp = weatherData.reduce((sum, day) => sum + (day.tempAvg || day.temp), 0) / weatherData.length;
      const totalPrecip = weatherData.reduce((sum, day) => sum + (day.precipitation || 0), 0);
      const avgHumidity = weatherData.reduce((sum, day) => sum + (day.humidity || 0), 0) / weatherData.length;

      metrics.push({
        index,
        location: locationData.data.location?.address || locations[index],
        avgTemp,
        totalPrecip,
        avgHumidity,
        highTemp: Math.max(...weatherData.map(d => d.tempMax || d.temp)),
        lowTemp: Math.min(...weatherData.map(d => d.tempMin || d.temp)),
        dataPoints: weatherData.length
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
          <div className="time-range-selector">
            <label htmlFor="time-range">Time Range:</label>
            <select
              id="time-range"
              className="time-range-select"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7days">7 Days (Forecast)</option>
              <option value="1month">1 Month</option>
              <option value="3months">3 Months</option>
              <option value="6months">6 Months</option>
              <option value="1year">1 Year</option>
              <option value="3years">3 Years</option>
              <option value="5years">5 Years</option>
            </select>
          </div>
          <TemperatureUnitToggle />
          {locations.length < 4 && (
            <button className="add-location-button" onClick={handleAddLocation}>
              + Add Location
            </button>
          )}
        </div>
      </div>

      {/* How to Use Guide */}
      {showGuide && (
        <div className="comparison-guide">
          <div className="guide-header">
            <h3>💡 How to Use This Comparison Tool</h3>
            <button className="guide-close" onClick={() => setShowGuide(false)} title="Dismiss">
              ✕
            </button>
          </div>
          <div className="guide-content">
            <div className="guide-steps">
              <h4>Quick Start:</h4>
              <ol>
                <li><strong>Search for cities</strong> using the search boxes in each card</li>
                <li><strong>Select a time range</strong> to change what data you're comparing</li>
                <li><strong>Scroll down</strong> to see detailed charts and statistics for each location</li>
              </ol>
            </div>
            <div className="guide-examples">
              <h4>Try These Examples (Click to Load):</h4>
              <ul>
                <li>
                  <button
                    className="example-button"
                    onClick={() => {
                      setLocations(['Paris,France', 'London,UK']);
                      setTimeRange('7days');
                      setShowGuide(false);
                    }}
                  >
                    ❓ <strong>Which city is warmer for vacation?</strong> Paris vs. London (7-day forecast)
                  </button>
                </li>
                <li>
                  <button
                    className="example-button"
                    onClick={() => {
                      setLocations(['Seattle,WA', 'Miami,FL']);
                      setTimeRange('1year');
                      setShowGuide(false);
                    }}
                  >
                    🌧️ <strong>Does Seattle get more rain than Miami annually?</strong> Seattle vs. Miami (1 year)
                  </button>
                </li>
                <li>
                  <button
                    className="example-button"
                    onClick={() => {
                      setLocations(['San Diego,CA', 'Honolulu,HI']);
                      setTimeRange('5years');
                      setShowGuide(false);
                    }}
                  >
                    🏡 <strong>Which city has better year-round weather?</strong> San Diego vs. Honolulu (5-year avg)
                  </button>
                </li>
                <li>
                  <button
                    className="example-button"
                    onClick={() => {
                      setLocations(['Phoenix,AZ', 'Las Vegas,NV']);
                      setTimeRange('3months');
                      setShowGuide(false);
                    }}
                  >
                    ☀️ <strong>Compare summer heat:</strong> Phoenix vs. Las Vegas (3 months)
                  </button>
                </li>
                <li>
                  <button
                    className="example-button"
                    onClick={() => {
                      setLocations(['New Smyrna Beach,FL', 'Seattle,WA']);
                      setTimeRange('3months');
                      setShowGuide(false);
                    }}
                  >
                    🏖️ <strong>Which city has a milder summer?</strong> New Smyrna Beach vs. Seattle (3 months)
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Time Range Explanation */}
      <div className="time-range-explanation">
        {timeRange === '7days' && (
          <p>
            <strong>📅 7-Day Forecast:</strong> Compare upcoming weather predictions for the next week.
            Perfect for planning trips or events.
          </p>
        )}
        {timeRange === '1month' && (
          <p>
            <strong>📊 Past Month:</strong> View actual weather data from the last 30 days.
            See recent temperature trends and total rainfall.
          </p>
        )}
        {timeRange === '3months' && (
          <p>
            <strong>🍂 Past 3 Months (Seasonal):</strong> Compare seasonal patterns between cities.
            Great for understanding quarter-year climate differences.
          </p>
        )}
        {timeRange === '6months' && (
          <p>
            <strong>📈 Past 6 Months:</strong> Analyze half-year weather patterns and trends.
            See how locations compare across different seasons.
          </p>
        )}
        {timeRange === '1year' && (
          <p>
            <strong>🌍 Full Year:</strong> Compare annual climate patterns - total yearly rainfall, average temperatures, and seasonal variations.
            <em>Example: "Does Seattle really get more rain than Miami annually?"</em>
          </p>
        )}
        {timeRange === '3years' && (
          <p>
            <strong>📉 3-Year Average:</strong> See long-term climate patterns smoothed over 3 years.
            Reduces year-to-year variation for clearer trends.
          </p>
        )}
        {timeRange === '5years' && (
          <p>
            <strong>🔬 5-Year Average:</strong> Compare true climate characteristics over 5 years.
            Best for relocation decisions and understanding typical weather.
          </p>
        )}
      </div>

      {/* Location Cards Grid */}
      <div className="comparison-grid">
        {locations.map((location, index) => {
          const data = allData[index];
          const comparisonData = allComparisonData[index];
          const historyData = allHistoryData[index];
          const loading = data?.loading;
          const error = data?.error;
          const weatherData = data?.data?.forecast || data?.data?.historical || [];

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

              {!loading && !error && weatherData.length > 0 && (
                <div className="card-content">
                  <h3 className="location-name">
                    {data.data.location?.address || location}
                  </h3>

                  <div className="current-weather">
                    <div className="temp-display">
                      <span className="current-temp">
                        {formatTemperature(weatherData[0].tempAvg || weatherData[0].temp, unit)}
                      </span>
                      <span className="temp-label">
                        {dateRange.type === 'forecast' ? 'Current' : 'Latest'}
                      </span>
                    </div>
                    <div className="temp-range">
                      <span className="high-temp">
                        H: {formatTemperature(weatherData[0].tempMax || weatherData[0].temp, unit)}
                      </span>
                      <span className="low-temp">
                        L: {formatTemperature(weatherData[0].tempMin || weatherData[0].temp, unit)}
                      </span>
                    </div>
                  </div>

                  <div className="forecast-summary">
                    <div className="summary-item">
                      <span className="summary-label">
                        {timeRange === '7days' ? '7-Day Avg' :
                         timeRange === '1month' ? '1-Month Avg' :
                         timeRange === '3months' ? '3-Month Avg' :
                         timeRange === '6months' ? '6-Month Avg' :
                         timeRange === '1year' ? '1-Year Avg' :
                         timeRange === '3years' ? '3-Year Avg' :
                         '5-Year Avg'}
                      </span>
                      <span className="summary-value">
                        {formatTemperature(
                          weatherData.reduce((sum, d) => sum + (d.tempAvg || d.temp), 0) / weatherData.length,
                          unit
                        )}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Total Precipitation</span>
                      <span className="summary-value">
                        {weatherData.reduce((sum, d) => sum + (d.precipitation || 0), 0).toFixed(1)} mm
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Avg Humidity</span>
                      <span className="summary-value">
                        {Math.round(weatherData.reduce((sum, d) => sum + (d.humidity || 0), 0) / weatherData.length)}%
                      </span>
                    </div>
                  </div>

                  {weatherData[0].conditions && (
                    <div className="conditions-badge">
                      {weatherData[0].conditions}
                    </div>
                  )}

                  {/* Weather Charts */}
                  <div className="comparison-charts">
                    <div className="comparison-chart">
                      <TemperatureBandChart
                        data={weatherData}
                        unit={unit}
                        height={200}
                        days={weatherData.length}
                      />
                    </div>

                    <div className="comparison-chart">
                      <PrecipitationChart
                        data={weatherData}
                        height={180}
                        days={weatherData.length}
                      />
                    </div>

                    <div className="comparison-chart">
                      <WindChart
                        data={weatherData}
                        height={180}
                        days={weatherData.length}
                      />
                    </div>

                    {/* Historical Comparison (only for forecast mode) */}
                    {dateRange.type === 'forecast' && comparisonData?.data && weatherData && (
                      <div className="comparison-chart">
                        <HistoricalComparisonChart
                          forecastData={weatherData}
                          historicalData={comparisonData.data}
                          unit={unit}
                          height={220}
                        />
                      </div>
                    )}
                  </div>

                  {/* Historical Insights (only for forecast mode) */}
                  {dateRange.type === 'forecast' && historyData?.data && (
                    <div className="historical-insights">
                      <h4>📅 Historical Context (10 years)</h4>
                      <div className="insights-stats">
                        {historyData.data.normals && (
                          <>
                            <div className="stat-item">
                              <span className="stat-label">Historical Avg:</span>
                              <span className="stat-value">
                                {formatTemperature(historyData.data.normals.tempAvg, unit)}
                              </span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Record High:</span>
                              <span className="stat-value high">
                                {formatTemperature(historyData.data.records?.maxTemp, unit)}
                                {historyData.data.records?.maxTempYear &&
                                  ` (${historyData.data.records.maxTempYear})`}
                              </span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Record Low:</span>
                              <span className="stat-value low">
                                {formatTemperature(historyData.data.records?.minTemp, unit)}
                                {historyData.data.records?.minTempYear &&
                                  ` (${historyData.data.records.minTempYear})`}
                              </span>
                            </div>
                          </>
                        )}
                        {weatherData.length > 0 && historyData.data.normals && (
                          <div className="stat-item comparison-stat">
                            <span className="stat-label">vs Historical:</span>
                            <span className={`stat-value ${
                              (weatherData[0].tempAvg || weatherData[0].temp) > historyData.data.normals.tempAvg
                                ? 'warmer'
                                : 'cooler'
                            }`}>
                              {(weatherData[0].tempAvg || weatherData[0].temp) > historyData.data.normals.tempAvg
                                ? '🔥 Warmer'
                                : '❄️ Cooler'} than average
                              ({Math.abs((weatherData[0].tempAvg || weatherData[0].temp) - historyData.data.normals.tempAvg).toFixed(1)}°{unit})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
