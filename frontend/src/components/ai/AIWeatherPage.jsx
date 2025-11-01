import React, { useState } from 'react';
import { useLocation } from '../../contexts/LocationContext';
import './AIWeatherPage.css';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

/**
 * AI Weather Page
 * Standalone page for asking weather questions with AI analysis
 */
function AIWeatherPage() {
  const { location } = useLocation();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  // Read question from URL parameter on mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const questionParam = urlParams.get('q');

    if (questionParam) {
      // URLSearchParams.get() already decodes the value
      setQuestion(questionParam);
    }
  }, []);

  const handleAskQuestion = React.useCallback(async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    if (!location) {
      setError('Please select a location first');
      return;
    }

    setLoading(true);
    setError(null);
    setAnswer(null);

    // Set up 30-second timeout
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Request timed out. The AI service took too long to respond. Please try again.');
    }, 30000);

    try {
      // Step 1: Validate query (with 10 second timeout)
      const validateController = new AbortController();
      const validateTimeout = setTimeout(() => validateController.abort(), 10000);

      const validateResponse = await fetch(`${API_BASE_URL}/ai-weather/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: question,
          location
        }),
        signal: validateController.signal
      });

      clearTimeout(validateTimeout);

      const validation = await validateResponse.json();

      if (!validation.isValid) {
        setError(`Invalid query: ${validation.reason}`);
        setLoading(false);
        return;
      }

      // Step 2: Get AI analysis (with 20 second timeout)
      const analyzeController = new AbortController();
      const analyzeTimeout = setTimeout(() => analyzeController.abort(), 20000);

      const analyzeResponse = await fetch(`${API_BASE_URL}/ai-weather/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: question,
          location,
          days: 7
        }),
        signal: analyzeController.signal
      });

      clearTimeout(analyzeTimeout);
      clearTimeout(timeoutId); // Clear the overall timeout

      const analysis = await analyzeResponse.json();

      if (analysis.error) {
        setError(`Error: ${analysis.error}`);
      } else {
        setAnswer(analysis);
      }
    } catch (err) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        setError('Request timed out. The AI service is taking too long. Please try again.');
      } else {
        setError(`Failed to get answer: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [question, location]);

  // Auto-submit when question is pre-filled from URL and location is available
  React.useEffect(() => {
    console.log('[Auto-submit check]', {
      question,
      location,
      locationType: typeof location,
      locationValue: JSON.stringify(location),
      autoSubmitted,
      loading
    });
    // Check that location is actually a non-empty string
    if (question && location && typeof location === 'string' && location.trim() && !autoSubmitted && !loading) {
      console.log('[Auto-submit] Submitting question automatically...');
      setAutoSubmitted(true);
      handleAskQuestion();
    } else {
      console.log('[Auto-submit] NOT submitting:', {
        hasQuestion: !!question,
        hasLocation: !!location,
        isString: typeof location === 'string',
        hasTrim: location && typeof location === 'string' ? !!location.trim() : false,
        notAutoSubmitted: !autoSubmitted,
        notLoading: !loading
      });
    }
  }, [question, location, autoSubmitted, loading, handleAskQuestion]);

  const exampleQuestions = [
    "Will it rain this weekend?",
    "What's the warmest day this week?",
    "Should I bring an umbrella tomorrow?",
    "When is the best day for outdoor activities?",
    "Will it be sunny on Friday?"
  ];

  return (
    <div className="ai-weather-page">
      <div className="ai-page-header">
        <h1>🤖 Ask Meteo Weather AI</h1>
        <p>Get instant answers to your weather questions powered by Claude AI</p>
        {location && (
          <div className="current-location-badge">
            📍 {location}
          </div>
        )}
      </div>

      <div className="ai-question-section">
        <div className="question-input-wrapper">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
            placeholder="Ask a question about the weather..."
            className="question-input"
            disabled={loading}
            maxLength={500}
          />
          <button
            onClick={handleAskQuestion}
            className="ask-button"
            disabled={loading || !location}
          >
            {loading ? '🔄 Analyzing...' : '🤖 Ask AI'}
          </button>
        </div>

        {!location && (
          <div className="warning-message">
            ⚠️ Please select a location from the dashboard first
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
      </div>

      {answer && (
        <div className="ai-answer-section">
          <div className="answer-header">
            <h2>💬 Answer</h2>
            <div className="answer-meta">
              <span className="confidence-badge">{answer.confidence} confidence</span>
              <span className="tokens-used">{answer.tokensUsed} tokens</span>
            </div>
          </div>
          <div className="answer-text">
            {answer.answer}
          </div>
          <div className="answer-context">
            <strong>Location:</strong> {answer.weatherData.location} <br />
            <strong>Current Conditions:</strong> {answer.weatherData.currentConditions}, {answer.weatherData.temperature}°C
          </div>
        </div>
      )}

      <div className="examples-section">
        <h3>Try asking:</h3>
        <div className="examples-grid">
          {exampleQuestions.map((q, index) => (
            <button
              key={index}
              onClick={() => setQuestion(q)}
              className="example-button"
              disabled={loading}
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      <div className="back-link">
        <a href="/">← Back to Dashboard</a>
      </div>
    </div>
  );
}

export default AIWeatherPage;
