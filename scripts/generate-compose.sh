#!/bin/bash

# Generate docker-compose files from template using environment variables
# This ensures all environments have the same structure

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ENVIRONMENT=${1:-dev}

if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}❌ Invalid environment: ${ENVIRONMENT}${NC}"
    echo -e "${YELLOW}   Use: dev, staging, or prod${NC}"
    exit 1
fi

echo -e "${BLUE}=== Generating docker-compose.${ENVIRONMENT}.yml ===${NC}\n"

# Load environment variables
ENV_FILE=".env.${ENVIRONMENT}"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  ${ENV_FILE} not found, using example...${NC}"
    if [ -f "config/environments/${ENVIRONMENT}.env.example" ]; then
        cp "config/environments/${ENVIRONMENT}.env.example" "$ENV_FILE"
        echo -e "${GREEN}✅ Created ${ENV_FILE} from example${NC}"
        echo -e "${YELLOW}   Please update ${ENV_FILE} with your values!${NC}\n"
    else
        echo -e "${RED}❌ config/environments/${ENVIRONMENT}.env.example not found${NC}"
        exit 1
    fi
fi

# Source environment variables
set -a
source "$ENV_FILE"
set +a

# Set environment-specific defaults
if [ "$ENVIRONMENT" = "dev" ]; then
    PREFIX="DEV"
    NETWORK_NAME="life-world-os-dev-network"
    RESTART_POLICY="unless-stopped"
    BACKEND_DOCKERFILE="Dockerfile.dev"
    FRONTEND_DOCKERFILE="Dockerfile.dev"
    BACKEND_COMMAND=""
elif [ "$ENVIRONMENT" = "staging" ]; then
    PREFIX="STAGING"
    NETWORK_NAME="life-world-os-staging-network"
    RESTART_POLICY="unless-stopped"
    BACKEND_DOCKERFILE="Dockerfile.staging"
    FRONTEND_DOCKERFILE="Dockerfile.staging"
    BACKEND_COMMAND="sh -c \"node dist/index.js 2>/dev/null || npx tsx src/index.ts\""
else
    PREFIX="PROD"
    NETWORK_NAME="life-world-os-prod-network"
    RESTART_POLICY="always"
    BACKEND_DOCKERFILE="Dockerfile.prod"
    FRONTEND_DOCKERFILE="Dockerfile.prod"
    BACKEND_COMMAND=""
fi

# Export variables for envsubst
export DB_CONTAINER_NAME="${PREFIX}_DB_CONTAINER_NAME"
export DB_USER="${PREFIX}_DB_USER"
export DB_PASSWORD="${PREFIX}_DB_PASSWORD"
export DB_NAME="${PREFIX}_DB_NAME"
export DB_PORT="${PREFIX}_DB_PORT"
export DB_VOLUME_NAME="postgres_${ENVIRONMENT}_data"
export BACKEND_CONTAINER_NAME="${PREFIX}_BACKEND_CONTAINER_NAME"
export BACKEND_IMAGE_NAME="life-world-os-backend-${ENVIRONMENT}"
export BACKEND_PORT="${PREFIX}_BACKEND_PORT"
export FRONTEND_CONTAINER_NAME="${PREFIX}_FRONTEND_CONTAINER_NAME"
export FRONTEND_IMAGE_NAME="life-world-os-frontend-${ENVIRONMENT}"
export FRONTEND_PORT="${PREFIX}_FRONTEND_PORT"
export API_URL="${PREFIX}_API_URL"
export DATABASE_URL="${PREFIX}_DATABASE_URL"
export JWT_SECRET="${PREFIX}_JWT_SECRET"
export LOG_LEVEL="${PREFIX}_LOG_LEVEL"
export ENV_FILE=".env.${ENVIRONMENT}"
export NODE_ENV="${ENVIRONMENT}"

# Use envsubst to generate the compose file
envsubst < docker-compose.template.yml > "docker-compose.${ENVIRONMENT}.yml"

echo -e "${GREEN}✅ Generated docker-compose.${ENVIRONMENT}.yml${NC}\n"
echo -e "${BLUE}Variables used:${NC}"
echo -e "  Environment: ${GREEN}${ENVIRONMENT}${NC}"
echo -e "  Network: ${GREEN}${NETWORK_NAME}${NC}"
echo -e "  Database: ${GREEN}${DB_USER}@${DB_PORT}${NC}"
echo -e "  Backend: ${GREEN}${BACKEND_PORT}${NC}"
echo -e "  Frontend: ${GREEN}${FRONTEND_PORT}${NC}\n"

