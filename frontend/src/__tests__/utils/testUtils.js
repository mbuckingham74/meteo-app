/**
 * Test Utilities
 * Common utilities and helpers for testing React components and services
 */

import { render } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { LocationProvider } from '../../contexts/LocationContext';
import { TemperatureUnitProvider } from '../../contexts/TemperatureUnitContext';

/**
 * Render component with all providers
 * @param {ReactElement} ui - Component to render
 * @param {Object} options - Render options
 */
export function renderWithProviders(ui, options = {}) {
  const AllProviders = ({ children }) => (
    <AuthProvider>
      <ThemeProvider>
        <LocationProvider>
          <TemperatureUnitProvider>
            {children}
          </TemperatureUnitProvider>
        </LocationProvider>
      </ThemeProvider>
    </AuthProvider>
  );

  return render(ui, { wrapper: AllProviders, ...options });
}

/**
 * Mock weather API response
 */
export const mockWeatherData = {
  location: {
    address: 'Seattle, WA',
    latitude: 47.6062,
    longitude: -122.3321,
    timezone: 'America/Los_Angeles',
    elevation: 53
  },
  current: {
    datetime: '2025-10-28T12:00:00',
    temperature: 15.5,
    feelsLike: 14.2,
    conditions: 'Partly Cloudy',
    icon: 'partly-cloudy-day',
    humidity: 65,
    windSpeed: 12.5,
    windDirection: 225,
    pressure: 1013.25,
    visibility: 16.1,
    cloudCover: 45,
    uvIndex: 3,
    precipitation: 0
  },
  forecast: [
    {
      date: '2025-10-28',
      tempMax: 18,
      tempMin: 12,
      tempAvg: 15,
      precipitation: 0.5,
      precipProb: 20,
      humidity: 65,
      windSpeed: 10,
      windDirection: 225,
      conditions: 'Partly Cloudy',
      sunrise: '07:30:00',
      sunset: '18:45:00',
      uvIndex: 4
    }
  ],
  alerts: []
};

/**
 * Mock geolocation response
 */
export const mockGeolocationData = {
  address: 'Seattle, WA',
  latitude: 47.6062,
  longitude: -122.3321,
  timezone: 'America/Los_Angeles',
  accuracy: 100
};

/**
 * Mock radar frames data
 */
export const mockRadarFrames = [
  {
    timestamp: 1698508800,
    datetime: '2025-10-28T12:00:00Z',
    path: '/v2/radar/1698508800/256/0/0/0/0_0.png'
  },
  {
    timestamp: 1698509400,
    datetime: '2025-10-28T12:10:00Z',
    path: '/v2/radar/1698509400/256/0/0/0/0_0.png'
  }
];

/**
 * Mock AI location finder response
 */
export const mockAIResponse = {
  success: true,
  criteria: {
    current_location: 'New Smyrna Beach, FL',
    time_period: { start: 'June', end: 'October' },
    temperature_delta: -15,
    temperature_range: { min: null, max: null },
    humidity: 'lower',
    precipitation: 'less',
    lifestyle_factors: [],
    deal_breakers: [],
    additional_notes: 'Looking for cooler, drier climate'
  },
  tokensUsed: 450,
  cost: '$0.005'
};

/**
 * Wait for async operations
 */
export const waitFor = (callback, options = {}) => {
  return new Promise((resolve) => {
    const timeout = options.timeout || 1000;
    setTimeout(() => {
      callback();
      resolve();
    }, timeout);
  });
};

/**
 * Mock fetch for API tests
 */
export function mockFetch(response, ok = true) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      status: ok ? 200 : 400,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    })
  );
}

/**
 * Mock fetch error
 */
export function mockFetchError(errorMessage) {
  global.fetch = jest.fn(() =>
    Promise.reject(new Error(errorMessage))
  );
}

/**
 * Reset all mocks
 */
export function resetMocks() {
  jest.clearAllMocks();
  if (global.fetch && global.fetch.mockClear) {
    global.fetch.mockClear();
  }
  localStorage.clear();
}

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
