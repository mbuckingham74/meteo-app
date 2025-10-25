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
    <div style={{ width: '100%', height: 400 }}>
      <h3 style={{
        margin: '0 0 20px 0',
        fontSize: '20px',
        fontWeight: '600',
        color: 'var(--text-primary)'
      }}>
        💧 Humidity & Dewpoint - {getTimeLabel()}
      </h3>

      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
          <XAxis
            dataKey="date"
            stroke="var(--text-tertiary)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            yAxisId="left"
            stroke="var(--text-tertiary)"
            style={{ fontSize: '12px' }}
            label={{ value: 'Humidity (%)', angle: -90, position: 'insideLeft', style: { fill: 'var(--text-secondary)' } }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="var(--text-tertiary)"
            style={{ fontSize: '12px' }}
            label={{ value: `Dewpoint (°${unit})`, angle: 90, position: 'insideRight', style: { fill: 'var(--text-secondary)' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
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
