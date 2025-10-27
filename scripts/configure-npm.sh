#!/bin/bash

# NPM (Nginx Proxy Manager) Configuration Script
# This script configures proxy hosts via the NPM API

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NPM_API_URL="${NPM_API_URL:-http://localhost:81/api}"
DOMAIN="meteo-app.tachyonfuture.com"
API_DOMAIN="api.meteo-app.tachyonfuture.com"

# Check if required environment variables are set
if [ -z "$NPM_EMAIL" ] || [ -z "$NPM_PASSWORD" ]; then
    echo -e "${RED}Error: NPM_EMAIL and NPM_PASSWORD environment variables must be set${NC}"
    echo "Usage: NPM_EMAIL=admin@example.com NPM_PASSWORD=yourpassword ./configure-npm.sh"
    exit 1
fi

echo -e "${GREEN}=== Nginx Proxy Manager Configuration ===${NC}\n"

# Step 1: Authenticate and get token
echo -e "${YELLOW}Step 1: Authenticating with NPM...${NC}"
TOKEN_RESPONSE=$(curl -s -X POST "${NPM_API_URL}/tokens" \
  -H "Content-Type: application/json" \
  -d "{\"identity\":\"${NPM_EMAIL}\",\"secret\":\"${NPM_PASSWORD}\"}")

TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to authenticate with NPM${NC}"
    echo "Response: $TOKEN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Authentication successful${NC}\n"

# Step 2: Create Frontend Proxy Host
echo -e "${YELLOW}Step 2: Creating frontend proxy host (${DOMAIN})...${NC}"

FRONTEND_PAYLOAD=$(cat <<EOF
{
  "domain_names": ["${DOMAIN}"],
  "forward_scheme": "http",
  "forward_host": "meteo-frontend-prod",
  "forward_port": 80,
  "access_list_id": 0,
  "certificate_id": 0,
  "ssl_forced": false,
  "caching_enabled": true,
  "block_exploits": true,
  "advanced_config": "",
  "meta": {
    "letsencrypt_agree": true,
    "dns_challenge": false
  },
  "allow_websocket_upgrade": false,
  "http2_support": true,
  "hsts_enabled": true,
  "hsts_subdomains": false
}
EOF
)

FRONTEND_RESPONSE=$(curl -s -X POST "${NPM_API_URL}/nginx/proxy-hosts" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$FRONTEND_PAYLOAD")

FRONTEND_ID=$(echo "$FRONTEND_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$FRONTEND_ID" ]; then
    echo -e "${RED}Failed to create frontend proxy host${NC}"
    echo "Response: $FRONTEND_RESPONSE"
else
    echo -e "${GREEN}✓ Frontend proxy host created (ID: ${FRONTEND_ID})${NC}"
fi

# Step 3: Create Backend API Proxy Host
echo -e "\n${YELLOW}Step 3: Creating backend API proxy host (${API_DOMAIN})...${NC}"

BACKEND_PAYLOAD=$(cat <<EOF
{
  "domain_names": ["${API_DOMAIN}"],
  "forward_scheme": "http",
  "forward_host": "meteo-backend-prod",
  "forward_port": 5001,
  "access_list_id": 0,
  "certificate_id": 0,
  "ssl_forced": false,
  "caching_enabled": false,
  "block_exploits": true,
  "advanced_config": "",
  "meta": {
    "letsencrypt_agree": true,
    "dns_challenge": false
  },
  "allow_websocket_upgrade": false,
  "http2_support": true,
  "hsts_enabled": true,
  "hsts_subdomains": false
}
EOF
)

BACKEND_RESPONSE=$(curl -s -X POST "${NPM_API_URL}/nginx/proxy-hosts" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$BACKEND_PAYLOAD")

BACKEND_ID=$(echo "$BACKEND_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$BACKEND_ID" ]; then
    echo -e "${RED}Failed to create backend proxy host${NC}"
    echo "Response: $BACKEND_RESPONSE"
else
    echo -e "${GREEN}✓ Backend API proxy host created (ID: ${BACKEND_ID})${NC}"
fi

# Step 4: Request SSL certificates
if [ -n "$FRONTEND_ID" ]; then
    echo -e "\n${YELLOW}Step 4: Requesting SSL certificate for frontend...${NC}"

    SSL_PAYLOAD=$(cat <<EOF
{
  "provider": "letsencrypt",
  "nice_name": "${DOMAIN}",
  "domain_names": ["${DOMAIN}"],
  "meta": {
    "letsencrypt_email": "${NPM_EMAIL}",
    "letsencrypt_agree": true,
    "dns_challenge": false
  }
}
EOF
)

    SSL_RESPONSE=$(curl -s -X POST "${NPM_API_URL}/nginx/certificates" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d "$SSL_PAYLOAD")

    CERT_ID=$(echo "$SSL_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

    if [ -n "$CERT_ID" ]; then
        echo -e "${GREEN}✓ SSL certificate requested (ID: ${CERT_ID})${NC}"

        # Update proxy host with SSL certificate
        UPDATE_PAYLOAD=$(cat <<EOF
{
  "certificate_id": ${CERT_ID},
  "ssl_forced": true,
  "hsts_enabled": true,
  "hsts_subdomains": false
}
EOF
)

        curl -s -X PATCH "${NPM_API_URL}/nginx/proxy-hosts/${FRONTEND_ID}" \
          -H "Authorization: Bearer ${TOKEN}" \
          -H "Content-Type: application/json" \
          -d "$UPDATE_PAYLOAD" > /dev/null

        echo -e "${GREEN}✓ SSL enabled for frontend${NC}"
    fi
fi

if [ -n "$BACKEND_ID" ]; then
    echo -e "\n${YELLOW}Step 5: Requesting SSL certificate for API...${NC}"

    API_SSL_PAYLOAD=$(cat <<EOF
{
  "provider": "letsencrypt",
  "nice_name": "${API_DOMAIN}",
  "domain_names": ["${API_DOMAIN}"],
  "meta": {
    "letsencrypt_email": "${NPM_EMAIL}",
    "letsencrypt_agree": true,
    "dns_challenge": false
  }
}
EOF
)

    API_SSL_RESPONSE=$(curl -s -X POST "${NPM_API_URL}/nginx/certificates" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d "$API_SSL_PAYLOAD")

    API_CERT_ID=$(echo "$API_SSL_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

    if [ -n "$API_CERT_ID" ]; then
        echo -e "${GREEN}✓ API SSL certificate requested (ID: ${API_CERT_ID})${NC}"

        # Update API proxy host with SSL certificate
        API_UPDATE_PAYLOAD=$(cat <<EOF
{
  "certificate_id": ${API_CERT_ID},
  "ssl_forced": true,
  "hsts_enabled": true,
  "hsts_subdomains": false
}
EOF
)

        curl -s -X PATCH "${NPM_API_URL}/nginx/proxy-hosts/${BACKEND_ID}" \
          -H "Authorization: Bearer ${TOKEN}" \
          -H "Content-Type: application/json" \
          -d "$API_UPDATE_PAYLOAD" > /dev/null

        echo -e "${GREEN}✓ SSL enabled for API${NC}"
    fi
fi

echo -e "\n${GREEN}=== Configuration Complete ===${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Verify DNS records:"
echo "   - ${DOMAIN} → Your server IP"
echo "   - ${API_DOMAIN} → Your server IP"
echo "2. Wait a few minutes for SSL certificates to be issued"
echo "3. Test your deployment:"
echo "   - https://${DOMAIN}"
echo "   - https://${API_DOMAIN}/api/health"
echo ""
