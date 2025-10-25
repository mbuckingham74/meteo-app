import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatTemperature } from '../../utils/weatherHelpers';
import { METRIC_COLORS } from '../../utils/colorScales';

/**
 * Hourly Forecast Chart Component
 * Displays 48-hour detailed forecast with temperature, feels-like, precipitation, and wind
 */
function HourlyForecastChart({ hourlyData, unit = 'C', height = 400 }) {
  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        No hourly forecast data available
      </div>
    );
  }

  // Format data for Recharts - show every 3rd hour for readability
  const chartData = hourlyData.map((hour, index) => {
    const time = hour.time.substring(0, 5); // HH:MM format
    const date = new Date(hour.datetime);
    const displayTime = index % 3 === 0 ? time : '';

    return {
      datetime: hour.datetime,
      displayTime,
      fullTime: time,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      temperature: hour.temperature,
      feelsLike: hour.feelsLike,
      precipitation: hour.precipitation || 0,
      precipProb: hour.precipProbability || 0,
      windSpeed: hour.windSpeed,
      humidity: hour.humidity,
      cloudCover: hour.cloudCover,
      uvIndex: hour.uvIndex,
      conditions: hour.conditions
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    const date = new Date(data.datetime);

    return (
      <div style={{
        background: 'white',
        padding: '12px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        minWidth: '200px'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#111827', fontSize: '13px' }}>
          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - {data.fullTime}
        </p>

        <p style={{ margin: '4px 0', color: METRIC_COLORS.temperature, fontSize: '12px' }}>
          🌡️ Temp: {formatTemperature(data.temperature, unit)}
        </p>
        <p style={{ margin: '4px 0', color: '#9333ea', fontSize: '12px' }}>
          🤚 Feels: {formatTemperature(data.feelsLike, unit)}
        </p>

        {data.precipitation > 0 && (
          <p style={{ margin: '4px 0', color: METRIC_COLORS.precipitation, fontSize: '12px' }}>
            🌧️ Precip: {data.precipitation.toFixed(1)} mm ({data.precipProb}%)
          </p>
        )}

        <p style={{ margin: '4px 0', color: METRIC_COLORS.windSpeed, fontSize: '12px' }}>
          💨 Wind: {data.windSpeed.toFixed(1)} km/h
        </p>

        {data.conditions && (
          <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#6b7280', fontStyle: 'italic' }}>
            {data.conditions}
          </p>
        )}
      </div>
    );
  };

  return (
    <div>
      <h3 style={{ marginBottom: '16px', color: '#111827', fontSize: '18px', fontWeight: '600' }}>
        48-Hour Detailed Forecast
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="displayTime"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            stroke="#9ca3af"
            label={{
              value: 'Time (hours)',
              position: 'insideBottom',
              offset: -5,
              style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 }
            }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
            label={{
              value: `Temperature (°${unit})`,
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
              value: 'Precipitation (mm)',
              angle: 90,
              position: 'insideRight',
              style: { textAnchor: 'middle', fill: '#6b7280' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          {/* Temperature line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="temperature"
            stroke={METRIC_COLORS.temperature}
            strokeWidth={2.5}
            name="Temperature"
            dot={{ r: 2 }}
          />

          {/* Feels-like line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="feelsLike"
            stroke="#9333ea"
            strokeWidth={2}
            name="Feels Like"
            dot={false}
            strokeDasharray="3 3"
          />

          {/* Precipitation bars */}
          <Bar
            yAxisId="right"
            dataKey="precipitation"
            fill={METRIC_COLORS.precipitation}
            fillOpacity={0.6}
            name="Precipitation"
            radius={[2, 2, 0, 0]}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
        <div style={{ padding: '10px', background: '#fef3c7', borderRadius: '6px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#78350f', textTransform: 'uppercase' }}>
            High
          </p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#92400e' }}>
            {formatTemperature(Math.max(...chartData.map(d => d.temperature)), unit)}
          </p>
        </div>

        <div style={{ padding: '10px', background: '#dbeafe', borderRadius: '6px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#1e3a8a', textTransform: 'uppercase' }}>
            Low
          </p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e40af' }}>
            {formatTemperature(Math.min(...chartData.map(d => d.temperature)), unit)}
          </p>
        </div>

        <div style={{ padding: '10px', background: '#e0f2fe', borderRadius: '6px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#075985', textTransform: 'uppercase' }}>
            Total Precip
          </p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0369a1' }}>
            {chartData.reduce((sum, d) => sum + d.precipitation, 0).toFixed(1)} mm
          </p>
        </div>

        <div style={{ padding: '10px', background: '#f3f4f6', borderRadius: '6px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#374151', textTransform: 'uppercase' }}>
            Avg Wind
          </p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#4b5563' }}>
            {(chartData.reduce((sum, d) => sum + d.windSpeed, 0) / chartData.length).toFixed(1)} km/h
          </p>
        </div>
      </div>

      {/* Info panel */}
      <div style={{ marginTop: '12px', padding: '10px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #3b82f6' }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#1e40af' }}>
          <strong>💡 Note:</strong> "Feels Like" temperature accounts for wind chill and heat index effects.
          Times shown in local timezone.
        </p>
      </div>
    </div>
  );
}

export default HourlyForecastChart;
