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

  // Animation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1); // 1x, 2x, 0.5x
  const [currentFrame, setCurrentFrame] = useState(0);
  const [opacity, setOpacity] = useState(0.6); // For fade effect during animation
  const animationIntervalRef = React.useRef(null);

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

  // Animation control handlers
  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const changeSpeed = () => {
    setAnimationSpeed(prev => {
      if (prev === 0.5) return 1;
      if (prev === 1) return 2;
      return 0.5;
    });
  };

  // Animation loop effect
  React.useEffect(() => {
    if (isPlaying) {
      const frameDelay = 1000 / animationSpeed; // Delay between frames

      animationIntervalRef.current = setInterval(() => {
        setCurrentFrame(prev => {
          // Cycle through 8 frames (simulating past hour)
          return (prev + 1) % 8;
        });

        // Pulse effect - fade in/out to show updates
        setOpacity(prev => {
          if (prev === 0.6) return 0.4;
          return 0.6;
        });
      }, frameDelay);
    } else {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      setOpacity(0.6); // Reset to default
    }

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [isPlaying, animationSpeed]);

  // Get timestamp for current frame
  const getFrameTimestamp = () => {
    if (!isPlaying) {
      return 'Live';
    }
    // Simulate past timestamps (10 minutes per frame going back)
    const minutesAgo = currentFrame * 10;
    const timestamp = new Date(Date.now() - minutesAgo * 60 * 1000);
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            opacity={isPlaying ? opacity : 0.6}
            key={`precip-${currentFrame}`}
          />
        )}

        {/* Cloud cover overlay */}
        {activeLayers.clouds && (
          <TileLayer
            attribution='&copy; <a href="https://openweathermap.org/">OpenWeather</a>'
            url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
            opacity={isPlaying ? opacity * 0.83 : 0.5}
            key={`clouds-${currentFrame}`}
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

      {/* Animation controls */}
      <div className="radar-animation-controls">
        <button
          className="animation-button"
          onClick={togglePlayPause}
          title={isPlaying ? 'Pause' : 'Play animation'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          className="animation-button speed-button"
          onClick={changeSpeed}
          title={`Speed: ${animationSpeed}x`}
        >
          {animationSpeed}x
        </button>
        <div className="animation-timestamp">
          {getFrameTimestamp()}
        </div>
        <div className="animation-progress">
          <div
            className="animation-progress-bar"
            style={{ width: `${((currentFrame + 1) / 8) * 100}%` }}
          ></div>
        </div>
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
