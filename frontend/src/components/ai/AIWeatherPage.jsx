import React, { useState } from 'react';
import { useLocation } from '../../contexts/LocationContext';
import { useTemperatureUnit } from '../../contexts/TemperatureUnitContext';
import RadarMap from '../weather/RadarMap';
import HistoricalRainTable from '../weather/HistoricalRainTable';
import TemperatureBandChart from '../charts/TemperatureBandChart';
import WindChart from '../charts/WindChart';
import HourlyForecastChart from '../charts/HourlyForecastChart';
import { ChartSkeleton, TableSkeleton, MapSkeleton } from '../common/Skeleton';
import AIHistoryDropdown from './AIHistoryDropdown';
import { addToAIHistory } from '../../utils/aiHistoryStorage';
import './AIWeatherPage.css';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

/**
 * AI Weather Page
 * Standalone page for asking weather questions with AI analysis
 */
function AIWeatherPage() {
  const { location } = useLocation();
  const { unit } = useTemperatureUnit();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [visualizationsLoaded, setVisualizationsLoaded] = useState({});
  const [shareUrl, setShareUrl] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Auto-mark visualizations as loaded after a short delay (simulates loading)
  React.useEffect(() => {
    if (answer && answer.suggestedVisualizations) {
      const timer = setTimeout(() => {
        const loadedStates = {};
        answer.suggestedVisualizations.forEach((viz, index) => {
          loadedStates[`${viz.type}-${index}`] = true;
        });
        setVisualizationsLoaded(loadedStates);
      }, 300); // 300ms delay for smooth skeleton display

      return () => clearTimeout(timer);
    }
  }, [answer]);

  // Read question from URL parameter on mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const questionParam = urlParams.get('q');

    console.log('[URL param check]', { questionParam });

    if (questionParam) {
      // URLSearchParams.get() already decodes the value
      console.log('[URL param] Setting question:', questionParam);
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
    setVisualizationsLoaded({}); // Reset visualization loading states

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

        // Save to history
        addToAIHistory({
          question,
          answer: analysis.answer,
          location: analysis.weatherData.location,
          confidence: analysis.confidence,
          tokensUsed: analysis.tokensUsed,
          visualizations: analysis.suggestedVisualizations,
          followUpQuestions: analysis.followUpQuestions
        });
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
    console.log('[Auto-submit check] Current state:', {
      question,
      questionLength: question?.length,
      location,
      locationType: typeof location,
      locationValue: JSON.stringify(location),
      autoSubmitted,
      loading,
      urlSearch: window.location.search
    });

    // Check that location is actually a non-empty string
    const shouldAutoSubmit = question &&
                            question.trim() &&
                            location &&
                            typeof location === 'string' &&
                            location.trim() &&
                            !autoSubmitted &&
                            !loading;

    console.log('[Auto-submit] Should auto-submit?', shouldAutoSubmit, {
      hasQuestion: !!(question && question.trim()),
      hasLocation: !!(location && typeof location === 'string' && location.trim()),
      notAutoSubmitted: !autoSubmitted,
      notLoading: !loading
    });

    if (shouldAutoSubmit) {
      console.log('[Auto-submit] ✓ Will submit question automatically in 200ms...');
      // Increased delay to ensure everything is ready
      const timer = setTimeout(() => {
        console.log('[Auto-submit] ✓✓ Submitting now with question:', question);
        setAutoSubmitted(true);
        handleAskQuestion();
      }, 200);

      return () => {
        console.log('[Auto-submit] Cleanup: clearing timer');
        clearTimeout(timer);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, location, autoSubmitted, loading]);
  // Note: handleAskQuestion is intentionally omitted from dependencies to avoid circular updates

  // Handle creating a shareable link
  const handleShare = React.useCallback(async () => {
    if (!answer) return;

    setShareLoading(true);
    try {
      const shareData = {
        question,
        answer: answer.answer,
        location: answer.weatherData.location,
        weatherData: answer.weatherData,
        visualizations: answer.suggestedVisualizations,
        followUpQuestions: answer.followUpQuestions,
        confidence: answer.confidence,
        tokensUsed: answer.tokensUsed,
        model: answer.model
      };

      const response = await fetch(`${API_BASE_URL}/share/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shareData)
      });

      const result = await response.json();

      if (result.success) {
        const fullUrl = `${window.location.origin}${result.shareUrl}`;
        setShareUrl(fullUrl);

        // Copy to clipboard
        await navigator.clipboard.writeText(fullUrl);
        setShareCopied(true);

        // Reset copied state after 3 seconds
        setTimeout(() => setShareCopied(false), 3000);
      } else {
        setError(`Failed to create share link: ${result.error}`);
      }
    } catch (err) {
      setError(`Failed to create share link: ${err.message}`);
    } finally {
      setShareLoading(false);
    }
  }, [answer, question]);

  // Handle selecting a history item - replay the cached answer
  const handleSelectHistory = React.useCallback((historyItem) => {
    setQuestion(historyItem.question);
    setAnswer({
      answer: historyItem.answer,
      confidence: historyItem.confidence,
      tokensUsed: historyItem.tokensUsed,
      weatherData: {
        location: historyItem.location,
        currentConditions: '', // Not cached
        temperature: '' // Not cached
      },
      suggestedVisualizations: historyItem.visualizations || [],
      followUpQuestions: historyItem.followUpQuestions || []
    });
    setAutoSubmitted(false);
  }, []);

  const exampleQuestions = [
    "Will it rain today?", // Triggers radar + historical table
    "What's the temperature trend this week?", // Triggers temperature chart
    "How windy will it be tomorrow?", // Triggers wind chart
    "What's the 48-hour forecast?", // Triggers hourly chart
    "Should I bring an umbrella this weekend?" // Triggers radar
  ];

  return (
    <div className="ai-weather-page">
      <div className="ai-page-header">
        <div className="ai-header-content">
          <h1>🤖 Ask Meteo Weather AI</h1>
          <AIHistoryDropdown onSelectHistory={handleSelectHistory} />
        </div>
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
            <div className="answer-actions">
              <div className="answer-meta">
                <span className="confidence-badge">{answer.confidence} confidence</span>
                <span className="tokens-used">{answer.tokensUsed} tokens</span>
              </div>
              <button
                onClick={handleShare}
                className="share-button"
                disabled={shareLoading}
                title="Share this answer"
              >
                {shareLoading ? '⏳' : shareCopied ? '✓ Copied!' : '🔗 Share'}
              </button>
            </div>
          </div>
          <div className="answer-text">
            {answer.answer}
          </div>
          <div className="answer-context">
            <strong>Location:</strong> {answer.weatherData.location} <br />
            <strong>Current Conditions:</strong> {answer.weatherData.currentConditions}, {answer.weatherData.temperature}°C
          </div>

          {/* Render Suggested Visualizations */}
          {answer.suggestedVisualizations && answer.suggestedVisualizations.length > 0 && (
            <div className="visualizations-section">
              <h3>📊 Interactive Visualizations</h3>
              {answer.suggestedVisualizations.map((viz, index) => (
                <div key={index} className="visualization-container">
                  <div className="viz-header">
                    <h4>{viz.reason}</h4>
                  </div>

                  {/* Radar Map with skeleton */}
                  {viz.type === 'radar' && answer.weatherData.coordinates && (
                    <>
                      {!visualizationsLoaded[`radar-${index}`] && <MapSkeleton height={350} />}
                      <div className={visualizationsLoaded[`radar-${index}`] ? 'fade-in' : 'hidden'}>
                        <RadarMap
                          center={[answer.weatherData.coordinates.lat, answer.weatherData.coordinates.lon]}
                          zoom={8}
                        />
                      </div>
                    </>
                  )}

                  {/* Historical Precipitation Table with skeleton */}
                  {viz.type === 'historical-precipitation' && viz.params && (
                    <>
                      {!visualizationsLoaded[`historical-precipitation-${index}`] && (
                        <TableSkeleton rows={10} columns={4} height={500} />
                      )}
                      <div className={visualizationsLoaded[`historical-precipitation-${index}`] ? 'fade-in' : 'hidden'}>
                        <HistoricalRainTable
                          location={location}
                          date={viz.params.date}
                          years={viz.params.years}
                        />
                      </div>
                    </>
                  )}

                  {/* Temperature Chart with skeleton */}
                  {viz.type === 'chart-temperature' && answer.weatherData.forecast && (
                    <>
                      {!visualizationsLoaded[`chart-temperature-${index}`] && <ChartSkeleton height={400} />}
                      <div className={visualizationsLoaded[`chart-temperature-${index}`] ? 'fade-in' : 'hidden'}>
                        <TemperatureBandChart
                          data={answer.weatherData.forecast}
                          unit={unit}
                          height={400}
                        />
                      </div>
                    </>
                  )}

                  {/* Wind Chart with skeleton */}
                  {viz.type === 'chart-wind' && answer.weatherData.forecast && (
                    <>
                      {!visualizationsLoaded[`chart-wind-${index}`] && <ChartSkeleton height={350} />}
                      <div className={visualizationsLoaded[`chart-wind-${index}`] ? 'fade-in' : 'hidden'}>
                        <WindChart
                          data={answer.weatherData.forecast}
                          height={350}
                        />
                      </div>
                    </>
                  )}

                  {/* Hourly Forecast Chart with skeleton */}
                  {viz.type === 'chart-hourly' && answer.weatherData.hourly && (
                    <>
                      {!visualizationsLoaded[`chart-hourly-${index}`] && <ChartSkeleton height={400} />}
                      <div className={visualizationsLoaded[`chart-hourly-${index}`] ? 'fade-in' : 'hidden'}>
                        <HourlyForecastChart
                          hourlyData={answer.weatherData.hourly}
                          unit={unit}
                          height={400}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Render Follow-Up Questions */}
          {answer.followUpQuestions && answer.followUpQuestions.length > 0 && (
            <div className="followup-section">
              <h3>💬 You might also want to know:</h3>
              <div className="followup-chips">
                {answer.followUpQuestions.map((followUp, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuestion(followUp);
                      setAutoSubmitted(false); // Reset auto-submit flag
                      handleAskQuestion();
                    }}
                    className="followup-chip"
                    disabled={loading}
                  >
                    {followUp}
                  </button>
                ))}
              </div>
            </div>
          )}
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
