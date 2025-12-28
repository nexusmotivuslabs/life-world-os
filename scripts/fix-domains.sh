#!/bin/bash

# Fix Domain Setup Issues
# This script diagnoses and fixes common domain setup problems

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Life World OS - Domain Troubleshooting ===${NC}\n"

# Check Docker
echo -e "${BLUE}1. Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo -e "${YELLOW}   Please start Docker Desktop and try again${NC}\n"
    exit 1
else
    echo -e "${GREEN}✅ Docker is running${NC}\n"
fi

# Check /etc/hosts
echo -e "${BLUE}2. Checking /etc/hosts...${NC}"
if ! grep -q "lifeworld.com" /etc/hosts 2>/dev/null; then
    echo -e "${YELLOW}⚠️  /etc/hosts entries missing${NC}"
    if [ "$EUID" -ne 0 ]; then
        echo -e "${YELLOW}   Run: sudo ./scripts/setup-domains.sh${NC}\n"
    else
        echo -e "${BLUE}   Adding entries...${NC}"
        cat >> /etc/hosts << EOF

# Life World OS Domains
127.0.0.1 localdev.lifeworld.com
127.0.0.1 dev.lifeworld.com
127.0.0.1 staging.lifeworld.com
127.0.0.1 prod.lifeworld.com
EOF
        echo -e "${GREEN}✅ /etc/hosts updated${NC}\n"
    fi
else
    echo -e "${GREEN}✅ /etc/hosts entries found${NC}\n"
fi

# Check environment files
echo -e "${BLUE}3. Checking environment files...${NC}"
cd "$(dirname "$0")/.."

if [ ! -f ".env.prod" ]; then
    echo -e "${YELLOW}⚠️  .env.prod not found, creating from example...${NC}"
    if [ -f "config/environments/prod.env.example" ]; then
        cp config/environments/prod.env.example .env.prod
        echo -e "${GREEN}✅ Created .env.prod${NC}"
        echo -e "${YELLOW}   Please update .env.prod with your production values${NC}\n"
    else
        # Create minimal .env.prod
        cat > .env.prod << EOF
# Production Environment
NODE_ENV=production
PROD_DB_USER=lifeworld_prod
PROD_DB_PASSWORD=CHANGE_IN_PRODUCTION
PROD_DB_NAME=lifeworld_prod
PROD_DATABASE_URL=postgresql://lifeworld_prod:CHANGE_IN_PRODUCTION@postgres-prod:5432/lifeworld_prod
PROD_BACKEND_PORT=3003
PROD_JWT_SECRET=CHANGE_IN_PRODUCTION_MIN_32_CHARACTERS
PROD_JWT_EXPIRES_IN=7d
PROD_API_URL=http://prod.lifeworld.com/api
PROD_FRONTEND_URL=http://prod.lifeworld.com
PROD_LOG_LEVEL=warn
EOF
        echo -e "${GREEN}✅ Created minimal .env.prod${NC}\n"
    fi
else
    echo -e "${GREEN}✅ .env.prod exists${NC}\n"
fi

# Check if services are running
echo -e "${BLUE}4. Checking running services...${NC}"
if docker ps --format "{{.Names}}" | grep -q "life-world-os-nginx"; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx is not running${NC}\n"
    echo -e "${BLUE}5. Starting services...${NC}"
    echo -e "${YELLOW}   This may take a few minutes...${NC}\n"
    
    # Start services
    docker-compose -f docker-compose.domains.yml up -d nginx 2>&1 | head -10
    
    echo -e "\n${BLUE}Waiting for services to be ready...${NC}"
    sleep 5
    
    # Check if nginx started
    if docker ps --format "{{.Names}}" | grep -q "life-world-os-nginx"; then
        echo -e "${GREEN}✅ Nginx started${NC}\n"
    else
        echo -e "${RED}❌ Failed to start nginx${NC}"
        echo -e "${YELLOW}   Check logs: docker logs life-world-os-nginx${NC}\n"
        exit 1
    fi
fi

# Test domain resolution
echo -e "${BLUE}6. Testing domain resolution...${NC}"
if ping -c 1 dev.lifeworld.com > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Domain resolves correctly${NC}\n"
else
    echo -e "${YELLOW}⚠️  Domain may not resolve (this is normal if /etc/hosts wasn't updated)${NC}\n"
fi

# Test HTTP connection
echo -e "${BLUE}7. Testing HTTP connection...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://dev.lifeworld.com/health 2>/dev/null | grep -q "200\|404\|500"; then
    echo -e "${GREEN}✅ HTTP connection works${NC}\n"
else
    echo -e "${YELLOW}⚠️  HTTP connection failed${NC}"
    echo -e "${YELLOW}   This is expected if services aren't fully started${NC}\n"
fi

echo -e "${GREEN}=== Troubleshooting Complete ===${NC}\n"
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Ensure Docker is running"
echo -e "2. Run: ${YELLOW}sudo ./scripts/setup-domains.sh${NC} (if /etc/hosts not updated)"
echo -e "3. Start services: ${YELLOW}docker-compose -f docker-compose.domains.yml up -d${NC}"
echo -e "4. Wait for services to start (30-60 seconds)"
echo -e "5. Test: ${YELLOW}curl http://dev.lifeworld.com/health${NC}\n"

