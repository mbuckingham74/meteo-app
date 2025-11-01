import React, { useState, useEffect, useRef } from 'react';
import { getAIHistory, deleteHistoryItem, clearAIHistory, formatHistoryTimestamp } from '../../utils/aiHistoryStorage';
import './AIHistoryDropdown.css';

/**
 * AI History Dropdown
 * Shows recent AI weather queries with instant replay
 */
function AIHistoryDropdown({ onSelectHistory }) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const dropdownRef = useRef(null);

  // Load history on mount and when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setHistory(getAIHistory());
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelectItem = (item) => {
    setIsOpen(false);
    onSelectHistory(item);
  };

  const handleDeleteItem = (e, itemId) => {
    e.stopPropagation(); // Prevent selection
    deleteHistoryItem(itemId);
    setHistory(getAIHistory());
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all history? This cannot be undone.')) {
      clearAIHistory();
      setHistory([]);
      setIsOpen(false);
    }
  };

  return (
    <div className="ai-history-dropdown" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="history-toggle-button"
        title="View recent AI queries"
      >
        📜 History {history.length > 0 && `(${history.length})`}
      </button>

      {isOpen && (
        <div className="history-dropdown-menu">
          <div className="history-dropdown-header">
            <h3>Recent Questions</h3>
            {history.length > 0 && (
              <button onClick={handleClearAll} className="clear-all-button">
                Clear All
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="history-empty">
              <p>No recent questions</p>
              <p className="history-empty-hint">Ask a question to see it here</p>
            </div>
          ) : (
            <div className="history-items">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="history-item"
                  onClick={() => handleSelectItem(item)}
                >
                  <div className="history-item-header">
                    <span className="history-location">📍 {item.location}</span>
                    <span className="history-timestamp">{formatHistoryTimestamp(item.timestamp)}</span>
                  </div>
                  <div className="history-question">{item.question}</div>
                  <div className="history-item-footer">
                    <span className="history-confidence">{item.confidence} confidence</span>
                    {item.visualizations && item.visualizations.length > 0 && (
                      <span className="history-viz-count">
                        {item.visualizations.length} visualization{item.visualizations.length > 1 ? 's' : ''}
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDeleteItem(e, item.id)}
                      className="history-delete-button"
                      title="Delete this item"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIHistoryDropdown;
