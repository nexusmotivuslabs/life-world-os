#!/bin/bash

# Run SonarQube Analysis using Docker (no local SonarScanner needed)
# Alternative to run-sonarqube.sh that uses Docker

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== SonarQube Analysis (Docker) ===${NC}\n"

# Check if .sonarqube.env exists
if [ ! -f ".sonarqube.env" ]; then
    echo -e "${RED}❌ .sonarqube.env not found${NC}"
    echo -e "${YELLOW}Run: npm run sonar:setup${NC}"
    exit 1
fi

# Load environment variables
source .sonarqube.env

# Check required variables
if [ -z "$SONAR_HOST_URL" ] || [ -z "$SONAR_TOKEN" ]; then
    echo -e "${RED}❌ SONAR_HOST_URL or SONAR_TOKEN not set in .sonarqube.env${NC}"
    exit 1
fi

echo -e "${BLUE}SonarQube Server: ${SONAR_HOST_URL}${NC}"
echo -e "${BLUE}Project Key: ${SONAR_PROJECT_KEY:-life-world-os}${NC}\n"

# Check if SonarQube is running (if using local Docker)
if echo "$SONAR_HOST_URL" | grep -q "localhost\|127.0.0.1"; then
    if ! docker ps | grep -q "life-world-os-sonarqube"; then
        echo -e "${YELLOW}⚠️  SonarQube container not running${NC}"
        echo -e "${BLUE}Starting SonarQube...${NC}"
        npm run sonar:up
        echo -e "${BLUE}Waiting for SonarQube to be ready...${NC}"
        sleep 30
    fi
fi

# Generate test coverage if available
echo -e "${BLUE}Generating test coverage...${NC}"
if [ -d "apps/backend" ]; then
    cd apps/backend
    if npm run test:coverage > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend coverage generated${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend coverage not available${NC}"
    fi
    cd ../..
fi

if [ -d "apps/frontend" ]; then
    cd apps/frontend
    if npm run test:coverage > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend coverage generated${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend coverage not available${NC}"
    fi
    cd ../..
fi

# Determine host URL for Docker container
if echo "$SONAR_HOST_URL" | grep -q "localhost\|127.0.0.1"; then
    DOCKER_HOST_URL="http://host.docker.internal:9000"
else
    DOCKER_HOST_URL="$SONAR_HOST_URL"
fi

# Run SonarQube analysis using Docker
echo -e "\n${BLUE}Running SonarQube analysis (Docker)...${NC}"

docker run --rm \
    -v "$(pwd):/usr/src" \
    -w /usr/src \
    -e SONAR_HOST_URL="$DOCKER_HOST_URL" \
    -e SONAR_TOKEN="$SONAR_TOKEN" \
    sonarsource/sonar-scanner-cli:latest \
    -Dsonar.projectKey="${SONAR_PROJECT_KEY:-life-world-os}" \
    -Dsonar.host.url="$DOCKER_HOST_URL" \
    -Dsonar.login="$SONAR_TOKEN"

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ SonarQube analysis complete!${NC}"
    echo -e "${BLUE}View results at: ${SONAR_HOST_URL}/dashboard?id=${SONAR_PROJECT_KEY:-life-world-os}${NC}"
else
    echo -e "\n${RED}❌ SonarQube analysis failed${NC}"
    exit 1
fi

