import React, { useState } from 'react';
import { useLocation } from '../../contexts/LocationContext';
import { geocodeLocation } from '../../services/weatherApi';
import './UniversalSearchBar.css';

/**
 * Universal Smart Search Bar
 * One input to handle both simple location searches and complex AI queries
 * - Simple locations (e.g., "Seattle") → Fast geocoding
 * - Complex questions (e.g., "What's similar to Seattle?") → AI analysis
 */
function UniversalSearchBar() {
  const { selectLocation } = useLocation();
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
    // Navigate to AI page with question
    const questionParam = encodeURIComponent(question);
    window.location.href = `/ai-weather?q=${questionParam}`;
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
          placeholder="Enter a city or ask anything about weather..."
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
        <span className="universal-examples-label">Quick Start:</span>
        <button
          className="universal-example-chip location"
          onClick={() => setQuery("Seattle, WA")}
          title="Simple location search"
        >
          📍 Seattle, WA
        </button>
        <button
          className="universal-example-chip question"
          onClick={() => setQuery("Will it rain this weekend?")}
          title="Simple weather question"
        >
          💧 Will it rain this weekend?
        </button>
        <button
          className="universal-example-chip analysis"
          onClick={() => setQuery("What's similar to Seattle from June-October?")}
          title="AI-powered climate comparison"
        >
          🤖 Similar climate to Seattle?
        </button>
        <button
          className="universal-example-chip practical"
          onClick={() => setQuery("Should I bring an umbrella tomorrow?")}
          title="Practical weather advice"
        >
          ☂️ Umbrella tomorrow?
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
