#!/bin/bash

# Run SonarQube Analysis
# Analyzes code quality and sends results to SonarQube server

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== SonarQube Analysis ===${NC}\n"

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

# Check if SonarScanner is installed
if command -v sonar-scanner &> /dev/null; then
    SONAR_SCANNER="sonar-scanner"
elif command -v sonar &> /dev/null; then
    SONAR_SCANNER="sonar"
else
    echo -e "${RED}❌ SonarScanner not found${NC}"
    echo -e "${YELLOW}Install: brew install sonar-scanner${NC}"
    echo -e "${YELLOW}Or download from: https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/${NC}"
    exit 1
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

# Run SonarQube analysis
echo -e "\n${BLUE}Running SonarQube analysis...${NC}"

# Export variables for sonar-scanner
export SONAR_HOST_URL
export SONAR_TOKEN
export SONAR_PROJECT_KEY=${SONAR_PROJECT_KEY:-life-world-os}

# Run scanner
if $SONAR_SCANNER -Dsonar.host.url="$SONAR_HOST_URL" \
    -Dsonar.login="$SONAR_TOKEN" \
    -Dsonar.projectKey="$SONAR_PROJECT_KEY"; then
    echo -e "\n${GREEN}✅ SonarQube analysis complete!${NC}"
    echo -e "${BLUE}View results at: ${SONAR_HOST_URL}/dashboard?id=${SONAR_PROJECT_KEY}${NC}"
else
    echo -e "\n${RED}❌ SonarQube analysis failed${NC}"
    exit 1
fi

