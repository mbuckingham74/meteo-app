import { reverseGeocode } from './weatherApi';

/**
 * Geolocation Service
 * Detects user's current location using browser Geolocation API
 */

/**
 * Get user's current location
 * @returns {Promise<Object>} Location object with address, latitude, longitude
 */
export async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Reverse geocode to get address
          const location = await reverseGeocode(latitude, longitude);

          resolve({
            ...location,
            accuracy: position.coords.accuracy
          });
        } catch (error) {
          // If reverse geocoding fails, return coordinates only
          resolve({
            address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        }
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
        }

        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Check if geolocation is supported
 * @returns {boolean} True if geolocation is supported
 */
export function isGeolocationSupported() {
  return 'geolocation' in navigator;
}

/**
 * Request location permission (doesn't actually trigger permission, but checks support)
 * @returns {Promise<boolean>} True if permission can be requested
 */
export async function canRequestLocation() {
  if (!navigator.permissions) {
    return isGeolocationSupported();
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state !== 'denied';
  } catch (error) {
    return isGeolocationSupported();
  }
}
