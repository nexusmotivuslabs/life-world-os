#!/bin/bash

# Cloud Deployment Script
# Supports multiple cloud providers: AWS, GCP, Azure, DigitalOcean, Railway, Render

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ENVIRONMENT=${1:-staging}
CLOUD_PROVIDER=${2:-docker}

echo -e "${BLUE}=== Life World OS - Cloud Deployment ===${NC}\n"
echo -e "${BLUE}Environment: ${GREEN}${ENVIRONMENT}${NC}"
echo -e "${BLUE}Cloud Provider: ${GREEN}${CLOUD_PROVIDER}${NC}\n"

# Get version information
echo -e "${BLUE}Getting version information...${NC}"
VERSION_INFO=$(node scripts/get-version.js "$ENVIRONMENT")
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

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}❌ Invalid environment: ${ENVIRONMENT}${NC}"
    echo -e "${YELLOW}   Use: dev, staging, or prod${NC}"
    exit 1
fi

# Load environment-specific config
ENV_FILE="config/environments/${ENVIRONMENT}.env"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  No ${ENVIRONMENT}.env file found${NC}"
    echo -e "${YELLOW}   Creating from example...${NC}"
    if [ -f "${ENV_FILE}.example" ]; then
        cp "${ENV_FILE}.example" "$ENV_FILE"
        echo -e "${GREEN}✅ Created ${ENV_FILE}${NC}"
        echo -e "${YELLOW}   Please update with your values!${NC}\n"
    else
        echo -e "${RED}❌ ${ENV_FILE}.example not found${NC}"
        exit 1
    fi
fi

# Export environment variables
set -a
source "$ENV_FILE"
set +a

# Deploy based on cloud provider
case "$CLOUD_PROVIDER" in
    docker)
        echo -e "${BLUE}Deploying with Docker Compose (version ${VERSION})...${NC}"
        docker-compose -f "docker-compose.${ENVIRONMENT}.yml" build \
          --build-arg BUILD_VERSION="$VERSION" \
          --build-arg BUILD_COMMIT="$COMMIT" \
          --build-arg BUILD_BRANCH="$BRANCH" \
          --build-arg BUILD_TIMESTAMP="$BUILD_TIMESTAMP"
        docker-compose -f "docker-compose.${ENVIRONMENT}.yml" up -d
        ;;
    aws)
        echo -e "${BLUE}Deploying to AWS...${NC}"
        ./scripts/deploy-aws.sh "$ENVIRONMENT"
        ;;
    gcp)
        echo -e "${BLUE}Deploying to GCP...${NC}"
        ./scripts/deploy-gcp.sh "$ENVIRONMENT"
        ;;
    azure)
        echo -e "${BLUE}Deploying to Azure...${NC}"
        ./scripts/deploy-azure.sh "$ENVIRONMENT"
        ;;
    digitalocean)
        echo -e "${BLUE}Deploying to DigitalOcean...${NC}"
        ./scripts/deploy-digitalocean.sh "$ENVIRONMENT"
        ;;
    railway)
        echo -e "${BLUE}Deploying to Railway...${NC}"
        ./scripts/deploy-railway.sh "$ENVIRONMENT"
        ;;
    render)
        echo -e "${BLUE}Deploying to Render...${NC}"
        ./scripts/deploy-render.sh "$ENVIRONMENT"
        ;;
    *)
        echo -e "${RED}❌ Unknown cloud provider: ${CLOUD_PROVIDER}${NC}"
        echo -e "${YELLOW}   Supported: docker, aws, gcp, azure, digitalocean, railway, render${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}✅ Deployment initiated!${NC}\n"
echo -e "${BLUE}Deployment Info:${NC}"
echo -e "  Version:   ${GREEN}${VERSION}${NC}"
echo -e "  Commit:    ${GREEN}${COMMIT}${NC}"
echo -e "  Branch:    ${GREEN}${BRANCH}${NC}"
echo -e "  Timestamp: ${GREEN}${BUILD_TIMESTAMP}${NC}\n"

