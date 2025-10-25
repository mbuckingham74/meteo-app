import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * LocationContext
 * Manages the selected location state across the application
 */

const LocationContext = createContext();

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

export function LocationProvider({ children }) {
  const [location, setLocation] = useState('London,UK');
  const [locationData, setLocationData] = useState(null);

  const selectLocation = useCallback((locationObj) => {
    setLocation(locationObj.address || locationObj.location_name);
    setLocationData(locationObj);
  }, []);

  const clearLocation = useCallback(() => {
    setLocation('London,UK');
    setLocationData(null);
  }, []);

  const value = {
    location,
    locationData,
    selectLocation,
    clearLocation
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}
