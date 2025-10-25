import { useState, useEffect } from 'react';
import {
  getCurrentWeather,
  getWeatherForecast,
  getHourlyForecast,
  getHistoricalWeather
} from '../services/weatherApi';

/**
 * Custom hook for fetching weather data
 * @param {string} location - Location to fetch weather for
 * @param {string} type - Type of data: 'current', 'forecast', 'historical'
 * @param {Object} options - Additional options (days for forecast, date range for historical)
 * @returns {Object} { data, loading, error, refetch }
 */
export function useWeatherData(location, type = 'current', options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!location) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;

      switch (type) {
        case 'current':
          result = await getCurrentWeather(location);
          break;

        case 'forecast':
          result = await getWeatherForecast(location, options.days || 7);
          break;

        case 'hourly':
          result = await getHourlyForecast(location, options.hours || 48);
          break;

        case 'historical':
          if (!options.startDate || !options.endDate) {
            throw new Error('Start and end dates are required for historical data');
          }
          result = await getHistoricalWeather(location, options.startDate, options.endDate);
          break;

        default:
          throw new Error(`Unknown data type: ${type}`);
      }

      setData(result);
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${type} weather:`, err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch weather data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, type, options.days, options.startDate, options.endDate]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * Hook for fetching current weather
 */
export function useCurrentWeather(location) {
  return useWeatherData(location, 'current');
}

/**
 * Hook for fetching forecast
 */
export function useForecast(location, days = 7) {
  return useWeatherData(location, 'forecast', { days });
}

/**
 * Hook for fetching historical weather
 */
export function useHistoricalWeather(location, startDate, endDate) {
  return useWeatherData(location, 'historical', { startDate, endDate });
}

/**
 * Hook for fetching hourly forecast
 */
export function useHourlyForecast(location, hours = 48) {
  return useWeatherData(location, 'hourly', { hours });
}
