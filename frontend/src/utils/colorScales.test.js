import {
  getTemperatureColor,
  getTemperatureBand,
  TEMPERATURE_BANDS,
  PRECIPITATION_COLORS,
  METRIC_COLORS,
  getUVIndexColor,
  getCloudCoverColor,
  getWindSpeedColor
} from './colorScales';

describe('colorScales', () => {
  describe('getTemperatureColor', () => {
    it('returns frigid color for very cold temperatures', () => {
      expect(getTemperatureColor(-20)).toBe('#1e3a8a');
      expect(getTemperatureColor(-5)).toBe('#1e3a8a');
    });

    it('returns cold color for cold temperatures', () => {
      expect(getTemperatureColor(0)).toBe('#3b82f6');
      expect(getTemperatureColor(5)).toBe('#3b82f6');
    });

    it('returns cool color for cool temperatures', () => {
      expect(getTemperatureColor(10)).toBe('#60a5fa');
      expect(getTemperatureColor(12)).toBe('#60a5fa');
    });

    it('returns comfortable color for moderate temperatures', () => {
      expect(getTemperatureColor(15)).toBe('#10b981');
      expect(getTemperatureColor(20)).toBe('#10b981');
    });

    it('returns warm color for warm temperatures', () => {
      expect(getTemperatureColor(25)).toBe('#fbbf24');
      expect(getTemperatureColor(28)).toBe('#fbbf24');
    });

    it('returns hot color for hot temperatures', () => {
      expect(getTemperatureColor(30)).toBe('#f97316');
      expect(getTemperatureColor(33)).toBe('#f97316');
    });

    it('returns sweltering color for very hot temperatures', () => {
      expect(getTemperatureColor(35)).toBe('#dc2626');
      expect(getTemperatureColor(45)).toBe('#dc2626');
    });

    it('handles decimal temperatures', () => {
      expect(getTemperatureColor(20.5)).toBeTruthy();
      expect(getTemperatureColor(32.7)).toBeTruthy();
    });

    it('handles negative temperatures', () => {
      expect(getTemperatureColor(-40)).toBe('#1e3a8a');
      expect(getTemperatureColor(-10)).toBe('#1e3a8a');
    });
  });

  describe('getTemperatureBand', () => {
    it('returns correct band name for frigid', () => {
      expect(getTemperatureBand(-20)).toBe('Frigid');
      expect(getTemperatureBand(-5)).toBe('Frigid');
    });

    it('returns correct band name for cold', () => {
      expect(getTemperatureBand(0)).toBe('Cold');
      expect(getTemperatureBand(5)).toBe('Cold');
    });

    it('returns correct band name for cool', () => {
      expect(getTemperatureBand(10)).toBe('Cool');
      expect(getTemperatureBand(12)).toBe('Cool');
    });

    it('returns correct band name for comfortable', () => {
      expect(getTemperatureBand(15)).toBe('Comfortable');
      expect(getTemperatureBand(20)).toBe('Comfortable');
    });

    it('returns correct band name for warm', () => {
      expect(getTemperatureBand(25)).toBe('Warm');
      expect(getTemperatureBand(28)).toBe('Warm');
    });

    it('returns correct band name for hot', () => {
      expect(getTemperatureBand(30)).toBe('Hot');
      expect(getTemperatureBand(33)).toBe('Hot');
    });

    it('returns correct band name for sweltering', () => {
      expect(getTemperatureBand(35)).toBe('Sweltering');
      expect(getTemperatureBand(45)).toBe('Sweltering');
    });
  });

  describe('TEMPERATURE_BANDS', () => {
    it('is an array', () => {
      expect(Array.isArray(TEMPERATURE_BANDS)).toBe(true);
    });

    it('has 7 bands', () => {
      expect(TEMPERATURE_BANDS).toHaveLength(7);
    });

    it('each band has required properties', () => {
      TEMPERATURE_BANDS.forEach(band => {
        expect(band).toHaveProperty('name');
        expect(band).toHaveProperty('min');
        expect(band).toHaveProperty('max');
        expect(band).toHaveProperty('color');
      });
    });

    it('bands have correct names', () => {
      const names = TEMPERATURE_BANDS.map(b => b.name);
      expect(names).toContain('Frigid');
      expect(names).toContain('Cold');
      expect(names).toContain('Cool');
      expect(names).toContain('Comfortable');
      expect(names).toContain('Warm');
      expect(names).toContain('Hot');
      expect(names).toContain('Sweltering');
    });

    it('bands have valid hex colors', () => {
      const hexColorRegex = /^#[0-9a-f]{6}$/i;
      TEMPERATURE_BANDS.forEach(band => {
        expect(band.color).toMatch(hexColorRegex);
      });
    });
  });

  describe('PRECIPITATION_COLORS', () => {
    it('has rain color', () => {
      expect(PRECIPITATION_COLORS).toHaveProperty('rain');
      expect(PRECIPITATION_COLORS.rain).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('has snow color', () => {
      expect(PRECIPITATION_COLORS).toHaveProperty('snow');
      expect(PRECIPITATION_COLORS.snow).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('has mixed color', () => {
      expect(PRECIPITATION_COLORS).toHaveProperty('mixed');
      expect(PRECIPITATION_COLORS.mixed).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('has probability color', () => {
      expect(PRECIPITATION_COLORS).toHaveProperty('probability');
      expect(PRECIPITATION_COLORS.probability).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('METRIC_COLORS', () => {
    const expectedMetrics = [
      'temperature',
      'feelsLike',
      'humidity',
      'precipitation',
      'cloudCover',
      'uvIndex',
      'windSpeed',
      'pressure'
    ];

    it('has all expected metric colors', () => {
      expectedMetrics.forEach(metric => {
        expect(METRIC_COLORS).toHaveProperty(metric);
      });
    });

    it('all colors are valid hex codes', () => {
      const hexColorRegex = /^#[0-9a-f]{6}$/i;
      Object.values(METRIC_COLORS).forEach(color => {
        expect(color).toMatch(hexColorRegex);
      });
    });
  });

  describe('getUVIndexColor', () => {
    it('returns green for low UV index (0-2)', () => {
      expect(getUVIndexColor(0)).toBe('#10b981');
      expect(getUVIndexColor(2)).toBe('#10b981');
    });

    it('returns yellow for moderate UV index (3-5)', () => {
      expect(getUVIndexColor(3)).toBe('#fbbf24');
      expect(getUVIndexColor(5)).toBe('#fbbf24');
    });

    it('returns orange for high UV index (6-7)', () => {
      expect(getUVIndexColor(6)).toBe('#f97316');
      expect(getUVIndexColor(7)).toBe('#f97316');
    });

    it('returns red for very high UV index (8-10)', () => {
      expect(getUVIndexColor(8)).toBe('#dc2626');
      expect(getUVIndexColor(10)).toBe('#dc2626');
    });

    it('returns dark red for extreme UV index (11+)', () => {
      expect(getUVIndexColor(11)).toBe('#7c2d12');
      expect(getUVIndexColor(15)).toBe('#7c2d12');
    });

    it('handles decimal UV values', () => {
      expect(getUVIndexColor(2.5)).toBeTruthy();
      expect(getUVIndexColor(7.8)).toBeTruthy();
    });
  });

  describe('getCloudCoverColor', () => {
    it('returns light blue for clear skies (0-19%)', () => {
      expect(getCloudCoverColor(0)).toBe('#60a5fa');
      expect(getCloudCoverColor(15)).toBe('#60a5fa');
    });

    it('returns light gray for partly cloudy (20-49%)', () => {
      expect(getCloudCoverColor(20)).toBe('#94a3b8');
      expect(getCloudCoverColor(40)).toBe('#94a3b8');
    });

    it('returns gray for mostly cloudy (50-79%)', () => {
      expect(getCloudCoverColor(50)).toBe('#64748b');
      expect(getCloudCoverColor(70)).toBe('#64748b');
    });

    it('returns dark gray for overcast (80-100%)', () => {
      expect(getCloudCoverColor(80)).toBe('#475569');
      expect(getCloudCoverColor(100)).toBe('#475569');
    });

    it('handles decimal values', () => {
      expect(getCloudCoverColor(25.5)).toBeTruthy();
      expect(getCloudCoverColor(75.3)).toBeTruthy();
    });
  });

  describe('getWindSpeedColor', () => {
    it('returns green for calm winds (0-9 km/h)', () => {
      expect(getWindSpeedColor(0)).toBe('#10b981');
      expect(getWindSpeedColor(9)).toBe('#10b981');
    });

    it('returns yellow for light winds (10-29 km/h)', () => {
      expect(getWindSpeedColor(10)).toBe('#fbbf24');
      expect(getWindSpeedColor(25)).toBe('#fbbf24');
    });

    it('returns orange for moderate winds (30-49 km/h)', () => {
      expect(getWindSpeedColor(30)).toBe('#f97316');
      expect(getWindSpeedColor(45)).toBe('#f97316');
    });

    it('returns red for strong winds (50-69 km/h)', () => {
      expect(getWindSpeedColor(50)).toBe('#dc2626');
      expect(getWindSpeedColor(65)).toBe('#dc2626');
    });

    it('returns dark red for gale winds (70+ km/h)', () => {
      expect(getWindSpeedColor(70)).toBe('#7c2d12');
      expect(getWindSpeedColor(100)).toBe('#7c2d12');
    });

    it('handles decimal values', () => {
      expect(getWindSpeedColor(12.5)).toBeTruthy();
      expect(getWindSpeedColor(55.7)).toBeTruthy();
    });
  });

  describe('Color format validation', () => {
    it('all functions return valid hex colors', () => {
      const hexColorRegex = /^#[0-9a-f]{6}$/i;

      expect(getTemperatureColor(20)).toMatch(hexColorRegex);
      expect(getUVIndexColor(5)).toMatch(hexColorRegex);
      expect(getCloudCoverColor(50)).toMatch(hexColorRegex);
      expect(getWindSpeedColor(30)).toMatch(hexColorRegex);
    });
  });
});
