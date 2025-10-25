# Deployment Guide

This guide explains how to safely manage API keys and deploy the Meteo App.

## 🔐 Security: Managing API Keys

### ⚠️ NEVER commit API keys to Git

Your `.env` file is already in `.gitignore` to prevent accidental commits.

### Local Development Setup

1. **Copy the example environment file:**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Add your API key to `backend/.env`:**
   ```bash
   VISUAL_CROSSING_API_KEY=your_actual_key_here
   DB_PASSWORD=your_mysql_password
   ```

3. **Verify `.env` is not tracked:**
   ```bash
   git status
   # Should NOT show backend/.env
   ```

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended for POC)

Docker Compose will read environment variables from your shell or a `.env` file in the project root.

1. **Create a `.env` file in the project root** (same level as docker-compose.yml):
   ```bash
   # .env (project root)
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=meteo_app
   VISUAL_CROSSING_API_KEY=your_api_key_here
   ```

2. **Start the application:**
   ```bash
   docker-compose up -d
   ```

3. **Verify environment variables are loaded:**
   ```bash
   docker exec meteo-backend env | grep VISUAL_CROSSING
   ```

### Option 2: GitHub Secrets (for CI/CD)

If you set up GitHub Actions for deployment:

1. **Go to your repository on GitHub:**
   - Navigate to `Settings` → `Secrets and variables` → `Actions`

2. **Add Repository Secrets:**
   - Click `New repository secret`
   - Name: `VISUAL_CROSSING_API_KEY`
   - Value: `BTU88L6G4NBB69QRDGJ7UJEVQ`
   - Click `Add secret`

3. **Repeat for other secrets:**
   - `DB_PASSWORD`
   - Any other sensitive values

4. **Use in GitHub Actions workflow** (.github/workflows/deploy.yml):
   ```yaml
   env:
     VISUAL_CROSSING_API_KEY: ${{ secrets.VISUAL_CROSSING_API_KEY }}
     DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
   ```

### Option 3: Cloud Platform Environment Variables

#### Heroku
```bash
heroku config:set VISUAL_CROSSING_API_KEY=your_key_here
heroku config:set DB_PASSWORD=your_password_here
```

#### AWS (Elastic Beanstalk)
```bash
aws elasticbeanstalk set-environment \
  --environment-name meteo-app-env \
  --option-settings \
    Namespace=aws:elasticbeanstalk:application:environment,\
    OptionName=VISUAL_CROSSING_API_KEY,Value=your_key_here
```

#### DigitalOcean App Platform
Add environment variables in the App Platform console under `Settings` → `App-Level Environment Variables`

#### Vercel
```bash
vercel env add VISUAL_CROSSING_API_KEY
# Enter your key when prompted
```

## 🔄 Updating Environment Variables

### Local Development
Just edit `backend/.env` and restart your server:
```bash
docker-compose restart backend
# or
cd backend && npm run dev
```

### Production
1. Update the secret in your deployment platform
2. Restart the application to load new values

## 📋 Environment Variables Checklist

Before deploying, ensure these are set:

### Required
- ✅ `VISUAL_CROSSING_API_KEY` - Your Visual Crossing API key
- ✅ `DB_PASSWORD` - MySQL database password

### Optional (have defaults)
- `PORT` - Backend server port (default: 5001)
- `NODE_ENV` - Environment (default: development)
- `DB_HOST` - Database host (default: mysql for Docker, localhost for local)
- `DB_PORT` - Database port (default: 3306)
- `DB_USER` - Database user (default: root)
- `DB_NAME` - Database name (default: meteo_app)

## 🧪 Testing Your Setup

1. **Verify environment variables are loaded:**
   ```bash
   # Inside backend container
   docker exec meteo-backend node -e "console.log(process.env.VISUAL_CROSSING_API_KEY)"
   ```

2. **Check the health endpoint:**
   ```bash
   curl http://localhost:5001/api/health
   # Should return: {"status":"ok","database":"connected",...}
   ```

3. **Test database connection:**
   ```bash
   cd backend
   npm run db:init
   ```

## 🆘 Troubleshooting

### API Key Not Working
- Verify the key is in `backend/.env` (for local) or environment variables (for Docker)
- Check for extra spaces or quotes around the key
- Restart your server/container after changing .env

### Database Connection Failed
- Ensure MySQL container is running: `docker ps | grep mysql`
- Verify `DB_PASSWORD` is correct
- Check `DB_HOST` is set to `mysql` (in Docker) or `localhost` (local)

### Changes to .env Not Reflected
- Restart the backend: `docker-compose restart backend`
- For docker-compose, you may need: `docker-compose down && docker-compose up`

## 📦 Production Deployment Checklist

- [ ] All secrets are stored in environment variables (not in code)
- [ ] `.env` files are in `.gitignore`
- [ ] Database backups are configured
- [ ] API rate limits are monitored
- [ ] Error logging is configured
- [ ] HTTPS is enabled
- [ ] CORS is properly configured for your domain
- [ ] Database connection pooling is optimized
- [ ] API response caching is enabled

## 🔒 Security Best Practices

1. **Never commit secrets to Git**
   - Always use `.gitignore` for `.env` files
   - Use `.env.example` as a template (without real values)

2. **Rotate API keys periodically**
   - Visual Crossing: Generate new keys every few months
   - Update in all deployment environments

3. **Use different keys for different environments**
   - Development: One API key
   - Production: Different API key
   - This helps track usage and limit exposure

4. **Monitor API usage**
   - Check Visual Crossing dashboard for unusual activity
   - Set up alerts for quota limits

5. **Principle of least privilege**
   - Database users should have minimal required permissions
   - Consider read-only replicas for reporting queries
