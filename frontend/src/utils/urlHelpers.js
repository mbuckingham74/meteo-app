/**
 * URL Helper Functions
 * Utilities for generating and parsing location-based URLs
 */

/**
 * Convert a location address to a URL-friendly slug
 * @param {string} address - Location address (e.g., "Seattle, WA, USA")
 * @returns {string} URL slug (e.g., "seattle-wa-usa")
 */
export const createLocationSlug = (address) => {
  if (!address) return '';

  return address
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};

/**
 * Parse a URL slug back to search query
 * @param {string} slug - URL slug (e.g., "seattle-wa-usa")
 * @returns {string} Search query (e.g., "seattle wa usa")
 */
export const parseLocationSlug = (slug) => {
  if (!slug) return '';

  return slug
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .trim();
};

/**
 * Update browser URL without reload
 * @param {Object} location - Location object with address, latitude, longitude
 * @param {boolean} replace - If true, replace current history entry instead of pushing new one
 */
export const updateLocationUrl = (location, replace = false) => {
  if (!location || !location.address) return;

  const slug = createLocationSlug(location.address);
  const url = `/location/${slug}`;

  const state = {
    location: {
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone
    }
  };

  if (replace) {
    window.history.replaceState(state, '', url);
  } else {
    window.history.pushState(state, '', url);
  }
};

/**
 * Get current route information from URL
 * @returns {Object} Route info { path, params, location }
 */
export const getCurrentRoute = () => {
  const path = window.location.pathname;

  // Check if it's a location route
  const locationMatch = path.match(/^\/location\/([^/]+)$/);
  if (locationMatch) {
    return {
      path: 'location',
      params: { slug: locationMatch[1] },
      state: window.history.state
    };
  }

  // Check for other routes
  if (path === '/compare') {
    return { path: 'compare', params: {}, state: null };
  }

  if (path === '/privacy') {
    return { path: 'privacy', params: {}, state: null };
  }

  // Check for AI weather routes
  const aiWeatherMatch = path.match(/^\/ai-weather(?:\/([^/]+)\/([^/]+))?$/);
  if (aiWeatherMatch) {
    if (aiWeatherMatch[1] === 'shared' && aiWeatherMatch[2]) {
      return {
        path: 'ai-weather',
        params: { action: 'shared', shareId: aiWeatherMatch[2] },
        state: null
      };
    }
    return { path: 'ai-weather', params: {}, state: null };
  }

  // Default to dashboard
  return { path: 'dashboard', params: {}, state: null };
};

/**
 * Navigate to a location URL
 * @param {Object} location - Location object
 */
export const navigateToLocation = (location) => {
  updateLocationUrl(location, false);

  // Trigger popstate event so components can react
  window.dispatchEvent(new PopStateEvent('popstate', {
    state: window.history.state
  }));
};

/**
 * Navigate to dashboard
 */
export const navigateToDashboard = () => {
  window.history.pushState({}, '', '/');
  window.dispatchEvent(new PopStateEvent('popstate'));
};

/**
 * Navigate to compare page
 */
export const navigateToCompare = () => {
  window.history.pushState({}, '', '/compare');
  window.dispatchEvent(new PopStateEvent('popstate'));
};

/**
 * Navigate to privacy page
 */
export const navigateToPrivacy = () => {
  window.history.pushState({}, '', '/privacy');
  window.dispatchEvent(new PopStateEvent('popstate'));
};

/**
 * Navigate to AI weather page
 * @param {string} question - Optional pre-filled question
 */
export const navigateToAIWeather = (question = null) => {
  const url = question
    ? `/ai-weather?q=${encodeURIComponent(question)}`
    : '/ai-weather';
  window.history.pushState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
};
