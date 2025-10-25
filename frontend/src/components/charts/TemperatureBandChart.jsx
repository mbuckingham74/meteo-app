import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TEMPERATURE_BANDS } from '../../utils/colorScales';
import { formatTemperature, formatDateShort } from '../../utils/weatherHelpers';

/**
 * Temperature Band Chart Component
 * Weather Spark-style color-coded temperature visualization
 */
function TemperatureBandChart({ data, unit = 'C', height = 400 }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        No temperature data available
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.map(day => ({
    date: day.date,
    displayDate: formatDateShort(day.date),
    high: day.tempMax || day.tempHigh,
    low: day.tempMin || day.tempLow,
    avg: day.tempAvg || day.temp
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;

    return (
      <div style={{
        background: 'white',
        padding: '12px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#111827' }}>
          {data.displayDate}
        </p>
        <p style={{ margin: '4px 0', color: '#dc2626' }}>
          High: {formatTemperature(data.high, unit)}
        </p>
        <p style={{ margin: '4px 0', color: '#3b82f6' }}>
          Low: {formatTemperature(data.low, unit)}
        </p>
        <p style={{ margin: '4px 0', color: '#6b7280' }}>
          Avg: {formatTemperature(data.avg, unit)}
        </p>
      </div>
    );
  };

  return (
    <div>
      <h3 style={{ marginBottom: '16px', color: '#111827', fontSize: '18px', fontWeight: '600' }}>
        Temperature Range
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
            label={{
              value: `Temperature (°${unit})`,
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#6b7280' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />

          {/* Temperature high area */}
          <Area
            type="monotone"
            dataKey="high"
            stroke="#ef4444"
            fill="#fecaca"
            strokeWidth={2}
            name="High"
            fillOpacity={0.4}
          />

          {/* Temperature low area */}
          <Area
            type="monotone"
            dataKey="low"
            stroke="#3b82f6"
            fill="#bfdbfe"
            strokeWidth={2}
            name="Low"
            fillOpacity={0.4}
          />

          {/* Average temperature line */}
          <Area
            type="monotone"
            dataKey="avg"
            stroke="#8b5cf6"
            fill="none"
            strokeWidth={2}
            name="Average"
            strokeDasharray="5 5"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Temperature Band Legend */}
      <div style={{ marginTop: '20px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
          Temperature Comfort Zones:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {TEMPERATURE_BANDS.map(band => (
            <div key={band.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                backgroundColor: band.color,
                borderRadius: '3px'
              }} />
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {band.name} ({band.min}°-{band.max}°C)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TemperatureBandChart;
