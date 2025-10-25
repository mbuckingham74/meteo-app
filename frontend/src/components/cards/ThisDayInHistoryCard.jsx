import React from 'react';
import { formatTemperature } from '../../utils/weatherHelpers';

/**
 * This Day in History Card Component
 * Displays historical weather records for the current date
 */
function ThisDayInHistoryCard({ historyData, unit = 'C' }) {
  if (!historyData || !historyData.records) {
    return (
      <div style={{
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        Loading historical data...
      </div>
    );
  }

  const { date, records, averages, yearsAnalyzed, location } = historyData;

  // Format date for display
  const formatDate = (dateStr) => {
    const [month, day] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;
  };

  return (
    <div style={{
      padding: '24px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700' }}>
          📅 This Day in History
        </h3>
        <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
          {formatDate(date)} • {location?.address || 'Loading...'}
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.75 }}>
          Based on {yearsAnalyzed?.length || 0} years of data
        </p>
      </div>

      {/* Record temperatures */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {/* Record High */}
        <div style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>🔥</span>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, fontWeight: '600' }}>
              Record High
            </p>
          </div>
          <p style={{ margin: '0 0 4px 0', fontSize: '32px', fontWeight: '700' }}>
            {formatTemperature(records.highTemperature.value, unit)}
          </p>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.75 }}>
            Set in {records.highTemperature.year}
          </p>
        </div>

        {/* Record Low */}
        <div style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>❄️</span>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, fontWeight: '600' }}>
              Record Low
            </p>
          </div>
          <p style={{ margin: '0 0 4px 0', fontSize: '32px', fontWeight: '700' }}>
            {formatTemperature(records.lowTemperature.value, unit)}
          </p>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.75 }}>
            Set in {records.lowTemperature.year}
          </p>
        </div>
      </div>

      {/* Average temperatures */}
      <div style={{
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '10px',
        backdropFilter: 'blur(10px)'
      }}>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', opacity: 0.9 }}>
          📊 Historical Averages
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '11px', opacity: 0.75, textTransform: 'uppercase' }}>
              High
            </p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              {formatTemperature(averages.tempMax, unit)}
            </p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '11px', opacity: 0.75, textTransform: 'uppercase' }}>
              Average
            </p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              {formatTemperature(averages.temp, unit)}
            </p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '11px', opacity: 0.75, textTransform: 'uppercase' }}>
              Low
            </p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              {formatTemperature(averages.tempMin, unit)}
            </p>
          </div>
        </div>
      </div>

      {/* Precipitation record */}
      {records.maxPrecipitation && records.maxPrecipitation.value > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🌧️</span>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
                Most Precipitation
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: '600' }}>
                {records.maxPrecipitation.value.toFixed(1)} mm
              </p>
              <p style={{ margin: 0, fontSize: '10px', opacity: 0.75 }}>
                in {records.maxPrecipitation.year}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fun fact */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <p style={{ margin: 0, fontSize: '11px', opacity: 0.85, lineHeight: '1.5' }}>
          💡 <strong>Did you know?</strong> The temperature on this day has varied by{' '}
          {Math.abs(records.highTemperature.value - records.lowTemperature.value).toFixed(1)}°{unit}{' '}
          over the past {yearsAnalyzed?.length || 0} years!
        </p>
      </div>
    </div>
  );
}

export default ThisDayInHistoryCard;
