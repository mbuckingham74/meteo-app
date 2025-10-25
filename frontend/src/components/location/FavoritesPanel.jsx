import React, { useState, useEffect } from 'react';
import { getFavorites, removeFavorite, isFavorite, addFavorite } from '../../services/favoritesService';
import './FavoritesPanel.css';

/**
 * FavoritesPanel Component
 * Displays and manages favorite locations
 */
function FavoritesPanel({ onLocationSelect, currentLocation }) {
  const [favorites, setFavorites] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);

  // Load favorites on mount
  useEffect(() => {
    refreshFavorites();
  }, []);

  const refreshFavorites = () => {
    setFavorites(getFavorites());
  };

  const handleRemove = (favoriteId, e) => {
    e.stopPropagation();
    if (removeFavorite(favoriteId)) {
      refreshFavorites();
    }
  };

  const handleToggleFavorite = (location, e) => {
    e.stopPropagation();

    const favorited = isFavorite(location.latitude, location.longitude);

    if (favorited) {
      removeFavorite(`${location.latitude},${location.longitude}`);
    } else {
      addFavorite(location);
    }

    refreshFavorites();
  };

  const isCurrentFavorite = currentLocation &&
    isFavorite(currentLocation.latitude, currentLocation.longitude);

  return (
    <div className="favorites-panel">
      <div className="favorites-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>
          ⭐ Favorite Locations
          {favorites.length > 0 && <span className="favorite-count">{favorites.length}</span>}
        </h3>
        <button className="expand-button">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="favorites-content">
          {/* Current Location Quick Add */}
          {currentLocation && !isCurrentFavorite && (
            <div className="current-location-add">
              <button
                className="add-current-button"
                onClick={(e) => handleToggleFavorite(currentLocation, e)}
              >
                <span>⭐</span>
                <span>Add "{currentLocation.address}" to favorites</span>
              </button>
            </div>
          )}

          {favorites.length === 0 ? (
            <div className="favorites-empty">
              <span className="empty-icon">⭐</span>
              <p>No favorite locations yet</p>
              <p className="empty-hint">Search for a location and click the star to add it</p>
            </div>
          ) : (
            <div className="favorites-list">
              {favorites.map((favorite) => {
                const isCurrent = currentLocation &&
                  favorite.latitude === currentLocation.latitude &&
                  favorite.longitude === currentLocation.longitude;

                return (
                  <div
                    key={favorite.id}
                    className={`favorite-item ${isCurrent ? 'active' : ''}`}
                    onClick={() => onLocationSelect(favorite)}
                  >
                    <div className="favorite-info">
                      <div className="favorite-name">
                        {favorite.address}
                        {isCurrent && <span className="current-badge">Current</span>}
                      </div>
                      <div className="favorite-coords">
                        {favorite.latitude.toFixed(4)}, {favorite.longitude.toFixed(4)}
                        {favorite.timezone && ` • ${favorite.timezone}`}
                      </div>
                    </div>
                    <button
                      className="remove-button"
                      onClick={(e) => handleRemove(favorite.id, e)}
                      title="Remove from favorites"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {favorites.length > 0 && (
            <div className="favorites-footer">
              <p>{favorites.length} favorite location{favorites.length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FavoritesPanel;
