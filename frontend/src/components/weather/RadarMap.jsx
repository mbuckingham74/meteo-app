import React, { useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './RadarMap.css';

/**
 * Component to update map center when location changes
 */
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

/**
 * Component to handle map ready event
 */
function MapReadyHandler({ onReady }) {
  const map = useMap();

  React.useEffect(() => {
    map.whenReady(() => {
      onReady();
    });
  }, [map, onReady]);

  return null;
}

/**
 * RadarMap Component
 * Displays an OpenWeather weather overlays on a map
 *
 * @param {Object} props
 * @param {number} props.latitude - Center latitude
 * @param {number} props.longitude - Center longitude
 * @param {number} props.zoom - Map zoom level (default: 8)
 * @param {number} props.height - Map height in pixels (default: 250)
 */
function RadarMap({ latitude, longitude, zoom = 8, height = 250 }) {
  const center = [latitude, longitude];
  const OPENWEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;

  const [activeLayers, setActiveLayers] = useState({
    precipitation: true,
    clouds: true,
    temp: false
  });

  const [isLoading, setIsLoading] = useState(true);

  const handleMapReady = React.useCallback(() => {
    // Small delay to ensure tiles start loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  if (!OPENWEATHER_API_KEY) {
    console.error('OpenWeather API key not found. Please add REACT_APP_OPENWEATHER_API_KEY to your .env file.');
    return (
      <div className="radar-map-error" style={{ height: `${height}px` }}>
        <p>⚠️ Radar map unavailable</p>
        <p className="error-hint">API key not configured</p>
      </div>
    );
  }

  const toggleLayer = (layer) => {
    setActiveLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  return (
    <div className="radar-map-container" style={{ height: `${height}px` }}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="radar-loading-overlay">
          <div className="radar-spinner"></div>
          <p className="radar-loading-text">Loading radar map...</p>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={true}
      >
        {/* Base map layer - OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Precipitation radar overlay */}
        {activeLayers.precipitation && (
          <TileLayer
            attribution='&copy; <a href="https://openweathermap.org/">OpenWeather</a>'
            url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
            opacity={0.6}
          />
        )}

        {/* Cloud cover overlay */}
        {activeLayers.clouds && (
          <TileLayer
            attribution='&copy; <a href="https://openweathermap.org/">OpenWeather</a>'
            url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
            opacity={0.5}
          />
        )}

        {/* Temperature overlay */}
        {activeLayers.temp && (
          <TileLayer
            attribution='&copy; <a href="https://openweathermap.org/">OpenWeather</a>'
            url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
            opacity={0.5}
          />
        )}

        {/* Update map view when location changes */}
        <ChangeMapView center={center} zoom={zoom} />

        {/* Handle map ready event */}
        <MapReadyHandler onReady={handleMapReady} />
      </MapContainer>

      {/* Layer toggles */}
      <div className="radar-controls">
        <button
          className={`layer-toggle ${activeLayers.precipitation ? 'active' : ''}`}
          onClick={() => toggleLayer('precipitation')}
          title="Precipitation"
        >
          💧
        </button>
        <button
          className={`layer-toggle ${activeLayers.clouds ? 'active' : ''}`}
          onClick={() => toggleLayer('clouds')}
          title="Clouds"
        >
          ☁️
        </button>
        <button
          className={`layer-toggle ${activeLayers.temp ? 'active' : ''}`}
          onClick={() => toggleLayer('temp')}
          title="Temperature"
        >
          🌡️
        </button>
      </div>

      <div className="radar-legend">
        <span className="legend-label">
          {activeLayers.precipitation && 'Precip '}
          {activeLayers.clouds && 'Clouds '}
          {activeLayers.temp && 'Temp'}
        </span>
      </div>
    </div>
  );
}

export default RadarMap;
