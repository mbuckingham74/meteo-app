/**
 * Tests for ThemeContext
 * Testing theme management with light/dark/auto modes
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';
import * as authApi from '../services/authApi';

// Mock authApi
jest.mock('../services/authApi');

// Mock AuthContext
jest.mock('./AuthContext', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    user: null,
  })),
}));

const mockUseAuth = require('./AuthContext').useAuth;

// Test component
function TestComponent() {
  const { themePreference, actualTheme, setTheme, loading } = useTheme();

  return (
    <div>
      <div data-testid="theme-preference">{themePreference}</div>
      <div data-testid="actual-theme">{actualTheme}</div>
      <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('auto')}>Set Auto</button>
    </div>
  );
}

describe('ThemeContext', () => {
  let getItemSpy, setItemSpy;
  let setAttributeSpy;
  let matchMediaMock;

  beforeEach(() => {
    // Reset auth mock
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
    });

    // Mock localStorage
    getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});

    // Mock document.documentElement.setAttribute
    setAttributeSpy = jest.spyOn(document.documentElement, 'setAttribute');

    // Mock window.matchMedia
    matchMediaMock = {
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    window.matchMedia = jest.fn(() => matchMediaMock);

    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.clearAllMocks();
  });

  afterEach(() => {
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
    setAttributeSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe('Provider - Guest Mode', () => {
    it('provides default theme as auto', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      expect(screen.getByTestId('theme-preference')).toHaveTextContent('auto');
    });

    it('resolves auto to light when system prefers light', async () => {
      matchMediaMock.matches = false;

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('actual-theme')).toHaveTextContent('light');
      });
    });

    it('resolves auto to dark when system prefers dark', async () => {
      matchMediaMock.matches = true;

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('actual-theme')).toHaveTextContent('dark');
      });
    });

    it('loads saved theme from localStorage', async () => {
      getItemSpy.mockReturnValue('dark');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('theme-preference')).toHaveTextContent('dark');
      });

      expect(getItemSpy).toHaveBeenCalledWith('themePreference');
    });

    it('applies theme to document element', async () => {
      matchMediaMock.matches = true;

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'dark');
      });
    });
  });

  describe('Provider - Authenticated Mode', () => {
    it('loads theme from user preferences', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        user: { id: 1 },
      });

      authApi.getUserPreferences.mockResolvedValue({
        theme: 'light',
        temperatureUnit: 'C',
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('theme-preference')).toHaveTextContent('light');
      });

      expect(authApi.getUserPreferences).toHaveBeenCalledWith('test-token');
    });

    it('handles API errors gracefully', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        user: { id: 1 },
      });

      authApi.getUserPreferences.mockRejectedValue(new Error('API error'));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      expect(console.error).toHaveBeenCalledWith(
        'Failed to load theme preference:',
        expect.any(Error)
      );
    });
  });

  describe('setTheme - Guest Mode', () => {
    it('changes theme to light', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      act(() => {
        screen.getByText('Set Light').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('theme-preference')).toHaveTextContent('light');
      });
    });

    it('saves to localStorage', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      act(() => {
        screen.getByText('Set Dark').click();
      });

      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalledWith('themePreference', 'dark');
      });
    });
  });

  describe('setTheme - Authenticated Mode', () => {
    it('saves to user preferences', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        user: { id: 1 },
      });

      authApi.getUserPreferences.mockResolvedValue({ theme: 'auto' });
      authApi.updateUserPreferences.mockResolvedValue({ theme: 'dark' });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      act(() => {
        screen.getByText('Set Dark').click();
      });

      await waitFor(() => {
        expect(authApi.updateUserPreferences).toHaveBeenCalledWith('test-token', {
          theme: 'dark',
        });
      });
    });

    it('handles save errors gracefully', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        user: { id: 1 },
      });

      authApi.getUserPreferences.mockResolvedValue({ theme: 'auto' });
      authApi.updateUserPreferences.mockRejectedValue(new Error('Save failed'));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      act(() => {
        screen.getByText('Set Light').click();
      });

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Failed to save theme preference:',
          expect.any(Error)
        );
      });

      expect(screen.getByTestId('theme-preference')).toHaveTextContent('light');
    });
  });

  describe('Auto Mode - System Preference', () => {
    it('listens for system theme changes', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('theme-preference')).toHaveTextContent('auto');
      });

      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(matchMediaMock.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    it('updates theme when system preference changes', async () => {
      matchMediaMock.matches = false;

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('actual-theme')).toHaveTextContent('light');
      });

      act(() => {
        const changeHandler = matchMediaMock.addEventListener.mock.calls.find(
          (call) => call[0] === 'change'
        )[1];
        changeHandler({ matches: true });
      });

      await waitFor(() => {
        expect(screen.getByTestId('actual-theme')).toHaveTextContent('dark');
      });
    });

    it('cleans up listener on unmount', async () => {
      const { unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      unmount();

      expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });
  });
});
