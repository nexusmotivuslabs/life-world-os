#!/bin/bash

# Start SonarQube with Docker daemon check

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Starting SonarQube ===${NC}\n"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker daemon is not running${NC}\n"
    echo -e "${YELLOW}Please start Docker Desktop:${NC}"
    echo -e "  macOS: Open Docker Desktop application"
    echo -e "  Or run: ${BLUE}open -a Docker${NC}\n"
    echo -e "${YELLOW}Waiting for Docker to start...${NC}"
    
    # Try to open Docker Desktop
    if command -v open > /dev/null; then
        open -a Docker 2>/dev/null || true
    fi
    
    # Wait for Docker to be ready
    MAX_WAIT=60
    WAIT_TIME=0
    while [ $WAIT_TIME -lt $MAX_WAIT ]; do
        if docker info > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Docker is now running${NC}\n"
            break
        fi
        echo -n "."
        sleep 2
        WAIT_TIME=$((WAIT_TIME + 2))
    done
    
    if ! docker info > /dev/null 2>&1; then
        echo -e "\n${RED}❌ Docker did not start. Please start Docker Desktop manually.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Docker is running${NC}\n"

# Start SonarQube
echo -e "${BLUE}Starting SonarQube containers...${NC}"
npm run sonar:up

echo -e "\n${BLUE}Waiting for SonarQube to be ready...${NC}"
sleep 5

# Check status
echo -e "\n${BLUE}Checking SonarQube status...${NC}"
./scripts/check-sonarqube-ready.sh

