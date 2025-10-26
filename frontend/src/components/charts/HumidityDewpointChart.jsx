import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

/**
 * HumidityDewpointChart Component
 * Displays humidity percentage and dewpoint temperature over time
 */
function HumidityDewpointChart({ data, days, unit = 'C' }) {
  const getTimeLabel = () => {
    const numDays = days || data.length;
    if (numDays === 7) return 'Next Week';
    if (numDays === 14) return 'Next 2 Weeks';
    return `Next ${numDays} Days`;
  };

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
        <p>No humidity data available</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = data.map(day => ({
    date: new Date(day.datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    humidity: day.humidity,
    dewpoint: day.dew
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--bg-elevated)',
          border: '2px solid var(--border-light)',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: 'var(--text-primary)' }}>
            {payload[0].payload.date}
          </p>
          <p style={{ margin: '4px 0', color: '#60a5fa', fontWeight: '500' }}>
            💧 Humidity: {payload[0].value}%
          </p>
          <p style={{ margin: '4px 0', color: '#34d399', fontWeight: '500' }}>
            🌡️ Dewpoint: {payload[1]?.value}°{unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 450 }}>
      <h3 style={{
        margin: '0 0 24px 0',
        fontSize: '22px',
        fontWeight: '700',
        color: '#111827'
      }}>
        💧 Humidity & Dewpoint - {getTimeLabel()}
      </h3>

      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 5, right: 40, left: 25, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis
            dataKey="date"
            stroke="#374151"
            tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
            style={{ fontSize: '13px' }}
          />
          <YAxis
            yAxisId="left"
            stroke="#60a5fa"
            tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
            style={{ fontSize: '13px' }}
            label={{
              value: 'Humidity (%)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#111827', fontSize: 14, fontWeight: 600 }
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#34d399"
            tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
            style={{ fontSize: '13px' }}
            label={{
              value: `Dewpoint (°${unit})`,
              angle: 90,
              position: 'insideRight',
              style: { fill: '#111827', fontSize: 14, fontWeight: 600 }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: 600 }}
            iconType="line"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="humidity"
            stroke="#60a5fa"
            strokeWidth={2}
            name="Humidity (%)"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="dewpoint"
            stroke="#34d399"
            strokeWidth={2}
            name={`Dewpoint (°${unit})`}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'var(--bg-tertiary)',
        borderRadius: '8px',
        fontSize: '13px',
        color: 'var(--text-secondary)'
      }}>
        <p style={{ margin: 0 }}>
          💡 <strong>Dewpoint</strong> is the temperature at which air becomes saturated and dew forms.
          Higher dewpoint means more moisture in the air and a "stickier" feel.
        </p>
      </div>
    </div>
  );
}

export default HumidityDewpointChart;
