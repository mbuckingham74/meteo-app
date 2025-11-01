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

// Chart skeleton for weather visualizations
export const ChartSkeleton = ({ height = 400 }) => {
  return (
    <div className="chart-skeleton" style={{ height }}>
      <Skeleton variant="rectangular" width="60%" height="24px" style={{ marginBottom: '16px' }} />
      <Skeleton variant="rectangular" width="100%" height={height - 80} style={{ marginBottom: '16px' }} />
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <Skeleton variant="rectangular" width="80px" height="16px" />
        <Skeleton variant="rectangular" width="80px" height="16px" />
        <Skeleton variant="rectangular" width="80px" height="16px" />
      </div>
    </div>
  );
};

// Table skeleton for historical data
export const TableSkeleton = ({ rows = 10, columns = 4, height = 500 }) => {
  return (
    <div className="table-skeleton" style={{ maxHeight: height, overflow: 'hidden' }}>
      <Skeleton variant="rectangular" width="40%" height="24px" style={{ marginBottom: '16px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '12px', marginBottom: '12px' }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" width="100%" height="40px" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '12px', marginBottom: '8px' }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="rectangular" width="100%" height="48px" />
          ))}
        </div>
      ))}
    </div>
  );
};

// Map skeleton for radar
export const MapSkeleton = ({ height = 350 }) => {
  return (
    <div className="map-skeleton" style={{ position: 'relative', height }}>
      <Skeleton variant="rectangular" width="100%" height={height} />
      <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton variant="circular" width="40px" height="40px" />
        <Skeleton variant="circular" width="40px" height="40px" />
        <Skeleton variant="circular" width="40px" height="40px" />
      </div>
    </div>
  );
};

export default Skeleton;
