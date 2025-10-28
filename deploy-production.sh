#!/bin/bash

# Meteo App - Production Deployment Script
# Run this script on your production server after cloning the repository

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Meteo App - Production Deployment               ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}\n"

# Step 1: Check if .env.production exists
echo -e "${YELLOW}[1/6] Checking environment configuration...${NC}"
if [ ! -f ".env.production" ]; then
    echo -e "${RED}✗ .env.production not found!${NC}"
    echo -e "${YELLOW}Creating from template...${NC}"
    cp .env.production.example .env.production
    echo -e "${YELLOW}⚠️  Please edit .env.production with your actual values:${NC}"
    echo "   - Database passwords"
    echo "   - API keys"
    echo "   - JWT secret"
    echo ""
    echo "Generate secure values:"
    echo "  DB passwords:  openssl rand -base64 32"
    echo "  JWT secret:    openssl rand -hex 32"
    echo ""
    read -p "Press Enter after editing .env.production..."
else
    echo -e "${GREEN}✓ .env.production found${NC}"
fi

# Step 2: Verify NPM network
echo -e "\n${YELLOW}[2/6] Verifying NPM network...${NC}"
if ! docker network ls | grep -q "npm_network"; then
    echo -e "${YELLOW}Creating npm_network...${NC}"
    docker network create npm_network
    echo -e "${GREEN}✓ npm_network created${NC}"
else
    echo -e "${GREEN}✓ npm_network exists${NC}"
fi

# Step 3: Stop existing containers (if any)
echo -e "\n${YELLOW}[3/6] Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
echo -e "${GREEN}✓ Existing containers stopped${NC}"

# Step 4: Build and start production stack
echo -e "\n${YELLOW}[4/6] Building and starting production stack...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be healthy (may take 30-60 seconds)...${NC}"
sleep 10

# Step 5: Check container health
echo -e "\n${YELLOW}[5/6] Checking container health...${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep meteo

# Test backend health
echo -e "\n${YELLOW}Testing backend health endpoint...${NC}"
if docker exec meteo-backend-prod wget -qO- http://localhost:5001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    echo "Check logs: docker logs meteo-backend-prod"
fi

# Step 6: Configure NPM
echo -e "\n${YELLOW}[6/6] Configuring Nginx Proxy Manager...${NC}"
echo -e "${YELLOW}You can run NPM configuration in two ways:${NC}\n"

echo "Option A - Automated (recommended):"
echo "  NPM_EMAIL=\"your_npm_email@example.com\" \\"
echo "  NPM_PASSWORD=\"your_npm_password_here\" \\"
echo "  NPM_API_URL=\"http://localhost:81/api\" \\"
echo "  ./scripts/configure-npm.sh"
echo ""
echo "Option B - Manual GUI:"
echo "  Follow steps in DEPLOYMENT.md section 5, Option B"
echo ""

read -p "Do you want to run NPM configuration now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Running NPM configuration...${NC}"
    if [ -z "$NPM_EMAIL" ] || [ -z "$NPM_PASSWORD" ]; then
        echo -e "${RED}✗ NPM_EMAIL and NPM_PASSWORD environment variables must be set${NC}"
        echo "Example: NPM_EMAIL=\"your@email.com\" NPM_PASSWORD=\"your_password\" ./deploy-production.sh"
        exit 1
    fi
    NPM_API_URL="http://localhost:81/api" \
    ./scripts/configure-npm.sh
fi

# Summary
echo -e "\n${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Deployment Complete!                             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}Service URLs:${NC}"
echo "  Frontend:  https://meteo-app.tachyonfuture.com"
echo "  API:       https://api.meteo-app.tachyonfuture.com/api/health"
echo ""

echo -e "${BLUE}Useful Commands:${NC}"
echo "  View logs:        docker-compose -f docker-compose.prod.yml logs -f"
echo "  Restart services: docker-compose -f docker-compose.prod.yml restart"
echo "  Stop services:    docker-compose -f docker-compose.prod.yml down"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Wait 2-5 minutes for SSL certificates to be issued"
echo "  2. Test the deployment:"
echo "     curl https://api.meteo-app.tachyonfuture.com/api/health"
echo "  3. Open https://meteo-app.tachyonfuture.com in your browser"
echo ""
