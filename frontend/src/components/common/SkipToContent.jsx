import React from 'react';
import './SkipToContent.css';

/**
 * SkipToContent Component
 * Provides skip links for keyboard users to bypass repetitive navigation
 * Only visible when focused (Tab key)
 */
const SkipToContent = () => {
  const handleSkip = (e, targetId) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.tabIndex = -1; // Make focusable
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="skip-to-content" aria-label="Skip links">
      <a
        href="#main-content"
        className="skip-link"
        onClick={(e) => handleSkip(e, 'main-content')}
      >
        Skip to main content
      </a>
      <a
        href="#location-search"
        className="skip-link"
        onClick={(e) => handleSkip(e, 'location-search')}
      >
        Skip to location search
      </a>
      <a
        href="#weather-charts"
        className="skip-link"
        onClick={(e) => handleSkip(e, 'weather-charts')}
      >
        Skip to weather charts
      </a>
    </nav>
  );
};

export default SkipToContent;
