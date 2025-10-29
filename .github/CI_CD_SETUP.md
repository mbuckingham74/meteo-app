# CI/CD Setup Quick Reference

## ✅ What's Automated

### On Every Push & PR to `main`:
1. ✅ Run all 311 tests
2. ✅ Generate coverage report (must be ≥25%)
3. ✅ Upload coverage artifacts
4. ✅ Comment on PRs with test results
5. ✅ Fail build if tests fail or coverage drops
6. ✅ Build frontend to verify no build errors
7. ✅ Validate Docker images

### On Push to `main` Only:
- 🎯 Update coverage badge (requires setup)
- 🚀 Deploy to production (manual trigger)

## 🎯 Coverage Thresholds

**Current:** 28%
**Minimum Required:** 25%

| Metric | Threshold | Current |
|--------|-----------|---------|
| Statements | 25% | 28.11% ✅ |
| Branches | 15% | 15.54% ✅ |
| Functions | 20% | 23.77% ✅ |
| Lines | 25% | 29.18% ✅ |

## 🚀 Testing Your Changes

### Before pushing:
```bash
cd frontend

# Run tests locally
npm test

# Check coverage
npm run test:coverage

# Run CI-style tests
npm run test:ci
```

### After pushing:
1. Go to **Actions** tab on GitHub
2. Find your commit's workflow run
3. View test results and coverage
4. Download coverage artifacts if needed

## 📝 PR Comments

Every PR automatically receives a comment with:
- Coverage breakdown (statements, branches, functions, lines)
- Pass/fail status vs threshold
- ⚠️ Warning if coverage is below minimum

## 🎨 Coverage Badge (Optional Setup)

To enable dynamic coverage badges:

### 1. Create Personal Access Token
- Go to GitHub Settings → Developer settings → Personal access tokens
- Generate new token with `gist` scope
- Copy the token

### 2. Create Gist for Badge
- Go to https://gist.github.com
- Create a new gist (can be private)
- File name: `meteo-coverage-badge.json`
- Content: `{}`
- Copy the gist ID from URL

### 3. Add Repository Secrets
- Go to Repository Settings → Secrets and variables → Actions
- Add secrets:
  - `GIST_SECRET`: Your personal access token
  - `GIST_ID`: The gist ID

### 4. Enable Workflow
- Workflow is already configured in `.github/workflows/coverage-badge.yml`
- Will run automatically on next push to main

### 5. Add Badge to README
```markdown
![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/YOUR_USERNAME/GIST_ID/raw/meteo-coverage-badge.json)
```

## 🔧 Modifying Thresholds

To change coverage requirements:

**Option 1:** Edit `frontend/package.json`
```json
"jest": {
  "coverageThreshold": {
    "global": {
      "statements": 30,  // Increase to 30%
      "branches": 20,
      "functions": 25,
      "lines": 30
    }
  }
}
```

**Option 2:** Edit `.github/workflows/ci.yml`
```yaml
# Change THRESHOLD variable
THRESHOLD=30  # Increase to 30%
```

**Recommendation:** Keep both in sync!

## 📊 Viewing Coverage Reports

### In GitHub Actions:
1. Go to workflow run
2. Scroll to **Artifacts** section
3. Download `coverage-report`
4. Extract and open `index.html`

### Locally:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## 🚨 What Causes Build Failures?

1. **Test failures** - Any test that fails
2. **Coverage drop** - Coverage below 25%
3. **Build errors** - Frontend build fails
4. **Linting errors** - ESLint failures (if configured)

## 🛠️ Troubleshooting

### Build failing on GitHub but passing locally?
- Check Node.js version (CI uses 20.x)
- Look for environment-specific issues
- Check CI logs for detailed error messages

### Coverage threshold errors?
- Run `npm run test:coverage` locally
- Identify uncovered files
- Add tests to increase coverage
- Or temporarily lower threshold if justified

### PR comments not appearing?
- Check workflow permissions in repo settings
- Verify `issues: write` permission
- Check if GitHub Actions has access to PR

## 📚 Related Documentation

- Full testing guide: [.github/TESTING.md](.github/TESTING.md)
- Workflow files:
  - `.github/workflows/ci.yml` - Main CI
  - `.github/workflows/coverage-badge.yml` - Badge generation
  - `.github/workflows/deploy.yml` - Deployment

## 🎉 What You Get

✅ **Automated test runs** on every code change
✅ **Coverage enforcement** prevents quality regression
✅ **Visible quality metrics** on every PR
✅ **Fast feedback loop** (~2-3 minutes)
✅ **Confidence in deployments** - tests must pass first
✅ **Historical coverage tracking** via artifacts
✅ **Team awareness** via PR comments
