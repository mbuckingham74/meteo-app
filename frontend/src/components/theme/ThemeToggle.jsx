import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

/**
 * ThemeToggle Component
 * Simple button to cycle between light, dark, and auto themes
 */
function ThemeToggle({ compact = false }) {
  const { themePreference, actualTheme, setTheme } = useTheme();

  const getThemeIcon = () => {
    if (themePreference === 'auto') {
      return actualTheme === 'dark' ? '🌙' : '☀️';
    }
    return themePreference === 'dark' ? '🌙' : '☀️';
  };

  const getThemeLabel = () => {
    if (themePreference === 'auto') {
      return 'Auto';
    }
    return themePreference === 'dark' ? 'Dark' : 'Light';
  };

  // Cycle through themes: light -> dark -> auto -> light
  const cycleTheme = () => {
    const themeOrder = ['light', 'dark', 'auto'];
    const currentIndex = themeOrder.indexOf(themePreference);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  return (
    <div className="theme-toggle-container">
      <button
        className={`theme-toggle-button ${compact ? 'compact' : ''}`}
        onClick={cycleTheme}
        title={`Theme: ${getThemeLabel()} (click to cycle)`}
      >
        <span className="theme-icon">{getThemeIcon()}</span>
        <span className="theme-label">{getThemeLabel()}</span>
      </button>
    </div>
  );
}

export default ThemeToggle;
