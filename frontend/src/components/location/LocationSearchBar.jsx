import React, { useState, useEffect, useRef } from 'react';
import { geocodeLocation, getPopularLocations } from '../../services/weatherApi';
import './LocationSearchBar.css';

/**
 * LocationSearchBar Component
 * Autocomplete search bar for location selection
 */
function LocationSearchBar({ onLocationSelect, currentLocation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [popularLocations, setPopularLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

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

  // Search for locations with debounce
  const searchLocations = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setShowDropdown(true); // Show popular locations
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
    onLocationSelect(location);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    const displayResults = query.length >= 2 ? results : popularLocations;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < displayResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectLocation(displayResults[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="location-search-bar" ref={searchRef}>
      <div className="search-input-wrapper">
        <span className="search-icon">📍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search for a city or location..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
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
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="search-dropdown">
          {query.length < 2 && popularLocations.length > 0 && (
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

          {query.length >= 2 && results.length > 0 && (
            <div className="dropdown-section">
              <div className="dropdown-section-header">
                🔍 Search Results
              </div>
              {results.map((location, index) => (
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
                      {location.timezone && ` • ${location.timezone}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {query.length >= 2 && !isLoading && results.length === 0 && (
            <div className="dropdown-empty">
              <span className="empty-icon">🔍</span>
              <p>No locations found</p>
              <p className="empty-hint">Try a different search term</p>
            </div>
          )}

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
