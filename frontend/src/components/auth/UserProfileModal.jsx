import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  changePassword,
  getUserPreferences,
  updateUserPreferences,
  updateUserProfile
} from '../../services/authApi';
import './UserProfileModal.css';

/**
 * UserProfileModal Component
 * Manages user profile, preferences, and password
 */
function UserProfileModal({ isOpen, onClose }) {
  const { user, accessToken, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'preferences', 'security'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Preferences state
  const [preferences, setPreferences] = useState({
    temperature_unit: 'C',
    default_forecast_days: 7,
    default_location: '',
    theme: 'light'
  });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && accessToken) {
      loadPreferences();
    }
  }, [isOpen, accessToken]);

  const loadPreferences = async () => {
    try {
      const prefs = await getUserPreferences(accessToken);
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    onClose();
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const updatedUser = await updateUserProfile(accessToken, { name, email });
      updateUser(updatedUser);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await changePassword(accessToken, currentPassword, newPassword);
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const updated = await updateUserPreferences(accessToken, preferences);
      setPreferences(updated);
      setSuccess('Preferences saved successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="profile-modal-overlay" onClick={handleClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <button className="profile-modal-close" onClick={handleClose}>
            ×
          </button>
          <h2 className="profile-modal-title">Account Settings</h2>
          <p className="profile-modal-subtitle">Manage your profile and preferences</p>
        </div>

        <div className="profile-modal-body">
          {/* Tabs */}
          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`profile-tab ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              Preferences
            </button>
            <button
              className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </div>

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="profile-info-card">
                <div className="profile-info-row">
                  <span className="profile-info-label">Member Since</span>
                  <span className="profile-info-value">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Last Login</span>
                  <span className="profile-info-value">
                    {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="auth-form">
                <div className="form-group">
                  <label htmlFor="profile-name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="profile-name"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="profile-email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="profile-email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="profile-action-button"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="profile-section">
              <h3 className="profile-section-title">Weather Preferences</h3>

              <div className="preferences-grid">
                <div className="preference-item">
                  <div className="preference-label">
                    <span className="preference-label-text">Temperature Unit</span>
                    <span className="preference-label-description">
                      Default temperature unit for weather display
                    </span>
                  </div>
                  <div className="preference-control">
                    <select
                      value={preferences.temperature_unit}
                      onChange={(e) =>
                        setPreferences({ ...preferences, temperature_unit: e.target.value })
                      }
                    >
                      <option value="C">Celsius (°C)</option>
                      <option value="F">Fahrenheit (°F)</option>
                    </select>
                  </div>
                </div>

                <div className="preference-item">
                  <div className="preference-label">
                    <span className="preference-label-text">Default Forecast Days</span>
                    <span className="preference-label-description">
                      Number of days to show in forecast
                    </span>
                  </div>
                  <div className="preference-control">
                    <select
                      value={preferences.default_forecast_days}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          default_forecast_days: parseInt(e.target.value)
                        })
                      }
                    >
                      <option value="3">3 days</option>
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                    </select>
                  </div>
                </div>

                <div className="preference-item">
                  <div className="preference-label">
                    <span className="preference-label-text">Theme</span>
                    <span className="preference-label-description">
                      App color theme preference
                    </span>
                  </div>
                  <div className="preference-control">
                    <select
                      value={preferences.theme}
                      onChange={(e) =>
                        setPreferences({ ...preferences, theme: e.target.value })
                      }
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                className="profile-action-button"
                onClick={handleUpdatePreferences}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="profile-section">
              <h3 className="profile-section-title">Change Password</h3>

              <form onSubmit={handleChangePassword} className="password-change-form">
                <div className="form-group">
                  <label htmlFor="current-password" className="form-label">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="current-password"
                    className="form-input"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new-password" className="form-label">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    className="form-input"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-new-password" className="form-label">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirm-new-password"
                    className="form-input"
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="profile-action-button"
                  disabled={loading}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="profile-modal-footer">
          <button
            className="profile-action-button danger"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfileModal;
