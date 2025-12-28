#!/bin/bash

# Deploy to Production Environment
# This script builds and deploys the application to production
# Requires: main/master branch, latest tag, or explicit override

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Life World OS - Production Deployment ===${NC}\n"

# Check if we're on main/master branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo -e "${YELLOW}⚠️  Warning: Not on main/master branch (current: ${CURRENT_BRANCH})${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Deployment cancelled${NC}"
        exit 1
    fi
fi

# Get version information
echo -e "${BLUE}Getting version information...${NC}"
VERSION_INFO=$(node scripts/get-version.js prod)
VERSION=$(echo "$VERSION_INFO" | grep -o '"version":"[^"]*' | cut -d'"' -f4)
COMMIT=$(echo "$VERSION_INFO" | grep -o '"commit":"[^"]*' | cut -d'"' -f4)
BRANCH=$(echo "$VERSION_INFO" | grep -o '"branch":"[^"]*' | cut -d'"' -f4)
TAG=$(echo "$VERSION_INFO" | grep -o '"tag":"[^"]*' | cut -d'"' -f4)

echo -e "${GREEN}Version: ${VERSION}${NC}"
echo -e "${GREEN}Commit: ${COMMIT}${NC}"
echo -e "${GREEN}Branch: ${BRANCH}${NC}"
if [ -n "$TAG" ] && [ "$TAG" != "null" ]; then
    echo -e "${GREEN}Tag: ${TAG}${NC}"
fi
echo ""

# Confirm deployment
echo -e "${YELLOW}⚠️  PRODUCTION DEPLOYMENT${NC}"
echo -e "${YELLOW}This will deploy version ${VERSION} to production${NC}"
read -p "Are you sure? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${RED}Deployment cancelled${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if .env.prod exists
if [ ! -f ".env.prod" ]; then
    echo -e "${YELLOW}⚠️  No .env.prod file found${NC}"
    echo -e "${YELLOW}   Creating from .env.prod.example...${NC}"
    if [ -f ".env.prod.example" ]; then
        cp .env.prod.example .env.prod
        echo -e "${GREEN}✅ Created .env.prod${NC}"
        echo -e "${RED}❌ Please update .env.prod with production values before deploying!${NC}"
        exit 1
    else
        echo -e "${RED}❌ .env.prod.example not found${NC}"
        exit 1
    fi
fi

# Load environment variables from .env.prod
if [ -f ".env.prod" ]; then
    set -a
    source .env.prod
    set +a
fi

# Export version for Docker build
export BUILD_VERSION=$VERSION
export BUILD_COMMIT=$COMMIT
export BUILD_BRANCH=$BRANCH
export BUILD_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Build and start services with version tags
echo -e "${BLUE}Building production services with version ${VERSION}...${NC}"
if [ -f "docker-compose.prod.yml" ]; then
    docker-compose -f docker-compose.prod.yml build \
      --build-arg BUILD_VERSION="$VERSION" \
      --build-arg BUILD_COMMIT="$COMMIT" \
      --build-arg BUILD_BRANCH="$BRANCH" \
      --build-arg BUILD_TIMESTAMP="$BUILD_TIMESTAMP"
    
    docker-compose -f docker-compose.prod.yml up -d
else
    echo -e "${YELLOW}⚠️  docker-compose.prod.yml not found${NC}"
    echo -e "${YELLOW}   Production deployment may require cloud provider setup${NC}"
    echo -e "${YELLOW}   See scripts/deploy-cloud.sh for cloud deployments${NC}"
    exit 1
fi

# Wait for services to be healthy
echo -e "${BLUE}Waiting for services to be healthy...${NC}"
sleep 5

# Check backend health
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
        break
    fi
    attempt=$((attempt + 1))
    echo -e "${YELLOW}   Attempt $attempt/$max_attempts...${NC}"
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ Backend failed to become healthy${NC}"
    exit 1
fi

# Run database migrations
echo -e "${BLUE}Running database migrations...${NC}"
# Migration command depends on your setup
# Note: Production databases should NOT be seeded automatically
# Seeding should only be done during initial setup with explicit approval

echo -e "\n${GREEN}✅ Production deployment complete!${NC}\n"
echo -e "${BLUE}Deployment Info:${NC}"
echo -e "  Version:   ${GREEN}${VERSION}${NC}"
echo -e "  Commit:    ${GREEN}${COMMIT}${NC}"
echo -e "  Branch:    ${GREEN}${BRANCH}${NC}"
if [ -n "$TAG" ] && [ "$TAG" != "null" ]; then
    echo -e "  Tag:       ${GREEN}${TAG}${NC}"
fi
echo -e "  Timestamp: ${GREEN}${BUILD_TIMESTAMP}${NC}\n"
echo -e "${BLUE}Services:${NC}"
echo -e "  Backend:  ${GREEN}http://localhost:3000${NC}"
echo -e "  Health:   ${GREEN}http://localhost:3000/health${NC} (shows version)\n"
echo -e "${BLUE}Useful commands:${NC}"
echo -e "  View logs:    ${YELLOW}docker-compose -f docker-compose.prod.yml logs -f${NC}"
echo -e "  Stop:         ${YELLOW}docker-compose -f docker-compose.prod.yml down${NC}"
echo -e "  Check version: ${YELLOW}curl http://localhost:3000/health${NC}"


