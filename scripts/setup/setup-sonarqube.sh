#!/bin/bash

# Setup SonarQube for Life World OS
# Configures SonarQube analysis for code quality

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== SonarQube Setup ===${NC}\n"

# Check if .sonarqube.env exists
if [ ! -f ".sonarqube.env" ]; then
    echo -e "${YELLOW}⚠️  .sonarqube.env not found${NC}"
    echo -e "${BLUE}Creating from example...${NC}"
    cp .sonarqube.env.example .sonarqube.env
    echo -e "${GREEN}✅ Created .sonarqube.env${NC}"
    echo -e "${YELLOW}⚠️  Please edit .sonarqube.env and add your SonarQube token${NC}\n"
fi

# Check if sonar-project.properties exists
if [ ! -f "sonar-project.properties" ]; then
    echo -e "${RED}❌ sonar-project.properties not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ SonarQube configuration files ready${NC}\n"

# Check if SonarScanner is installed
if command -v sonar-scanner &> /dev/null; then
    echo -e "${GREEN}✅ SonarScanner is installed${NC}"
    sonar-scanner --version
elif command -v sonar &> /dev/null; then
    echo -e "${GREEN}✅ SonarScanner (new) is installed${NC}"
    sonar --version
else
    echo -e "${YELLOW}⚠️  SonarScanner not found${NC}"
    echo -e "${BLUE}Installation options:${NC}"
    echo -e "  macOS: ${YELLOW}brew install sonar-scanner${NC}"
    echo -e "  Or download from: https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/"
fi

echo -e "\n${BLUE}=== Next Steps ===${NC}"
echo -e "1. Edit .sonarqube.env and add your SonarQube token"
echo -e "2. Start SonarQube server (if running locally)"
echo -e "3. Run: ${YELLOW}npm run sonar:analyze${NC}"
echo -e "4. View results at: ${YELLOW}\$SONAR_HOST_URL${NC}"

