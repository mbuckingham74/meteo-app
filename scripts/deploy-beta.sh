#!/bin/bash
# Deployment script for beta.meteo-app
# Ensures environment variables are properly loaded during build

set -e  # Exit on error

echo "🚀 Deploying to beta.meteo-app..."
echo ""

# Navigate to app directory
cd /home/michael/meteo-app || exit 1

# Pull latest code
echo "📥 Pulling latest code..."
git fetch origin
git reset --hard origin/main
echo "✅ Code updated to: $(git log -1 --oneline)"
echo ""

# Load environment variables
echo "🔐 Loading environment variables..."
export $(cat .env.production | grep -v "^#" | xargs)
echo "✅ Environment variables loaded"
echo ""

# Build frontend with environment variables
echo "🏗️  Building frontend..."
OPENWEATHER_API_KEY=$OPENWEATHER_API_KEY \
  docker compose -f docker-compose.prod.yml build --no-cache frontend
echo "✅ Frontend built"
echo ""

# Restart all services
echo "🔄 Restarting services..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
echo "✅ Services restarted"
echo ""

# Wait for containers to be ready
echo "⏳ Waiting for containers..."
sleep 5

# Verify deployment
echo "🔍 Verifying deployment..."
API_KEY_COUNT=$(docker exec meteo-frontend-prod sh -c "grep -c '3a07acbb151700c9b78cc25218578d5c' /usr/share/nginx/html/static/js/main.*.js 2>/dev/null" || echo "0")

if [ "$API_KEY_COUNT" -gt 0 ]; then
  echo "✅ OpenWeather API key found in bundle"
else
  echo "❌ WARNING: OpenWeather API key NOT found in bundle!"
fi

# Show container status
echo ""
echo "📊 Container status:"
docker ps | grep meteo

echo ""
echo "✅ Deployment complete!"
echo "🌐 Site: https://meteo-beta.tachyonfuture.com"
