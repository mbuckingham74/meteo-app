import React, { useState, useEffect, useRef } from 'react';
import { geocodeLocation, getPopularLocations } from '../../services/weatherApi';
import './LocationSearchBar.css';

const RECENT_SEARCHES_KEY = 'meteo_recent_searches';
const MAX_RECENT_SEARCHES = 5;

/**
 * LocationSearchBar Component
 * Autocomplete search bar for location selection with search history
 */
function LocationSearchBar({ onLocationSelect, currentLocation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [popularLocations, setPopularLocations] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);

  // Load popular locations on mount
  useEffect(() => {
    const loadPopular = async () => {
      try {
        const popular = await getPopularLocations();
        setPopularLocations(popular);
      } catch (error) {
        console.error('Error loading popular locations:', error);
      }
    };
    loadPopular();
  }, []);

  // Save recent search to localStorage
  const saveRecentSearch = (location) => {
    try {
      // Remove duplicate if exists
      const filtered = recentSearches.filter(
        item => !(item.latitude === location.latitude && item.longitude === location.longitude)
      );

      // Add new search to front
      const updated = [location, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter recent searches based on query
  const getFilteredRecentSearches = (searchQuery) => {
    if (!searchQuery) return recentSearches;

    const lowerQuery = searchQuery.toLowerCase();
    return recentSearches.filter(location =>
      location.address.toLowerCase().includes(lowerQuery)
    );
  };

  // Search for locations with debounce
  const searchLocations = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setShowDropdown(true); // Show recent/popular locations
      return;
    }

    setIsLoading(true);

    try {
      const searchResults = await geocodeLocation(searchQuery, 5);
      setResults(searchResults);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error searching locations:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      searchLocations(value);
    }, 300);
  };

  // Handle location selection
  const handleSelectLocation = (location) => {
    setQuery(location.address);
    setShowDropdown(false);
    setResults([]);
    saveRecentSearch(location);
    onLocationSelect(location);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    // Get all visible results in order: recent, search results, or popular
    let displayResults = [];
    if (query.length >= 2) {
      const filteredRecent = getFilteredRecentSearches(query);
      displayResults = [...filteredRecent, ...results];
    } else if (recentSearches.length > 0) {
      displayResults = recentSearches;
    } else {
      displayResults = popularLocations;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < displayResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // If a specific item is selected via arrow keys, use that
      if (selectedIndex >= 0 && displayResults[selectedIndex]) {
        handleSelectLocation(displayResults[selectedIndex]);
      }
      // Otherwise, if there are results, select the first one
      else if (displayResults.length > 0) {
        handleSelectLocation(displayResults[0]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="location-search-bar" ref={searchRef}>
      <div className="search-input-wrapper">
        <span className="search-icon" aria-hidden="true">📍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search for a city or location..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          data-search-input
          aria-label="Search for a city or location"
          aria-autocomplete="list"
          aria-controls={showDropdown ? "search-results" : undefined}
          aria-expanded={showDropdown}
          role="combobox"
          aria-activedescendant={selectedIndex >= 0 ? `result-${selectedIndex}` : undefined}
        />
        {isLoading && (
          <span className="search-loading">⏳</span>
        )}
        {query && (
          <button
            className="search-clear"
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowDropdown(true);
            }}
            aria-label="Clear search"
            type="button"
          >
            <span aria-hidden="true">✕</span>
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          className="search-dropdown"
          id="search-results"
          role="listbox"
          aria-label="Search results"
        >
          {/* Recent Searches (shown when no query or with filtered results) */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="dropdown-section">
              <div className="dropdown-section-header">
                🕐 Recent Searches
              </div>
              {recentSearches.map((location, index) => (
                <div
                  key={index}
                  id={`result-${index}`}
                  className={`dropdown-item ${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => handleSelectLocation(location)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  role="option"
                  aria-selected={selectedIndex === index}
                >
                  <span className="location-icon">📍</span>
                  <div className="location-details">
                    <div className="location-name">{location.address}</div>
                    <div className="location-coords">
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Popular Locations (shown when no query and no recent searches) */}
          {query.length < 2 && recentSearches.length === 0 && popularLocations.length > 0 && (
            <div className="dropdown-section">
              <div className="dropdown-section-header">
                🌟 Popular Locations
              </div>
              {popularLocations.map((location, index) => (
                <div
                  key={index}
                  className={`dropdown-item ${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => handleSelectLocation(location)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className="location-icon">📍</span>
                  <div className="location-details">
                    <div className="location-name">{location.address}</div>
                    <div className="location-coords">
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filtered Recent Searches (when typing) */}
          {query.length >= 2 && getFilteredRecentSearches(query).length > 0 && (
            <div className="dropdown-section">
              <div className="dropdown-section-header">
                🕐 Recent
              </div>
              {getFilteredRecentSearches(query).map((location, index) => (
                <div
                  key={`recent-${index}`}
                  className={`dropdown-item ${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => handleSelectLocation(location)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className="location-icon">📍</span>
                  <div className="location-details">
                    <div className="location-name">{location.address}</div>
                    <div className="location-coords">
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Results */}
          {query.length >= 2 && results.length > 0 && (
            <div className="dropdown-section">
              <div className="dropdown-section-header">
                🔍 Search Results
              </div>
              {results.map((location, index) => {
                const offsetIndex = getFilteredRecentSearches(query).length + index;
                return (
                  <div
                    key={`result-${index}`}
                    className={`dropdown-item ${selectedIndex === offsetIndex ? 'selected' : ''}`}
                    onClick={() => handleSelectLocation(location)}
                    onMouseEnter={() => setSelectedIndex(offsetIndex)}
                  >
                    <span className="location-icon">📍</span>
                    <div className="location-details">
                      <div className="location-name">{location.address}</div>
                      <div className="location-coords">
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        {location.timezone && ` • ${location.timezone}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {query.length >= 2 && !isLoading && results.length === 0 && getFilteredRecentSearches(query).length === 0 && (
            <div className="dropdown-empty">
              <span className="empty-icon">🔍</span>
              <p>No locations found</p>
              <p className="empty-hint">Try a different search term</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && query.length >= 2 && (
            <div className="dropdown-loading">
              <span className="loading-spinner">⏳</span>
              <p>Searching locations...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LocationSearchBar;
