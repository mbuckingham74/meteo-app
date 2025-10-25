import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { PRECIPITATION_COLORS } from '../../utils/colorScales';
import { formatDateShort, formatPrecipitation } from '../../utils/weatherHelpers';

/**
 * Precipitation Chart Component
 * Shows precipitation amounts and probability
 */
function PrecipitationChart({ data, height = 350 }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        No precipitation data available
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.map(day => ({
    date: day.date,
    displayDate: formatDateShort(day.date),
    precipitation: day.precipitation || day.precip || 0,
    probability: day.precipProbability || day.precipProb || 0,
    snow: day.snow || 0
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
        <p style={{ margin: '4px 0', color: '#3b82f6' }}>
          Precipitation: {formatPrecipitation(data.precipitation)}
        </p>
        {data.snow > 0 && (
          <p style={{ margin: '4px 0', color: '#e0f2fe' }}>
            Snow: {data.snow.toFixed(1)} mm
          </p>
        )}
        <p style={{ margin: '4px 0', color: '#94a3b8' }}>
          Probability: {Math.round(data.probability)}%
        </p>
      </div>
    );
  };

  return (
    <div>
      <h3 style={{ marginBottom: '16px', color: '#111827', fontSize: '18px', fontWeight: '600' }}>
        Precipitation & Probability
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
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
            yAxisId="left"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
            label={{
              value: 'Precipitation (mm)',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#6b7280' }
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
            label={{
              value: 'Probability (%)',
              angle: 90,
              position: 'insideRight',
              style: { textAnchor: 'middle', fill: '#6b7280' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          {/* Precipitation bars */}
          <Bar
            yAxisId="left"
            dataKey="precipitation"
            fill={PRECIPITATION_COLORS.rain}
            name="Precipitation"
            radius={[4, 4, 0, 0]}
          />

          {/* Snow bars (if any) */}
          <Bar
            yAxisId="left"
            dataKey="snow"
            fill={PRECIPITATION_COLORS.snow}
            name="Snow"
            radius={[4, 4, 0, 0]}
          />

          {/* Probability line */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="probability"
            stroke={PRECIPITATION_COLORS.probability}
            strokeWidth={2}
            name="Probability"
            dot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PrecipitationChart;
