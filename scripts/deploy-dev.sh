#!/bin/bash

# Deploy to Dev Environment
# This script builds and deploys the application to a development environment

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Life World OS - Dev Deployment ===${NC}\n"

# Get version information
echo -e "${BLUE}Getting version information...${NC}"
VERSION_INFO=$(node scripts/get-version.js dev)
VERSION=$(echo "$VERSION_INFO" | grep -o '"version":"[^"]*' | cut -d'"' -f4)
COMMIT=$(echo "$VERSION_INFO" | grep -o '"commit":"[^"]*' | cut -d'"' -f4)
BRANCH=$(echo "$VERSION_INFO" | grep -o '"branch":"[^"]*' | cut -d'"' -f4)

echo -e "${GREEN}Version: ${VERSION}${NC}"
echo -e "${GREEN}Commit: ${COMMIT}${NC}"
echo -e "${GREEN}Branch: ${BRANCH}${NC}\n"

# Export version for Docker build
export BUILD_VERSION=$VERSION
export BUILD_COMMIT=$COMMIT
export BUILD_BRANCH=$BRANCH
export BUILD_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if .env.dev exists
if [ ! -f ".env.dev" ]; then
    echo -e "${YELLOW}⚠️  No .env.dev file found${NC}"
    echo -e "${YELLOW}   Creating from .env.dev.example...${NC}"
    if [ -f "config/environments/dev.env.example" ]; then
        cp config/environments/dev.env.example .env.dev
        echo -e "${GREEN}✅ Created .env.dev${NC}"
        echo -e "${YELLOW}   Please update .env.dev with your values!${NC}\n"
    else
        echo -e "${RED}❌ config/environments/dev.env.example not found${NC}"
        exit 1
    fi
fi

# Load environment variables from .env.dev
if [ -f ".env.dev" ]; then
    set -a
    source .env.dev
    set +a
fi

# Stop existing dev containers
echo -e "${BLUE}Stopping existing dev containers...${NC}"
docker-compose -f docker-compose.dev.yml down 2>/dev/null || true

# Build and start services with version tags
echo -e "${BLUE}Building and starting dev services with version ${VERSION}...${NC}"
docker-compose -f docker-compose.dev.yml build \
  --build-arg BUILD_VERSION="$VERSION" \
  --build-arg BUILD_COMMIT="$COMMIT" \
  --build-arg BUILD_BRANCH="$BRANCH" \
  --build-arg BUILD_TIMESTAMP="$BUILD_TIMESTAMP"

docker-compose -f docker-compose.dev.yml up -d

# Wait for database to be ready
echo -e "${BLUE}Waiting for database to be ready...${NC}"
sleep 5

# Wait for backend to be healthy
echo -e "${BLUE}Waiting for backend to be healthy...${NC}"
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker exec life-world-os-backend-dev wget --quiet --tries=1 --spider http://localhost:3001/health 2>/dev/null; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
        break
    fi
    attempt=$((attempt + 1))
    echo -e "${YELLOW}   Attempt $attempt/$max_attempts...${NC}"
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ Backend failed to become healthy${NC}"
    echo -e "${YELLOW}   Check logs: docker-compose -f docker-compose.dev.yml logs backend-dev${NC}"
    exit 1
fi

# Run database migrations
echo -e "${BLUE}Running database migrations...${NC}"
docker exec life-world-os-backend-dev npx prisma migrate deploy || {
    echo -e "${YELLOW}⚠️  Migrations may have already been applied${NC}"
}

# Seed database (dev environment - seeding is enabled)
echo -e "${BLUE}Seeding database...${NC}"
docker exec life-world-os-backend-dev npm run seed:dev || {
    echo -e "${YELLOW}⚠️  Seeding failed or already completed${NC}"
}

echo -e "\n${GREEN}✅ Dev deployment complete!${NC}\n"
echo -e "${BLUE}Deployment Info:${NC}"
echo -e "  Version:   ${GREEN}${VERSION}${NC}"
echo -e "  Commit:    ${GREEN}${COMMIT}${NC}"
echo -e "  Branch:    ${GREEN}${BRANCH}${NC}"
echo -e "  Timestamp: ${GREEN}${BUILD_TIMESTAMP}${NC}\n"
echo -e "${BLUE}Services:${NC}"
echo -e "  Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "  Backend:  ${GREEN}http://localhost:3001${NC}"
echo -e "  Database: ${GREEN}localhost:5433${NC}"
echo -e "  Health:   ${GREEN}http://localhost:3001/health${NC} (shows version)\n"
echo -e "${BLUE}Useful commands:${NC}"
echo -e "  View logs:    ${YELLOW}docker-compose -f docker-compose.dev.yml logs -f${NC}"
echo -e "  Stop:         ${YELLOW}docker-compose -f docker-compose.dev.yml down${NC}"
echo -e "  Restart:      ${YELLOW}docker-compose -f docker-compose.dev.yml restart${NC}"
echo -e "  Check version: ${YELLOW}curl http://localhost:3001/health${NC}"

