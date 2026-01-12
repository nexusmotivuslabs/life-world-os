#!/bin/bash

# Check if SonarQube is ready and accessible

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Checking SonarQube Status ===${NC}\n"

# Check if containers are running
if docker ps | grep -q "life-world-os-sonarqube"; then
    echo -e "${GREEN}✅ SonarQube container is running${NC}"
else
    echo -e "${RED}❌ SonarQube container is not running${NC}"
    echo -e "${YELLOW}Run: npm run sonar:up${NC}"
    exit 1
fi

# Check if SonarQube is ready
echo -e "\n${BLUE}Checking SonarQube API...${NC}"
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    STATUS=$(curl -s http://localhost:9000/api/system/status 2>/dev/null || echo "")
    
    if echo "$STATUS" | grep -q "UP"; then
        echo -e "${GREEN}✅ SonarQube is operational!${NC}\n"
        echo -e "${BLUE}Access SonarQube at:${NC}"
        echo -e "${GREEN}  http://localhost:9000${NC}\n"
        echo -e "${BLUE}Default credentials:${NC}"
        echo -e "${YELLOW}  Username: admin${NC}"
        echo -e "${YELLOW}  Password: admin${NC}\n"
        echo -e "${BLUE}Next steps:${NC}"
        echo -e "1. Open http://localhost:9000 in your browser"
        echo -e "2. Login with admin/admin"
        echo -e "3. Change password when prompted"
        echo -e "4. Generate token: User > My Account > Security > Generate Token"
        echo -e "5. Run: npm run sonar:setup (to configure .sonarqube.env)"
        exit 0
    elif echo "$STATUS" | grep -q "STARTING"; then
        echo -e "${YELLOW}⏳ SonarQube is starting... (attempt $((ATTEMPT + 1))/$MAX_ATTEMPTS)${NC}"
    else
        echo -e "${YELLOW}⏳ Waiting for SonarQube... (attempt $((ATTEMPT + 1))/$MAX_ATTEMPTS)${NC}"
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
    sleep 5
done

echo -e "\n${RED}❌ SonarQube did not become ready after $MAX_ATTEMPTS attempts${NC}"
echo -e "${YELLOW}Check logs: npm run sonar:logs${NC}"
exit 1

