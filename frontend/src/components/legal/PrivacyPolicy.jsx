import React from 'react';
import './PrivacyPolicy.css';

function PrivacyPolicy() {
  return (
    <div className="privacy-policy-page">
      <div className="privacy-container">
        <header className="privacy-header">
          <h1>Meteo Weather Privacy Policy</h1>
          <p className="privacy-subtitle">Clear, Simple, Honest</p>
        </header>

        <div className="privacy-content">
          {/* Introduction */}
          <section className="privacy-section">
            <h2>Our Commitment</h2>
            <p className="privacy-highlight">
              <strong>We do NOT sell your data. Ever.</strong> Your privacy matters to us, and we believe
              in being transparent about what information we collect and how we use it.
            </p>
          </section>

          {/* What We Collect */}
          <section className="privacy-section">
            <h2>What Information We Collect</h2>

            <div className="privacy-subsection">
              <h3>For All Users (No Account Required)</h3>
              <ul className="privacy-list">
                <li>
                  <strong>Location Data:</strong> We access your approximate location to provide weather
                  information for your area. This is stored only in your browser's local storage and never
                  sent to our servers.
                </li>
                <li>
                  <strong>Preferences:</strong> Your temperature unit preference (°C or °F), theme choice
                  (light/dark/auto), and recent searches are stored in your browser's local storage to
                  enhance your experience.
                </li>
                <li>
                  <strong>Weather Queries:</strong> When you search for weather information, we temporarily
                  cache the data to reduce API calls and provide faster responses. This cached data is
                  anonymous and expires automatically.
                </li>
              </ul>
            </div>

            <div className="privacy-subsection">
              <h3>For Registered Users (Optional)</h3>
              <ul className="privacy-list">
                <li>
                  <strong>Account Information:</strong> Your email address (for login) and chosen username.
                </li>
                <li>
                  <strong>Saved Favorites:</strong> Your favorite locations are stored in our database to
                  sync across your devices.
                </li>
                <li>
                  <strong>Preferences:</strong> Your temperature unit and theme preferences are synced
                  across devices when logged in.
                </li>
              </ul>
            </div>
          </section>

          {/* How We Use Cookies */}
          <section className="privacy-section">
            <h2>How We Use Cookies & Local Storage</h2>
            <p>
              We use browser local storage (not traditional cookies) to remember your preferences when
              you're not logged in. This includes:
            </p>
            <ul className="privacy-list">
              <li>Temperature unit preference (Celsius or Fahrenheit)</li>
              <li>Theme preference (light, dark, or auto)</li>
              <li>Recent location searches (last 5 searches)</li>
              <li>Your last selected location</li>
            </ul>
            <p>
              <strong>Important:</strong> All this data stays in your browser. We don't track you across
              websites, and clearing your browser data will remove all stored preferences.
            </p>
            <p>
              For logged-in users, we use a session token (JWT) to keep you logged in securely. This token
              expires after 24 hours for your security.
            </p>
          </section>

          {/* What We Don't Do */}
          <section className="privacy-section privacy-section-highlight">
            <h2>What We Don't Do</h2>
            <ul className="privacy-list privacy-list-green">
              <li>❌ We do NOT sell your data to third parties</li>
              <li>❌ We do NOT share your personal information with advertisers</li>
              <li>❌ We do NOT track you across other websites</li>
              <li>❌ We do NOT use your data for marketing purposes</li>
              <li>❌ We do NOT collect unnecessary personal information</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section className="privacy-section">
            <h2>Third-Party Services</h2>
            <p>
              To provide weather data, we use the following external APIs:
            </p>
            <ul className="privacy-list">
              <li>
                <strong>Visual Crossing Weather API:</strong> Provides historical and forecast weather data.
                Your location queries are sent to their service to retrieve weather information.
              </li>
              <li>
                <strong>OpenWeather API:</strong> Provides radar map overlays (clouds, temperature).
              </li>
              <li>
                <strong>RainViewer API:</strong> Provides precipitation radar data.
              </li>
              <li>
                <strong>Anthropic Claude AI:</strong> Powers our AI-powered location finder feature.
                Your natural language queries are processed to help find locations matching your
                climate preferences.
              </li>
            </ul>
            <p>
              These services have their own privacy policies. We recommend reviewing them if you have
              concerns about how they handle data.
            </p>
          </section>

          {/* Your Rights */}
          <section className="privacy-section">
            <h2>Your Rights</h2>
            <p>You have complete control over your data:</p>
            <ul className="privacy-list">
              <li>
                <strong>Access:</strong> You can view all your saved preferences and favorite locations at
                any time.
              </li>
              <li>
                <strong>Delete:</strong> You can delete your account and all associated data at any time
                from your profile settings.
              </li>
              <li>
                <strong>Clear Local Data:</strong> Clear your browser's local storage to remove all
                preferences stored on your device.
              </li>
              <li>
                <strong>Opt-Out:</strong> You can use Meteo Weather without creating an account. Your
                preferences will still work via local storage.
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="privacy-section">
            <h2>Data Security</h2>
            <p>
              We take security seriously:
            </p>
            <ul className="privacy-list">
              <li>All data transmission is encrypted using HTTPS (SSL/TLS)</li>
              <li>Passwords are hashed using bcrypt before storage</li>
              <li>Authentication tokens (JWT) expire after 24 hours</li>
              <li>We never store your plain-text password</li>
              <li>Our database is protected on an internal network, not publicly accessible</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section className="privacy-section">
            <h2>Children's Privacy</h2>
            <p>
              Meteo Weather is a general-audience weather service. We do not knowingly collect personal
              information from children under 13. If you believe we have inadvertently collected such
              information, please contact us to have it removed.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section className="privacy-section">
            <h2>Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We'll notify users of significant
              changes by displaying a notice on the site. Continued use of Meteo Weather after changes
              indicates your acceptance of the updated policy.
            </p>
            <p className="privacy-meta">
              <strong>Last Updated:</strong> October 28, 2025
            </p>
          </section>

          {/* Contact */}
          <section className="privacy-section">
            <h2>Questions or Concerns?</h2>
            <p>
              If you have questions about this privacy policy or how we handle your data, feel free to
              reach out. We believe in transparency and are happy to address any concerns.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="privacy-footer">
          <a href="/" className="privacy-back-link">
            ← Back to Weather Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
