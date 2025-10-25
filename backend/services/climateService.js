const { getHistoricalWeather } = require('./weatherService');

/**
 * Climate Statistics Service
 * Analyzes historical weather data to compute climate normals, records, and statistics
 */

/**
 * Get multi-year historical data for a specific date range
 * @param {string} location - City name, address, or coordinates
 * @param {string} startDate - Start date (MM-DD format)
 * @param {string} endDate - End date (MM-DD format)
 * @param {number} years - Number of years to look back (default: 10)
 * @returns {Promise<object>} Multi-year historical data
 */
async function getMultiYearHistorical(location, startDate, endDate, years = 10) {
  const currentYear = new Date().getFullYear();
  const allData = [];
  const errors = [];

  // Fetch data for each year
  for (let i = 0; i < years; i++) {
    const year = currentYear - i - 1; // Start from last year
    const start = `${year}-${startDate}`;
    const end = `${year}-${endDate}`;

    try {
      const result = await getHistoricalWeather(location, start, end);
      if (result.success) {
        allData.push({
          year,
          data: result.historical,
          location: result.location
        });
      } else {
        errors.push({ year, error: result.error });
      }
    } catch (error) {
      errors.push({ year, error: error.message });
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return {
    success: allData.length > 0,
    location: allData[0]?.location,
    years: allData.map(d => d.year),
    data: allData,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Calculate climate normals (30-day averages) for a specific date
 * @param {string} location - City name, address, or coordinates
 * @param {string} date - Date (MM-DD format)
 * @param {number} years - Number of years to analyze (default: 10)
 * @returns {Promise<object>} Climate normals
 */
async function getClimateNormals(location, date, years = 10) {
  // Get 15 days before and after to smooth the data
  const [month, day] = date.split('-').map(Number);
  const centerDate = new Date(2020, month - 1, day); // Use leap year for calculation

  const startDate = new Date(centerDate);
  startDate.setDate(centerDate.getDate() - 15);

  const endDate = new Date(centerDate);
  endDate.setDate(centerDate.getDate() + 15);

  const startDateStr = `${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
  const endDateStr = `${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

  const multiYearData = await getMultiYearHistorical(location, startDateStr, endDateStr, years);

  if (!multiYearData.success) {
    return { success: false, error: 'Failed to fetch historical data' };
  }

  // Aggregate all data points
  const allDays = [];
  multiYearData.data.forEach(yearData => {
    allDays.push(...yearData.data);
  });

  // Calculate statistics
  const temps = allDays.map(d => d.tempAvg).filter(t => t != null);
  const tempMaxs = allDays.map(d => d.tempMax).filter(t => t != null);
  const tempMins = allDays.map(d => d.tempMin).filter(t => t != null);
  const precips = allDays.map(d => d.precipitation).filter(p => p != null);
  const humidities = allDays.map(d => d.humidity).filter(h => h != null);

  return {
    success: true,
    location: multiYearData.location,
    date,
    yearsAnalyzed: multiYearData.years,
    normals: {
      tempAvg: calculateMean(temps),
      tempMax: calculateMean(tempMaxs),
      tempMin: calculateMean(tempMins),
      tempStdDev: calculateStdDev(temps),
      precipitation: calculateMean(precips),
      humidity: calculateMean(humidities),
      percentiles: {
        temp10: calculatePercentile(temps, 10),
        temp25: calculatePercentile(temps, 25),
        temp50: calculatePercentile(temps, 50),
        temp75: calculatePercentile(temps, 75),
        temp90: calculatePercentile(temps, 90)
      }
    }
  };
}

/**
 * Find record temperatures for a location
 * @param {string} location - City name, address, or coordinates
 * @param {string} startDate - Start date (MM-DD format)
 * @param {string} endDate - End date (MM-DD format)
 * @param {number} years - Number of years to analyze (default: 10)
 * @returns {Promise<object>} Record temperatures
 */
async function getRecordTemperatures(location, startDate, endDate, years = 10) {
  const multiYearData = await getMultiYearHistorical(location, startDate, endDate, years);

  if (!multiYearData.success) {
    return { success: false, error: 'Failed to fetch historical data' };
  }

  // Group data by day-of-year
  const dayGroups = {};

  multiYearData.data.forEach(yearData => {
    yearData.data.forEach(day => {
      const monthDay = day.date.substring(5); // Get MM-DD
      if (!dayGroups[monthDay]) {
        dayGroups[monthDay] = [];
      }
      dayGroups[monthDay].push({
        ...day,
        year: yearData.year
      });
    });
  });

  // Find records for each day
  const records = {};
  Object.keys(dayGroups).forEach(monthDay => {
    const days = dayGroups[monthDay];
    const recordHigh = days.reduce((max, day) =>
      day.tempMax > max.tempMax ? day : max
    );
    const recordLow = days.reduce((min, day) =>
      day.tempMin < min.tempMin ? day : min
    );

    records[monthDay] = {
      date: monthDay,
      recordHigh: {
        temperature: recordHigh.tempMax,
        year: recordHigh.year,
        date: recordHigh.date
      },
      recordLow: {
        temperature: recordLow.tempMin,
        year: recordLow.year,
        date: recordLow.date
      },
      avgHigh: calculateMean(days.map(d => d.tempMax)),
      avgLow: calculateMean(days.map(d => d.tempMin))
    };
  });

  return {
    success: true,
    location: multiYearData.location,
    yearsAnalyzed: multiYearData.years,
    records: Object.values(records)
  };
}

/**
 * Compare current forecast with historical averages
 * @param {string} location - City name, address, or coordinates
 * @param {array} forecastData - Current forecast data
 * @param {number} years - Number of years to analyze (default: 10)
 * @returns {Promise<object>} Comparison data
 */
async function compareForecastToHistorical(location, forecastData, years = 10) {
  if (!forecastData || forecastData.length === 0) {
    return { success: false, error: 'No forecast data provided' };
  }

  const comparisons = [];

  for (const forecast of forecastData) {
    const date = forecast.date.substring(5); // Get MM-DD
    const normals = await getClimateNormals(location, date, years);

    if (normals.success) {
      comparisons.push({
        date: forecast.date,
        forecast: {
          tempMax: forecast.tempMax,
          tempMin: forecast.tempMin,
          tempAvg: forecast.tempAvg,
          precipitation: forecast.precipitation
        },
        historical: normals.normals,
        comparison: {
          tempDiff: forecast.tempAvg - normals.normals.tempAvg,
          tempMaxDiff: forecast.tempMax - normals.normals.tempMax,
          tempMinDiff: forecast.tempMin - normals.normals.tempMin,
          precipDiff: forecast.precipitation - normals.normals.precipitation,
          isWarmerThanNormal: forecast.tempAvg > normals.normals.tempAvg,
          isCoolerThanNormal: forecast.tempAvg < normals.normals.tempAvg,
          isWetterThanNormal: forecast.precipitation > normals.normals.precipitation
        }
      });
    }

    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return {
    success: true,
    location,
    comparisons
  };
}

/**
 * Get "This Day in History" weather data
 * @param {string} location - City name, address, or coordinates
 * @param {string} date - Date (MM-DD format, defaults to today)
 * @param {number} years - Number of years to look back (default: 10)
 * @returns {Promise<object>} Historical data for this day
 */
async function getThisDayInHistory(location, date = null, years = 10) {
  if (!date) {
    const today = new Date();
    date = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  const multiYearData = await getMultiYearHistorical(location, date, date, years);

  if (!multiYearData.success) {
    return { success: false, error: 'Failed to fetch historical data' };
  }

  // Extract data for this specific day across years
  const historicalDays = multiYearData.data.map(yearData => ({
    year: yearData.year,
    ...yearData.data[0]
  }));

  // Find extremes
  const recordHigh = historicalDays.reduce((max, day) =>
    day.tempMax > max.tempMax ? day : max
  );
  const recordLow = historicalDays.reduce((min, day) =>
    day.tempMin < min.tempMin ? day : min
  );
  const mostPrecip = historicalDays.reduce((max, day) =>
    day.precipitation > max.precipitation ? day : max
  );

  // Calculate averages
  const temps = historicalDays.map(d => d.tempAvg);
  const tempMaxs = historicalDays.map(d => d.tempMax);
  const tempMins = historicalDays.map(d => d.tempMin);
  const precips = historicalDays.map(d => d.precipitation);

  return {
    success: true,
    location: multiYearData.location,
    date,
    yearsAnalyzed: multiYearData.years,
    records: {
      highTemperature: {
        value: recordHigh.tempMax,
        year: recordHigh.year,
        date: recordHigh.date
      },
      lowTemperature: {
        value: recordLow.tempMin,
        year: recordLow.year,
        date: recordLow.date
      },
      maxPrecipitation: {
        value: mostPrecip.precipitation,
        year: mostPrecip.year,
        date: mostPrecip.date
      }
    },
    averages: {
      temp: calculateMean(temps),
      tempMax: calculateMean(tempMaxs),
      tempMin: calculateMean(tempMins),
      precipitation: calculateMean(precips)
    },
    allYears: historicalDays
  };
}

/**
 * Calculate temperature probability distribution
 * @param {string} location - City name, address, or coordinates
 * @param {string} startDate - Start date (MM-DD format)
 * @param {string} endDate - End date (MM-DD format)
 * @param {number} years - Number of years to analyze (default: 10)
 * @returns {Promise<object>} Probability distribution data
 */
async function getTemperatureProbability(location, startDate, endDate, years = 10) {
  const multiYearData = await getMultiYearHistorical(location, startDate, endDate, years);

  if (!multiYearData.success) {
    return { success: false, error: 'Failed to fetch historical data' };
  }

  // Collect all temperature values
  const allTemps = [];
  multiYearData.data.forEach(yearData => {
    yearData.data.forEach(day => {
      allTemps.push(day.tempAvg);
    });
  });

  // Create temperature bins (5°C intervals)
  const binSize = 5;
  const minTemp = Math.floor(Math.min(...allTemps) / binSize) * binSize;
  const maxTemp = Math.ceil(Math.max(...allTemps) / binSize) * binSize;

  const bins = {};
  for (let temp = minTemp; temp <= maxTemp; temp += binSize) {
    bins[temp] = 0;
  }

  // Count occurrences in each bin
  allTemps.forEach(temp => {
    const bin = Math.floor(temp / binSize) * binSize;
    bins[bin] = (bins[bin] || 0) + 1;
  });

  // Convert to probability
  const total = allTemps.length;
  const distribution = Object.keys(bins).map(temp => ({
    temperature: parseFloat(temp),
    count: bins[temp],
    probability: (bins[temp] / total) * 100
  }));

  return {
    success: true,
    location: multiYearData.location,
    yearsAnalyzed: multiYearData.years,
    totalDataPoints: total,
    distribution: distribution.sort((a, b) => a.temperature - b.temperature),
    statistics: {
      mean: calculateMean(allTemps),
      median: calculatePercentile(allTemps, 50),
      stdDev: calculateStdDev(allTemps),
      min: Math.min(...allTemps),
      max: Math.max(...allTemps)
    }
  };
}

// ============ Helper Functions ============

function calculateMean(values) {
  if (!values || values.length === 0) return null;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function calculateStdDev(values) {
  if (!values || values.length === 0) return null;
  const mean = calculateMean(values);
  const squareDiffs = values.map(val => Math.pow(val - mean, 2));
  return Math.sqrt(calculateMean(squareDiffs));
}

function calculatePercentile(values, percentile) {
  if (!values || values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

module.exports = {
  getMultiYearHistorical,
  getClimateNormals,
  getRecordTemperatures,
  compareForecastToHistorical,
  getThisDayInHistory,
  getTemperatureProbability
};
