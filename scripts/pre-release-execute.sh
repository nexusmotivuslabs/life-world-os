#!/bin/bash

# Pre-Release Execution Script
# Runs all pre-release checks and fixes

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Pre-Release Execution ===${NC}\n"

# 1. Security Scan
echo -e "${BLUE}Step 1: Security Scan${NC}"
if ./scripts/security-scan.sh; then
    echo -e "${GREEN}✅ Security scan passed${NC}\n"
else
    echo -e "${RED}❌ Security scan failed - fix issues first${NC}\n"
    exit 1
fi

# 2. Install Dependencies
echo -e "${BLUE}Step 2: Installing Dependencies${NC}"
cd apps/backend && npm install > /dev/null 2>&1 && cd ../..
cd apps/frontend && npm install > /dev/null 2>&1 && cd ../..
echo -e "${GREEN}✅ Dependencies installed${NC}\n"

# 3. Test Coverage
echo -e "${BLUE}Step 3: Checking Test Coverage${NC}"
cd apps/backend
if npm run test:coverage > /tmp/backend-coverage.txt 2>&1; then
    COVERAGE=$(grep -oP 'All files\s+\|\s+\K[\d.]+' /tmp/backend-coverage.txt | head -1 || echo "0")
    echo -e "${BLUE}   Backend coverage: ${COVERAGE}%${NC}"
    if (( $(echo "$COVERAGE >= 80" | bc -l 2>/dev/null || echo "0") )); then
        echo -e "${GREEN}   ✅ Backend coverage meets 80% target${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Backend coverage below 80% (${COVERAGE}%)${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  Backend tests failed or coverage unavailable${NC}"
fi
cd ../..

cd apps/frontend
if npm run test:coverage > /tmp/frontend-coverage.txt 2>&1; then
    COVERAGE=$(grep -oP 'All files\s+\|\s+\K[\d.]+' /tmp/frontend-coverage.txt | head -1 || echo "0")
    echo -e "${BLUE}   Frontend coverage: ${COVERAGE}%${NC}"
    if (( $(echo "$COVERAGE >= 80" | bc -l 2>/dev/null || echo "0") )); then
        echo -e "${GREEN}   ✅ Frontend coverage meets 80% target${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Frontend coverage below 80% (${COVERAGE}%)${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  Frontend tests failed or coverage unavailable${NC}"
fi
cd ../..

echo ""

# 4. Linting
echo -e "${BLUE}Step 4: Running Linters${NC}"
cd apps/backend
if npm run lint > /tmp/backend-lint.txt 2>&1; then
    echo -e "${GREEN}   ✅ Backend linting passed${NC}"
else
    echo -e "${YELLOW}   ⚠️  Backend linting issues (see /tmp/backend-lint.txt)${NC}"
fi
cd ../..

cd apps/frontend
if npm run lint > /tmp/frontend-lint.txt 2>&1; then
    echo -e "${GREEN}   ✅ Frontend linting passed${NC}"
else
    echo -e "${YELLOW}   ⚠️  Frontend linting issues (see /tmp/frontend-lint.txt)${NC}"
fi
cd ../..

echo ""

# 5. TypeScript Compilation
echo -e "${BLUE}Step 5: TypeScript Compilation${NC}"
cd apps/backend
if npm run build > /tmp/backend-build.txt 2>&1; then
    echo -e "${GREEN}   ✅ Backend compiles successfully${NC}"
else
    echo -e "${RED}   ❌ Backend compilation errors${NC}"
    grep -i error /tmp/backend-build.txt | head -5
fi
cd ../..

cd apps/frontend
if npm run build > /tmp/frontend-build.txt 2>&1; then
    echo -e "${GREEN}   ✅ Frontend compiles successfully${NC}"
else
    echo -e "${RED}   ❌ Frontend compilation errors${NC}"
    grep -i error /tmp/frontend-build.txt | head -5
fi
cd ../..

echo ""

# Summary
echo -e "${BLUE}=== Pre-Release Check Complete ===${NC}"
echo -e "${YELLOW}Review the results above and fix any critical issues before proceeding.${NC}"

