import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

/**
 * ThemeToggle Component
 * Dropdown button to switch between light, dark, and auto themes
 */
function ThemeToggle({ compact = false }) {
  const { themePreference, actualTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  const themes = [
    {
      value: 'light',
      icon: '☀️',
      label: 'Light',
      description: 'Light theme'
    },
    {
      value: 'dark',
      icon: '🌙',
      label: 'Dark',
      description: 'Dark theme'
    },
    {
      value: 'auto',
      icon: '💻',
      label: 'Auto',
      description: 'Match system'
    }
  ];

  return (
    <div className="theme-toggle-container" ref={dropdownRef}>
      <button
        className={`theme-toggle-button ${compact ? 'compact' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={`Theme: ${getThemeLabel()}`}
      >
        <span className="theme-icon">{getThemeIcon()}</span>
        <span className="theme-label">{getThemeLabel()}</span>
      </button>

      {isOpen && (
        <div className="theme-dropdown">
          {themes.map((theme) => (
            <button
              key={theme.value}
              className={`theme-option ${themePreference === theme.value ? 'active' : ''}`}
              onClick={() => handleThemeChange(theme.value)}
            >
              <span className="theme-option-icon">{theme.icon}</span>
              <div className="theme-option-text">
                <div className="theme-option-label">{theme.label}</div>
                <div className="theme-option-description">{theme.description}</div>
              </div>
              {themePreference === theme.value && (
                <span className="theme-check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;
