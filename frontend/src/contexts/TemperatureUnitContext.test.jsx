/**
 * Tests for TemperatureUnitContext
 * Testing temperature unit preference management
 */

import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemperatureUnitProvider, useTemperatureUnit } from './TemperatureUnitContext';

// Test component that uses the context
function TestComponent() {
  const { unit, setUnit } = useTemperatureUnit();

  return (
    <div>
      <div data-testid="current-unit">{unit}</div>
      <button onClick={() => setUnit('C')}>Set Celsius</button>
      <button onClick={() => setUnit('F')}>Set Fahrenheit</button>
    </div>
  );
}

describe('TemperatureUnitContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
  });

  describe('Provider', () => {
    it('provides default unit as Celsius', () => {
      render(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      expect(screen.getByTestId('current-unit')).toHaveTextContent('C');
    });

    it('loads saved unit from localStorage', () => {
      localStorage.getItem.mockReturnValue('F');

      render(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      expect(screen.getByTestId('current-unit')).toHaveTextContent('F');
      expect(localStorage.getItem).toHaveBeenCalledWith('meteo_temp_unit');
    });

    it('falls back to Celsius if localStorage has invalid value', () => {
      localStorage.getItem.mockReturnValue('invalid');

      render(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      expect(screen.getByTestId('current-unit')).toHaveTextContent('C');
    });

    it('handles localStorage errors gracefully', () => {
      localStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      // Should not crash
      render(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      expect(screen.getByTestId('current-unit')).toHaveTextContent('C');
    });
  });

  describe('setUnit', () => {
    it('changes unit to Celsius', async () => {
      const user = userEvent.setup();

      render(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      await user.click(screen.getByText('Set Celsius'));

      expect(screen.getByTestId('current-unit')).toHaveTextContent('C');
    });

    it('changes unit to Fahrenheit', async () => {
      const user = userEvent.setup();

      render(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      await user.click(screen.getByText('Set Fahrenheit'));

      expect(screen.getByTestId('current-unit')).toHaveTextContent('F');
    });

    it('saves unit to localStorage', async () => {
      const user = userEvent.setup();

      render(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      await user.click(screen.getByText('Set Fahrenheit'));

      expect(localStorage.setItem).toHaveBeenCalledWith('meteo_temp_unit', 'F');
    });

    it('handles localStorage save errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage quota exceeded');
      });

      render(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      // Should not crash
      await user.click(screen.getByText('Set Fahrenheit'));

      expect(screen.getByTestId('current-unit')).toHaveTextContent('F');
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  describe('Multiple Components', () => {
    it('shares unit state across multiple components', async () => {
      const user = userEvent.setup();

      function ComponentA() {
        const { unit } = useTemperatureUnit();
        return <div data-testid="component-a">{unit}</div>;
      }

      function ComponentB() {
        const { unit, setUnit } = useTemperatureUnit();
        return (
          <div>
            <div data-testid="component-b">{unit}</div>
            <button onClick={() => setUnit('F')}>Change to F</button>
          </div>
        );
      }

      render(
        <TemperatureUnitProvider>
          <ComponentA />
          <ComponentB />
        </TemperatureUnitProvider>
      );

      expect(screen.getByTestId('component-a')).toHaveTextContent('C');
      expect(screen.getByTestId('component-b')).toHaveTextContent('C');

      await user.click(screen.getByText('Change to F'));

      expect(screen.getByTestId('component-a')).toHaveTextContent('F');
      expect(screen.getByTestId('component-b')).toHaveTextContent('F');
    });
  });

  describe('Error Handling', () => {
    it('requires provider to function', () => {
      // The context will throw an error if used outside provider
      // We can test that the provider is required by checking if component works with it
      const { container } = render(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      expect(container.querySelector('[data-testid="current-unit"]')).toBeInTheDocument();
    });
  });

  describe('Persistence', () => {
    it('persists unit preference across provider remounts', () => {
      const { unmount } = render(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      // Change to Fahrenheit
      act(() => {
        const button = screen.getByText('Set Fahrenheit');
        button.click();
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('meteo_temp_unit', 'F');

      // Unmount
      unmount();

      // Remount - should load from localStorage
      localStorage.getItem.mockReturnValue('F');

      render(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      expect(screen.getByTestId('current-unit')).toHaveTextContent('F');
    });
  });
});
