import React from 'react';
import { useTemperatureUnit } from '../../contexts/TemperatureUnitContext';
import './TemperatureUnitToggle.css';

/**
 * TemperatureUnitToggle Component
 * Toggle button to switch between Celsius and Fahrenheit
 */
function TemperatureUnitToggle() {
  const { unit, toggleUnit } = useTemperatureUnit();

  return (
    <button
      className="temp-unit-toggle"
      onClick={toggleUnit}
      title={`Temperature: ${unit === 'C' ? 'Celsius' : 'Fahrenheit'}`}
    >
      <span className={`unit-option ${unit === 'C' ? 'active' : ''}`}>°C</span>
      <span className="unit-separator">|</span>
      <span className={`unit-option ${unit === 'F' ? 'active' : ''}`}>°F</span>
    </button>
  );
}

export default TemperatureUnitToggle;
