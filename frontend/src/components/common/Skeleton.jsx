import React from 'react';
import './Skeleton.css';

/**
 * Skeleton Component
 * Reusable loading placeholder for content
 * Provides smooth animation and various shapes
 */

// Base skeleton element
export const Skeleton = ({ width, height, variant = 'rectangular', className = '', style = {} }) => {
  const classes = `skeleton skeleton-${variant} ${className}`;

  const inlineStyle = {
    width: width || '100%',
    height: height || '1rem',
    ...style
  };

  return <div className={classes} style={inlineStyle} />;
};

// Specialized skeleton components
export const SkeletonText = ({ lines = 1, width = '100%', spacing = '0.5rem' }) => {
  return (
    <div className="skeleton-text-group" style={{ gap: spacing }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '70%' : width}
          height="1rem"
        />
      ))}
    </div>
  );
};

export const SkeletonCircle = ({ size = '3rem' }) => {
  return <Skeleton width={size} height={size} variant="circular" />;
};

export const SkeletonCard = ({ height = '10rem', padding = '1rem' }) => {
  return (
    <div className="skeleton-card" style={{ padding }}>
      <Skeleton width="100%" height={height} variant="rectangular" />
    </div>
  );
};

// Weather-specific skeletons
export const WeatherStatSkeleton = () => {
  return (
    <div className="skeleton-weather-stat">
      <Skeleton width="50px" height="50px" variant="circular" />
      <div className="skeleton-weather-stat-text">
        <Skeleton width="80%" height="1rem" />
        <Skeleton width="60%" height="0.875rem" style={{ marginTop: '0.5rem' }} />
      </div>
    </div>
  );
};

export const TemperatureDisplaySkeleton = () => {
  return (
    <div className="skeleton-temperature">
      <Skeleton width="120px" height="80px" variant="rectangular" style={{ borderRadius: '12px' }} />
      <Skeleton width="100px" height="1.25rem" style={{ marginTop: '0.75rem' }} />
    </div>
  );
};

export default Skeleton;
