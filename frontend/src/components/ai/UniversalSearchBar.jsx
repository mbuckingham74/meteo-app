import React, { useState } from 'react';
import { useLocation } from '../../contexts/LocationContext';
import { geocodeLocation } from '../../services/weatherApi';
import { navigateToAIWeather } from '../../utils/urlHelpers';
import './UniversalSearchBar.css';

/**
 * Universal Smart Search Bar
 * One input to handle both simple location searches and complex AI queries
 * - Simple locations (e.g., "Seattle") → Fast geocoding
 * - Complex questions (e.g., "What's similar to Seattle?") → AI analysis
 */
function UniversalSearchBar() {
  const { location, selectLocation } = useLocation();
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get current city for dynamic queries
  const currentCity = location?.address?.split(',')[0] || 'Seattle';

  /**
   * Smart detection: Is this a simple location or a complex AI query?
   */
  const isComplexQuery = (input) => {
    const text = input.toLowerCase().trim();

    // Question indicators
    if (text.includes('?')) return true;

    // Question words
    const questionWords = ['what', 'where', 'when', 'why', 'how', 'should', 'will', 'can', 'is', 'are'];
    if (questionWords.some(word => text.startsWith(word + ' ') || text.includes(' ' + word + ' '))) {
      return true;
    }

    // Comparative/analytical words
    const analyticalWords = ['similar', 'like', 'warmer', 'cooler', 'better', 'compare', 'than', 'climate'];
    if (analyticalWords.some(word => text.includes(word))) {
      return true;
    }

    // Multiple sentences (likely complex)
    if (text.split('.').length > 2) return true;

    // Otherwise, treat as simple location
    return false;
  };

  /**
   * Handle simple location search (fast geocoding)
   */
  const handleLocationSearch = async (locationQuery) => {
    try {
      setIsProcessing(true);
      const results = await geocodeLocation(locationQuery, 5);

      if (results && results.length > 0) {
        // Use first result
        selectLocation(results[0]);
        setQuery(''); // Clear input on success
      } else {
        // No results - could show error or fallback to AI
        console.log('No location found, consider AI fallback');
      }
    } catch (error) {
      console.error('Location search error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle complex AI query (intelligent analysis)
   */
  const handleAIQuery = (question) => {
    // Navigate to AI page with question using client-side routing
    navigateToAIWeather(question);
  };

  /**
   * Universal submit handler - routes to appropriate handler
   */
  const handleSubmit = () => {
    if (!query.trim()) return;

    if (isComplexQuery(query)) {
      // Complex query → AI
      handleAIQuery(query);
    } else {
      // Simple location → Geocoding
      handleLocationSearch(query);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="universal-search-bar">
      {/* Hero Message */}
      <div className="universal-hero">
        <h2 className="universal-hero-title">A New Way to Check Weather</h2>
        <p className="universal-hero-subtitle">
          Just type a city name or ask any weather question. Our AI understands both.
        </p>
      </div>

      {/* Main Input - Dead Center */}
      <div className="universal-input-wrapper">
        <span className="universal-icon">🔍</span>
        <input
          type="text"
          className="universal-search-input"
          placeholder="Ask me anything... e.g., 'Will it rain this weekend in Seattle?' or 'When did Denver experience its highest temperature?' or 'I live in Florida June-November and it's miserable - where should I move?'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isProcessing}
        />
        <button
          className="universal-submit-button"
          onClick={handleSubmit}
          disabled={!query.trim() || isProcessing}
        >
          {isProcessing ? '...' : '→'}
        </button>
      </div>

      {/* Example Query Bar - Centered */}
      <div className="universal-examples">
        <span className="universal-examples-label">👇 Try asking:</span>
        <button
          className="universal-example-chip question"
          onClick={() => setQuery(`Will it rain this weekend in ${currentCity}?`)}
          title="Weather forecast question"
        >
          🌧️ Will it rain this weekend?
        </button>
        <button
          className="universal-example-chip analysis"
          onClick={() => setQuery(`What are the rainiest months in ${currentCity} based on historical data?`)}
          title="Historical data analysis"
        >
          📊 Show me the rainiest months
        </button>
        <button
          className="universal-example-chip comparison"
          onClick={() => setQuery(`What cities have a similar climate to ${currentCity}?`)}
          title="Find similar climates"
        >
          🌍 Find similar climates
        </button>
        <button
          className="universal-example-chip practical"
          onClick={() => setQuery(`How does ${currentCity}'s weather compare to Denver, Colorado?`)}
          title="Compare cities"
        >
          🏔️ Compare to another city
        </button>
      </div>

      {/* Smart Detection Hint - Centered */}
      {query.trim() && (
        <div className="universal-hint">
          {isComplexQuery(query) ? (
            <span className="hint-ai">🤖 AI will analyze this question</span>
          ) : (
            <span className="hint-location">📍 Searching for location</span>
          )}
        </div>
      )}
    </div>
  );
}

export default UniversalSearchBar;
