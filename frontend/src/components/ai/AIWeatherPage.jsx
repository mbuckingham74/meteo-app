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

  // Read question from URL parameter on mount
  React.useEffect(() => {
    console.log('[AIWeatherPage] Full URL:', window.location.href);
    console.log('[AIWeatherPage] Search params:', window.location.search);

    const urlParams = new URLSearchParams(window.location.search);
    const questionParam = urlParams.get('q');

    console.log('[AIWeatherPage] Question from URL:', questionParam);

    if (questionParam) {
      // URLSearchParams.get() already decodes the value
      setQuestion(questionParam);
      console.log('[AIWeatherPage] Question set to:', questionParam);
    }
  }, []);

  const handleAskQuestion = async () => {
    console.log('[handleAskQuestion] Called');
    console.log('[handleAskQuestion] Question:', question);
    console.log('[handleAskQuestion] Location:', location);
    console.log('[handleAskQuestion] API_BASE_URL:', API_BASE_URL);

    if (!question.trim()) {
      console.log('[handleAskQuestion] ERROR: No question');
      setError('Please enter a question');
      return;
    }

    if (!location) {
      console.log('[handleAskQuestion] ERROR: No location');
      setError('Please select a location first');
      return;
    }

    console.log('[handleAskQuestion] Starting API calls...');
    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      // Step 1: Validate query
      console.log('[handleAskQuestion] Step 1: Validating query...');
      const validateResponse = await fetch(`${API_BASE_URL}/ai-weather/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: question,
          location
        })
      });

      console.log('[handleAskQuestion] Validate response status:', validateResponse.status);
      const validation = await validateResponse.json();
      console.log('[handleAskQuestion] Validation result:', validation);

      if (!validation.isValid) {
        console.log('[handleAskQuestion] Query invalid:', validation.reason);
        setError(`Invalid query: ${validation.reason}`);
        setLoading(false);
        return;
      }

      // Step 2: Get AI analysis
      console.log('[handleAskQuestion] Step 2: Analyzing with AI...');
      const analyzeResponse = await fetch(`${API_BASE_URL}/ai-weather/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: question,
          location,
          days: 7
        })
      });

      console.log('[handleAskQuestion] Analyze response status:', analyzeResponse.status);
      const analysis = await analyzeResponse.json();
      console.log('[handleAskQuestion] Analysis result:', analysis);

      if (analysis.error) {
        console.log('[handleAskQuestion] Analysis error:', analysis.error);
        setError(analysis.error);
      } else {
        console.log('[handleAskQuestion] SUCCESS! Setting answer...');
        setAnswer(analysis);
      }
    } catch (err) {
      console.error('[handleAskQuestion] CATCH error:', err);
      setError('Failed to get answer: ' + err.message);
    } finally {
      console.log('[handleAskQuestion] Done, setting loading=false');
      setLoading(false);
    }
  };

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
