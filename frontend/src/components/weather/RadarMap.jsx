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
  const OPENWEATHER_API_KEY = '8ad36fbd98b10ec9b5b42b9c32d11b62';

  const [activeLayers, setActiveLayers] = useState({
    precipitation: true,
    clouds: true,
    temp: false
  });

  const toggleLayer = (layer) => {
    setActiveLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  return (
    <div className="radar-map-container" style={{ height: `${height}px` }}>
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
