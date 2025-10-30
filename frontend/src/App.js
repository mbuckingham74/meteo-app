import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocationProvider, useLocation } from './contexts/LocationContext';
import { TemperatureUnitProvider } from './contexts/TemperatureUnitContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import SkipToContent from './components/common/SkipToContent';
import AuthHeader from './components/auth/AuthHeader';
import WeatherDashboard from './components/weather/WeatherDashboard';
import LocationComparisonView from './components/location/LocationComparisonView';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import AIWeatherPage from './components/ai/AIWeatherPage';
import { getCurrentRoute, parseLocationSlug } from './utils/urlHelpers';
import { geocodeLocation } from './services/weatherApi';
import './styles/themes.css';
import './App.css';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const { selectLocation } = useLocation();

  console.log('Current view state:', currentView); // DEBUG

  // Handle route-based location loading
  useEffect(() => {
    const loadLocationFromUrl = async () => {
      const route = getCurrentRoute();

      // Handle location route
      if (route.path === 'location' && route.params.slug) {
        // If we have cached location state from navigation, use it
        if (route.state?.location) {
          selectLocation(route.state.location);
        } else {
          // Otherwise, geocode the slug
          try {
            const searchQuery = parseLocationSlug(route.params.slug);
            const results = await geocodeLocation(searchQuery, 1);
            if (results && results.length > 0) {
              selectLocation(results[0]);
            }
          } catch (error) {
            console.error('Error loading location from URL:', error);
          }
        }
      }
    };

    loadLocationFromUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - selectLocation is stable from context

  // Simple client-side routing
  useEffect(() => {
    const handleNavigation = async () => {
      const route = getCurrentRoute();
      console.log('[ROUTE DEBUG] getCurrentRoute returned:', route); // DEBUG

      // Update view based on route
      if (route.path === 'compare') {
        console.log('[ROUTE DEBUG] Setting view to: compare'); // DEBUG
        setCurrentView('compare');
      } else if (route.path === 'privacy') {
        console.log('[ROUTE DEBUG] Setting view to: privacy'); // DEBUG
        setCurrentView('privacy');
      } else if (route.path === 'ai-weather') {
        console.log('[ROUTE DEBUG] Setting view to: ai-weather'); // DEBUG
        setCurrentView('ai-weather');
      } else {
        // Both dashboard and location routes show the dashboard
        console.log('[ROUTE DEBUG] Setting view to: dashboard (default)'); // DEBUG
        setCurrentView('dashboard');
      }

      // Load location if navigating to a location route via back/forward
      if (route.path === 'location' && route.params.slug) {
        if (route.state?.location) {
          selectLocation(route.state.location);
        } else {
          try {
            const searchQuery = parseLocationSlug(route.params.slug);
            const results = await geocodeLocation(searchQuery, 1);
            if (results && results.length > 0) {
              selectLocation(results[0]);
            }
          } catch (error) {
            console.error('Error loading location from URL:', error);
          }
        }
      }
    };

    handleNavigation();
    window.addEventListener('popstate', handleNavigation);

    return () => window.removeEventListener('popstate', handleNavigation);
  }, [selectLocation]);

  // Handle link clicks
  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.tagName === 'A' && e.target.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const url = new URL(e.target.href);
        window.history.pushState({}, '', url.pathname);

        // Trigger popstate event to handle navigation consistently
        window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="App">
      <SkipToContent />
      <AuthHeader />
      <main id="main-content" tabIndex={-1}>
        {currentView === 'privacy' ? (
          <PrivacyPolicy />
        ) : currentView === 'ai-weather' ? (
          <AIWeatherPage />
        ) : currentView === 'compare' ? (
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
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <TemperatureUnitProvider>
            <LocationProvider>
              <AppContent />
            </LocationProvider>
          </TemperatureUnitProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
