#!/bin/bash

# Check test coverage for backend and frontend
# Target: 80%+

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Test Coverage Check ===${NC}\n"

# Check if dependencies are installed
if [ ! -d "apps/backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Backend dependencies not installed. Installing...${NC}"
    cd apps/backend && npm install > /dev/null 2>&1 && cd ../..
fi

if [ ! -d "apps/frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend dependencies not installed. Installing...${NC}"
    cd apps/frontend && npm install > /dev/null 2>&1 && cd ../..
fi

# Backend Coverage
echo -e "${BLUE}Checking backend coverage...${NC}"
cd apps/backend
if npm run test:coverage > /tmp/backend-coverage.txt 2>&1; then
    COVERAGE=$(grep -oP 'All files\s+\|\s+\K[\d.]+' /tmp/backend-coverage.txt | head -1 || echo "0")
    if (( $(echo "$COVERAGE >= 80" | bc -l 2>/dev/null || echo "0") )); then
        echo -e "${GREEN}✅ Backend coverage: ${COVERAGE}% (target: 80%+)${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend coverage: ${COVERAGE}% (target: 80%+)${NC}"
        echo -e "${YELLOW}   Add tests to reach 80% coverage${NC}"
    fi
else
    echo -e "${RED}❌ Backend tests failed${NC}"
    cat /tmp/backend-coverage.txt | tail -20
fi
cd ../..

# Frontend Coverage
echo -e "\n${BLUE}Checking frontend coverage...${NC}"
cd apps/frontend
if npm run test:coverage > /tmp/frontend-coverage.txt 2>&1; then
    COVERAGE=$(grep -oP 'All files\s+\|\s+\K[\d.]+' /tmp/frontend-coverage.txt | head -1 || echo "0")
    if (( $(echo "$COVERAGE >= 80" | bc -l 2>/dev/null || echo "0") )); then
        echo -e "${GREEN}✅ Frontend coverage: ${COVERAGE}% (target: 80%+)${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend coverage: ${COVERAGE}% (target: 80%+)${NC}"
        echo -e "${YELLOW}   Add tests to reach 80% coverage${NC}"
    fi
else
    echo -e "${RED}❌ Frontend tests failed${NC}"
    cat /tmp/frontend-coverage.txt | tail -20
fi
cd ../..

echo ""

