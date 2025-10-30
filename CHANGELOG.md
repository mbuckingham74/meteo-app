# Changelog

All notable changes to the Meteo Weather App project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Versioning Scheme:**
- **0.x.x** - Initial development phase (current)
- **0.MINOR.0** - New features and major improvements (0.1.0 → 0.2.0 → 0.3.0)
- **0.MINOR.PATCH** - Bug fixes and minor updates (0.2.0 → 0.2.1 → 0.2.2)
- **1.0.0** - First stable production release (when ready)

---

## [Unreleased]

*No unreleased changes yet. Stay tuned for the next update!*

---

## [0.2.0] - 2025-10-29

**Release Highlights:** Enterprise-grade security infrastructure, PWA support, accessibility improvements, and enhanced UX features.

### Security
- **Enterprise-Grade Security Infrastructure** - Achieved 9.4/10 security score
  - Implemented Gitleaks secret scanning with pre-commit hooks and GitHub Actions
  - Enabled Dependabot automated vulnerability monitoring and security PRs
  - Fixed all 9 npm vulnerabilities (6 high, 3 moderate severity)
  - Added comprehensive security headers documentation (`SECURITY_HEADERS.md`)
  - Implemented weekly automated security scans (Sundays 2 AM UTC)
  - Created Dependabot configuration for automated dependency updates (Mondays 9 AM UTC)
  - Added npm overrides to force secure dependency versions
  - **Fixed CVEs:**
    - CVE-2021-3803 (nth-check) - ReDoS vulnerability
    - CVE-2023-44270 (postcss) - Line return parsing error
    - Multiple webpack-dev-server source code theft vulnerabilities
- Removed hardcoded API key from deployment script ([49bf901](https://github.com/mbuckingham74/meteo-weather/commit/49bf901))
- Rotated exposed OpenWeather API key after security audit

### Added
- **Progressive Web App (PWA) Support** ([1e52bf4](https://github.com/mbuckingham74/meteo-weather/commit/1e52bf4))
  - Installable as native app on mobile and desktop
  - Offline functionality with service worker caching
  - App manifest with icons and theme colors
  - "Add to Home Screen" prompt for mobile users

- **Keyboard Navigation & Accessibility** ([d57a7de](https://github.com/mbuckingham74/meteo-weather/commit/d57a7de))
  - WCAG 2.1 AA compliant
  - Full keyboard shortcuts (arrows, Enter, Escape, Tab)
  - Screen reader support with ARIA labels
  - Focus management and visible focus indicators
  - Skip-to-content link for keyboard users

- **URL-Based Location Routing** ([6d39876](https://github.com/mbuckingham74/meteo-weather/commit/6d39876))
  - Shareable URLs for specific city weather (e.g., `/location/Seattle,WA`)
  - Browser back/forward navigation support
  - URL parameters reflect current location
  - Deep linking support for weather data

- **Error Boundaries & Loading Skeletons** ([d18ca00](https://github.com/mbuckingham74/meteo-weather/commit/d18ca00))
  - Graceful error handling with recovery options
  - Content-aware loading skeletons for better perceived performance
  - Detailed error messages for debugging
  - Automatic retry functionality

- **Recent Location Search History** ([287ad4b](https://github.com/mbuckingham74/meteo-weather/commit/287ad4b))
  - Stores last 5 searched locations in localStorage
  - Clear history button with confirmation
  - Quick access to frequently searched cities

- **"Use My Location" Option** ([a9f4536](https://github.com/mbuckingham74/meteo-weather/commit/a9f4536))
  - Quick access button in search dropdown
  - Multi-tier geolocation with IP-based fallback
  - Works on desktop and mobile devices

- **Plausible Analytics Integration** ([8874079](https://github.com/mbuckingham74/meteo-weather/commit/8874079))
  - Privacy-focused, self-hosted analytics
  - Tracks beta site traffic (meteo-beta.tachyonfuture.com)
  - GDPR compliant, no cookies

- **Clickable Header Home Link** ([cd35e8b](https://github.com/mbuckingham74/meteo-weather/commit/cd35e8b))
  - "Meteo Weather" header navigates to home
  - Improved UX for returning to main page

### Changed
- **City Name Prominence** ([d822cfc](https://github.com/mbuckingham74/meteo-weather/commit/d822cfc), [38a92db](https://github.com/mbuckingham74/meteo-weather/commit/38a92db))
  - Significantly larger city name display
  - Improved typography and visual hierarchy
  - Better readability on mobile devices

- **Location Header Layout** ([9b8a102](https://github.com/mbuckingham74/meteo-weather/commit/9b8a102))
  - Fixed spacing issues in location header
  - Improved coordinates readability
  - Better alignment and visual balance

- **City Name Capitalization** ([bbe0873](https://github.com/mbuckingham74/meteo-weather/commit/bbe0873))
  - Proper capitalization for all city names
  - Consistent formatting across the app
  - Removed duplicate search results

- **Backend Deployment Process** ([55bbf0e](https://github.com/mbuckingham74/meteo-weather/commit/55bbf0e))
  - Backend container now rebuilds automatically on deployment
  - Uses `--force-recreate` flag for zero-downtime deployments
  - Improved deployment reliability

### Fixed
- **Docker Health Checks** ([aa63f17](https://github.com/mbuckingham74/meteo-weather/commit/aa63f17))
  - Changed health checks to use 127.0.0.1 instead of localhost
  - Fixed intermittent health check failures
  - Improved container stability

- **Search Validation** ([0c6cb39](https://github.com/mbuckingham74/meteo-weather/commit/0c6cb39))
  - Added validation to prevent invalid locations in search results
  - Better error handling for malformed location data
  - Improved search result quality

- **Deployment Script** ([a38e06a](https://github.com/mbuckingham74/meteo-weather/commit/a38e06a))
  - Updated deployment script with better error handling
  - Simplified server access documentation
  - More reliable production deployments

### Testing
- **35% Test Coverage Milestone** ([6fd3563](https://github.com/mbuckingham74/meteo-weather/commit/6fd3563), [68d7bb9](https://github.com/mbuckingham74/meteo-weather/commit/68d7bb9))
  - 476 tests passing (0 failures)
  - Auth component tests
  - Card component tests
  - Utility function tests
  - Added json-summary coverage reporter

- **Phase 4 Component Testing** ([14f7a7d](https://github.com/mbuckingham74/meteo-weather/commit/14f7a7d))
  - Pushed coverage to 33% baseline
  - Comprehensive component test suite
  - Improved test reliability

### Documentation
- **Security Documentation Overhaul** ([10471d4](https://github.com/mbuckingham74/meteo-weather/commit/10471d4))
  - Highlighted security as #2 key feature in README
  - Added security badges (Security Scan, 0 Vulnerabilities)
  - Expanded security section to 180 lines with 9 subsections
  - Added security architecture section to CLAUDE.md
  - Documented all security systems and processes

- **Comprehensive Security Headers Guide** ([838fcee](https://github.com/mbuckingham74/meteo-weather/commit/838fcee))
  - Created `SECURITY_HEADERS.md` with implementation guide
  - Documented CSP, X-Frame-Options, HSTS, Permissions-Policy
  - Step-by-step Nginx configuration instructions
  - Testing and validation procedures

- **Recent Features Documentation** ([7c40d22](https://github.com/mbuckingham74/meteo-weather/commit/7c40d22))
  - Updated README with accessibility improvements
  - Documented PWA support and deployment changes
  - Updated test coverage statistics

- **PWA and Error Handling Documentation** ([5d1730a](https://github.com/mbuckingham74/meteo-weather/commit/5d1730a))
  - Added PWA section to CLAUDE.md
  - Documented error boundary implementation
  - Loading skeleton architecture details

- **Accessibility Documentation** ([e8b1c7d](https://github.com/mbuckingham74/meteo-weather/commit/e8b1c7d))
  - Added comprehensive keyboard navigation guide
  - Documented WCAG 2.1 AA compliance
  - Screen reader support details

- **URL Routing Documentation** ([a4b4090](https://github.com/mbuckingham74/meteo-weather/commit/a4b4090))
  - Documented URL-based location routing
  - Shareable URLs feature explanation
  - Browser navigation integration

- **Deployment Guide Updates** ([f4b2234](https://github.com/mbuckingham74/meteo-weather/commit/f4b2234))
  - Updated with health check fixes
  - API key rotation procedures
  - Production deployment best practices

---

## [0.1.0] - 2025-10-24

**Release Name:** Initial Beta Release

### Core Features
- **Weather Dashboard**
  - Current weather conditions with live data
  - 7-day, 14-day forecast views
  - 48-hour hourly forecast
  - 15+ interactive charts (temperature, precipitation, wind, humidity, UV index, etc.)
  - Real-time weather data from Visual Crossing Weather API

- **Interactive Radar Map**
  - Real historical precipitation data (past 2 hours)
  - RainViewer API integration
  - Animated radar playback with speed controls
  - Time selector for specific frames
  - Screenshot export functionality
  - Storm tracking panel
  - Weather alerts overlay
  - Multiple layers: precipitation, clouds, temperature

- **Location Management**
  - City search with autocomplete
  - Multi-tier geolocation (browser + IP fallback)
  - Coordinates/timezone display
  - Recent search history (localStorage)
  - User favorites with cloud sync (authenticated users)

- **AI-Powered Location Finder**
  - Natural language climate search using Claude Sonnet 4.5
  - Parse queries like "15 degrees cooler from June-October, less humid"
  - Two-step validation system (quick check + full parse)
  - Auto-populates comparison cards with AI recommendations
  - Curated database of 25+ cities with climate characteristics

- **Location Comparison**
  - Side-by-side weather comparison for 2-4 cities
  - Pre-populated with Seattle vs New Smyrna Beach
  - Time range selector (7 days, 1/3/6 months, 1/3/5 years)
  - Smart data aggregation (daily/weekly/monthly averages)
  - Visual comparison charts for temperature, precipitation, wind
  - AI-powered location recommendations

- **10-Year Climate Analysis**
  - Historical weather data from Visual Crossing
  - Climate normals and extremes
  - Long-term trend analysis
  - Monthly climate averages

- **User Authentication**
  - JWT-based authentication system
  - User profile management
  - Cloud-synced favorites across devices
  - Preference synchronization

- **Theme System**
  - Light, dark, and auto modes
  - System preference detection
  - Smooth theme transitions
  - CSS variable-based theming

- **Temperature Units**
  - Global Celsius/Fahrenheit toggle
  - Preference persistence (localStorage/cloud)
  - Real-time conversion across all components

- **Air Quality Monitoring**
  - Live AQI data from OpenWeather
  - Health recommendations based on AQI levels
  - Color-coded AQI indicators

- **Weather Alerts**
  - Real-time severe weather warnings
  - Animated pulsing markers on radar map
  - Color-coded by severity (warnings, watches, advisories)
  - Clickable popups with full alert details

- **Mobile Responsive Design**
  - Fully optimized for all device sizes
  - Touch-friendly controls (44×44px minimum)
  - Adaptive layouts (desktop/tablet/mobile breakpoints)
  - Responsive typography and spacing

### Technical Architecture
- **Frontend:** React 19.2.0 (Create React App)
- **Backend:** Node.js/Express REST API
- **Database:** MySQL 8.0
- **Containerization:** Docker Compose
- **Caching:** Intelligent API caching with TTL
  - Current weather: 30 minutes
  - Forecasts: 6 hours
  - Historical data: 7 days
  - Climate stats: 30 days

- **Rate Limiting:**
  - Maximum 3 concurrent API requests
  - Minimum 100ms interval between requests
  - Exponential backoff retry logic

### API Integrations
- **Visual Crossing Weather API** - Historical data, current conditions, forecasts
- **RainViewer API** - Real-time precipitation radar data
- **OpenWeather API** - Map overlays (clouds, temperature), weather alerts, AQI
- **Anthropic Claude API** - AI-powered natural language processing
- **IP Geolocation APIs** - ipapi.co (primary), geojs.io (fallback)

### Development & Automation
- **GitHub Actions CI/CD**
  - Automated testing on every push
  - Code coverage reporting
  - Deployment automation
  - Security scanning (Gitleaks, Dependabot)

- **Testing Infrastructure**
  - Jest + React Testing Library
  - 476 passing tests
  - 34% code coverage (growing)
  - Coverage thresholds enforced

- **Community Health Files**
  - Issue templates (bug reports, feature requests)
  - Pull request templates
  - Contributing guidelines
  - Code of conduct

### Analytics
- **Matomo Analytics** - Self-hosted, complete data ownership
- **Plausible Analytics** - Privacy-focused, GDPR compliant (beta site)

### Deployment
- **Production Environment:** Hostinger VPS ($6/month)
- **Domains:** meteo-beta.tachyonfuture.com, api.meteo-beta.tachyonfuture.com
- **Reverse Proxy:** Nginx Proxy Manager
- **Zero-Downtime Deployments:** Automated with health checks
- **Monitoring:** Docker container health checks, API rate limit tracking

---

## Release Notes

### Security Notice
After a security audit on October 29-30, 2025, all exposed API keys were rotated and comprehensive security infrastructure was implemented. The application now maintains a 9.4/10 security score with zero known vulnerabilities.

### Breaking Changes
None in current version.

### Upgrade Notes
- If upgrading from a pre-0.1.0 version, ensure all environment variables are set in `.env` files
- Run `npm install` in both frontend and backend directories after pulling updates
- Gitleaks pre-commit hook will activate automatically after cloning (install Gitleaks for local development)

### Known Issues
- Free tier RainViewer API limited to zoom level 10 on radar map
- Browser geolocation may fail on macOS if Location Services disabled (IP fallback works)

---

## Links
- **Repository:** https://github.com/mbuckingham74/meteo-weather
- **Live Demo:** https://meteo-beta.tachyonfuture.com
- **Issues:** https://github.com/mbuckingham74/meteo-weather/issues
- **Security:** https://github.com/mbuckingham74/meteo-weather/security

---

**Legend:**
- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes and security improvements
- `Testing` for testing infrastructure changes
- `Documentation` for documentation updates

---

*Generated and maintained by the Meteo Weather App team*
