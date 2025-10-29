# Testing & CI/CD Guide

This document describes the automated testing and CI/CD infrastructure for the Meteo Weather App.

## 🧪 Test Coverage

**Current Coverage:** 28%
- **Statements:** 28.11%
- **Branches:** 15.54%
- **Functions:** 23.77%
- **Lines:** 29.18%

**Minimum Thresholds:**
- Statements: 25%
- Branches: 15%
- Functions: 20%
- Lines: 25%

**High Coverage Areas:**
- **Services Layer:** 96.20% average
- **Context Providers:** 92.55% average

## 🚀 Running Tests Locally

### Run all tests
```bash
cd frontend
npm test
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests in CI mode
```bash
npm run test:ci
```

### Run specific test file
```bash
npm test -- --testPathPattern=AuthContext.test
```

## 🤖 CI/CD Automation

### Workflows

#### 1. **CI Workflow** (`.github/workflows/ci.yml`)
Runs on every push and pull request to `main` branch.

**Jobs:**
- **Backend Tests:** Lint and test backend code
- **Frontend Tests:** Full test suite with coverage
- **Docker Build:** Validate Docker images

**Frontend Test Steps:**
1. Install dependencies
2. Run ESLint (if configured)
3. Run tests with coverage collection
4. Check coverage thresholds (fails if below 25%)
5. Upload coverage artifacts (30-day retention)
6. Generate coverage summary in job output
7. Comment on PR with test results
8. Build production bundle

**Coverage Enforcement:**
- ❌ Build fails if coverage drops below thresholds
- ✅ Coverage reports uploaded as artifacts
- 💬 PR comments show coverage breakdown

#### 2. **Coverage Badge Workflow** (`.github/workflows/coverage-badge.yml`)
Runs on push to `main` branch and manual trigger.

**Features:**
- Generates dynamic coverage badge
- Updates badge on every main branch push
- Stores badge in GitHub Gist

**Setup Required:**
To enable dynamic badges, create:
1. Personal Access Token with `gist` scope
2. Create a gist for badge storage
3. Add secrets to repository:
   - `GIST_SECRET`: Personal Access Token
   - `GIST_ID`: ID of the gist

#### 3. **Deploy Workflow** (`.github/workflows/deploy.yml`)
Automated deployment to production server.

## 📊 Test Structure

### Service Layer Tests (96.20% avg coverage)
- `weatherApi.test.js` - 42 tests, 100% coverage
- `authApi.test.js` - 42 tests, 100% coverage
- `radarService.test.js` - 35 tests, 95.91% coverage
- `favoritesService.test.js` - 27 tests, 100% coverage
- `geolocationService.test.js` - Phase 1 tests, 96.51% coverage
- `locationFinderService.test.js` - Phase 1 tests, 100% coverage

### Context Provider Tests (92.55% avg coverage)
- `AuthContext.test.js` - 11 tests, 94.59% coverage
- `ThemeContext.test.jsx` - 14 tests, 97.72% coverage
- `LocationContext.test.jsx` - 17 tests, 100% coverage
- `TemperatureUnitContext.test.jsx` - Phase 1 tests, 73.52% coverage

### Component Tests
- `WeatherAlertsBanner.test.jsx` - 100% coverage
- Additional component tests needed (0% coverage)

### Utility Tests
- `weatherHelpers.test.js` - 92.59% coverage
- `inputSanitizer.test.js` - 88.88% coverage

## 🎯 Coverage Goals

**Phase 1 (Complete):** 13% → Core utilities and helpers
**Phase 2 (Complete):** 23% → Service layer testing
**Phase 3 (Complete):** 28% → Context provider testing
**Phase 4 (Next):** 35-40% → Critical UI components
**Phase 5 (Future):** 50%+ → Comprehensive component coverage

## 🔍 Viewing Test Results

### GitHub Actions
1. Go to repository **Actions** tab
2. Select **CI** workflow
3. View test results in job logs
4. Download coverage artifacts from workflow summary

### Pull Requests
- Automated comment shows coverage breakdown
- Job summary displays coverage table
- Workflow status shows pass/fail

### Locally
```bash
# Generate HTML coverage report
npm run test:coverage

# Open coverage report
open coverage/lcov-report/index.html
```

## 🛠️ Writing Tests

### Test File Naming
- Unit tests: `ComponentName.test.js` or `ComponentName.test.jsx`
- Place tests next to source files
- Example: `AuthContext.js` → `AuthContext.test.js`

### Test Structure
```javascript
describe('Component/Module Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('Feature/Method', () => {
    it('describes expected behavior', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Mocking Guidelines
- Mock external APIs: `jest.mock('../services/apiName')`
- Mock contexts: Use `jest.mock` with factory
- Mock localStorage: Use `jest.spyOn(Storage.prototype, 'getItem')`
- Clean up mocks: `jest.clearAllMocks()` in `beforeEach`

### Best Practices
1. **AAA Pattern:** Arrange, Act, Assert
2. **One assertion per test** (when possible)
3. **Descriptive test names:** "should do X when Y"
4. **Test behavior, not implementation**
5. **Mock external dependencies**
6. **Clean up after tests** (restore mocks, clear timers)

## 🚨 Troubleshooting

### Tests fail locally but pass in CI
- Check Node.js version (CI uses 20.x)
- Ensure all dependencies installed: `npm install`
- Clear Jest cache: `npm test -- --clearCache`

### Coverage below threshold
- Run `npm run test:coverage` to see uncovered lines
- Focus on critical paths first (services, contexts)
- Aim for 80%+ on infrastructure, lower on UI

### Flaky tests
- Use `waitFor` for async operations
- Mock timers with `jest.useFakeTimers()`
- Avoid hard-coded timeouts
- Clean up mocks and state

### Memory leaks in tests
- Clear timers: `jest.useRealTimers()` after fake timers
- Restore mocks: Use `afterEach(() => jest.restoreAllMocks())`
- Unmount components: `unmount()` from render result

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Coverage Thresholds](https://jestjs.io/docs/configuration#coveragethreshold-object)
