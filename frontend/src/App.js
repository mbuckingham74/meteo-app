import React, { useState, useEffect } from 'react';
import WeatherDashboard from './components/weather/WeatherDashboard';
import LocationComparisonView from './components/location/LocationComparisonView';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  // Simple client-side routing
  useEffect(() => {
    const handleNavigation = () => {
      const path = window.location.pathname;
      if (path === '/compare') {
        setCurrentView('compare');
      } else {
        setCurrentView('dashboard');
      }
    };

    handleNavigation();
    window.addEventListener('popstate', handleNavigation);

    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  // Handle link clicks
  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.tagName === 'A' && e.target.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const url = new URL(e.target.href);
        window.history.pushState({}, '', url.pathname);

        if (url.pathname === '/compare') {
          setCurrentView('compare');
        } else {
          setCurrentView('dashboard');
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="App">
      {currentView === 'compare' ? (
        <>
          <div style={{ padding: '20px 20px 0 20px', maxWidth: '1400px', margin: '0 auto' }}>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#f3f4f6',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#374151',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#e5e7eb'}
              onMouseLeave={(e) => e.target.style.background = '#f3f4f6'}
            >
              ← Back to Dashboard
            </a>
          </div>
          <LocationComparisonView />
        </>
      ) : (
        <WeatherDashboard />
      )}
    </div>
  );
}

export default App;
