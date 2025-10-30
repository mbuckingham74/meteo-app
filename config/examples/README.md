# Configuration Examples

This directory contains example configuration files with placeholder values. **Never commit actual API keys or secrets!**

## Files

### `.env.backend.example`
Backend environment variables template. Copy this to `backend/.env` and fill in your actual values:
```bash
cp config/examples/.env.backend.example backend/.env
```

### `.env.frontend.example`
Frontend environment variables template. Copy this to `frontend/.env` and fill in your actual values:
```bash
cp config/examples/.env.frontend.example frontend/.env
```

### `.env.production.example`
Production environment variables template. Copy this to root `.env.production` for production deployments:
```bash
cp config/examples/.env.production.example .env.production
```

## Security Best Practices

- ✅ **DO** keep these example files in version control with placeholder values
- ✅ **DO** update these templates when adding new environment variables
- ❌ **DON'T** put real API keys or secrets in these files
- ❌ **DON'T** commit actual `.env` files (they're gitignored)

## Getting API Keys

See the main [README.md](../../README.md) for instructions on obtaining API keys for:
- OpenWeather API
- Visual Crossing Weather API
- Anthropic Claude API
