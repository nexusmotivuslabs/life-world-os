#!/bin/bash

# Seed Staging Database
# This script seeds the staging database with initial data
# Note: Seeding is NOT run automatically on container startup
# Run this script when:
#   - Setting up a new staging environment
#   - After resetting the database (docker-compose -f docker-compose.staging.yml down -v)
#   - When you see "Data Connection Issue" in the frontend

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Life World OS - Seed Staging Database ===${NC}\n"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if staging backend container is running
if ! docker ps --format '{{.Names}}' | grep -q "life-world-os-backend-staging"; then
    echo -e "${YELLOW}⚠️  Staging backend container is not running${NC}"
    echo -e "${YELLOW}   Starting staging environment...${NC}"
    cd "$(dirname "$0")/.."
    docker-compose -f docker-compose.staging.yml up -d
    echo -e "${BLUE}   Waiting for services to be ready...${NC}"
    sleep 15
fi

CONTAINER_NAME="life-world-os-backend-staging"

echo -e "${BLUE}Running seed script in ${CONTAINER_NAME}...${NC}\n"

# Check if container exists
if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}❌ Container ${CONTAINER_NAME} not found${NC}"
    echo -e "${YELLOW}   Please deploy staging first:${NC}"
    echo -e "${YELLOW}   npm run deploy:staging${NC}"
    exit 1
fi

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}⚠️  Container ${CONTAINER_NAME} is not running. Starting it...${NC}"
    docker start ${CONTAINER_NAME}
    sleep 5
fi

# Run seed command
echo -e "${BLUE}Executing seed script...${NC}"
if docker exec ${CONTAINER_NAME} npm run seed; then
    echo -e "\n${GREEN}✅ Database seeded successfully!${NC}\n"
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "  • Refresh your frontend to see the data"
    echo -e "  • If you still see 'Data Connection Issue', check the backend logs:"
    echo -e "    ${YELLOW}docker logs ${CONTAINER_NAME}${NC}\n"
else
    echo -e "\n${RED}❌ Seeding failed${NC}"
    echo -e "${YELLOW}Check the logs above for errors${NC}"
    echo -e "${BLUE}To debug, run:${NC}"
    echo -e "  ${YELLOW}docker logs ${CONTAINER_NAME}${NC}\n"
    exit 1
fi

