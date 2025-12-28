#!/bin/bash

# Pre-Release Quality Check
# Comprehensive checks before pushing to GitHub

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Pre-Release Quality Check ===${NC}\n"

ERRORS=0
WARNINGS=0

# 1. Secret Scanning
echo -e "${BLUE}1. Scanning for exposed secrets...${NC}"
SECRET_PATTERNS=(
    "password.*=.*['\"][^'\"]{8,}"
    "secret.*=.*['\"][^'\"]{8,}"
    "api[_-]?key.*=.*['\"][^'\"]{8,}"
    "private[_-]?key.*=.*['\"][^'\"]{8,}"
    "access[_-]?token.*=.*['\"][^'\"]{8,}"
    "aws[_-]?secret.*=.*['\"][^'\"]{8,}"
    "DATABASE_URL.*=.*postgresql://.*:.*@"
    "JWT_SECRET.*=.*['\"][^'\"]{16,}"
)

SECRET_FOUND=false
for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -r -i -E "$pattern" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.env" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build . 2>/dev/null | grep -v "example\|test\|mock\|\.env\.example" > /tmp/secret-scan.txt; then
        SECRET_FOUND=true
        break
    fi
done

if [ "$SECRET_FOUND" = true ]; then
    echo -e "${RED}   ❌ Potential secrets found!${NC}"
    cat /tmp/secret-scan.txt | head -10
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}   ✅ No secrets detected${NC}"
fi

# 2. Check .env files are not committed
echo -e "\n${BLUE}2. Checking .env files...${NC}"
if git ls-files | grep -E "\.env$" | grep -v "\.env\.example" > /dev/null; then
    echo -e "${RED}   ❌ .env files found in git!${NC}"
    git ls-files | grep -E "\.env$" | grep -v "\.env\.example"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}   ✅ No .env files in git${NC}"
fi

# 3. Test Coverage
echo -e "\n${BLUE}3. Checking test coverage...${NC}"
cd apps/backend
if npm run test:coverage > /tmp/backend-coverage.txt 2>&1; then
    COVERAGE=$(grep -oP 'All files\s+\|\s+\K[\d.]+' /tmp/backend-coverage.txt | head -1 || echo "0")
    if (( $(echo "$COVERAGE >= 80" | bc -l) )); then
        echo -e "${GREEN}   ✅ Backend coverage: ${COVERAGE}%${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Backend coverage: ${COVERAGE}% (target: 80%)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}   ❌ Backend tests failed${NC}"
    ERRORS=$((ERRORS + 1))
fi
cd ../..

cd apps/frontend
if npm run test:coverage > /tmp/frontend-coverage.txt 2>&1; then
    COVERAGE=$(grep -oP 'All files\s+\|\s+\K[\d.]+' /tmp/frontend-coverage.txt | head -1 || echo "0")
    if (( $(echo "$COVERAGE >= 80" | bc -l) )); then
        echo -e "${GREEN}   ✅ Frontend coverage: ${COVERAGE}%${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Frontend coverage: ${COVERAGE}% (target: 80%)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}   ❌ Frontend tests failed${NC}"
    ERRORS=$((ERRORS + 1))
fi
cd ../..

# 4. Linting
echo -e "\n${BLUE}4. Running linters...${NC}"
cd apps/backend
if npm run lint > /tmp/backend-lint.txt 2>&1; then
    echo -e "${GREEN}   ✅ Backend linting passed${NC}"
else
    echo -e "${YELLOW}   ⚠️  Backend linting issues found${NC}"
    cat /tmp/backend-lint.txt | tail -20
    WARNINGS=$((WARNINGS + 1))
fi
cd ../..

cd apps/frontend
if npm run lint > /tmp/frontend-lint.txt 2>&1; then
    echo -e "${GREEN}   ✅ Frontend linting passed${NC}"
else
    echo -e "${YELLOW}   ⚠️  Frontend linting issues found${NC}"
    cat /tmp/frontend-lint.txt | tail -20
    WARNINGS=$((WARNINGS + 1))
fi
cd ../..

# 5. TypeScript compilation
echo -e "\n${BLUE}5. Checking TypeScript compilation...${NC}"
cd apps/backend
if npm run build > /tmp/backend-build.txt 2>&1; then
    echo -e "${GREEN}   ✅ Backend compiles successfully${NC}"
else
    echo -e "${RED}   ❌ Backend compilation errors${NC}"
    cat /tmp/backend-build.txt | grep -i error | head -10
    ERRORS=$((ERRORS + 1))
fi
cd ../..

cd apps/frontend
if npm run build > /tmp/frontend-build.txt 2>&1; then
    echo -e "${GREEN}   ✅ Frontend compiles successfully${NC}"
else
    echo -e "${RED}   ❌ Frontend compilation errors${NC}"
    cat /tmp/frontend-build.txt | grep -i error | head -10
    ERRORS=$((ERRORS + 1))
fi
cd ../..

# 6. Console.log check
echo -e "\n${BLUE}6. Checking for console.log statements...${NC}"
CONSOLE_COUNT=$(find apps -name "*.ts" -o -name "*.tsx" | xargs grep -l "console\.log" 2>/dev/null | wc -l | tr -d ' ')
if [ "$CONSOLE_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}   ⚠️  Found console.log in ${CONSOLE_COUNT} files${NC}"
    echo -e "${YELLOW}   Review and remove before release${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}   ✅ No console.log statements${NC}"
fi

# 7. TODO/FIXME check
echo -e "\n${BLUE}7. Checking for TODO/FIXME comments...${NC}"
TODO_COUNT=$(find apps -name "*.ts" -o -name "*.tsx" | xargs grep -i "TODO\|FIXME" 2>/dev/null | wc -l | tr -d ' ')
if [ "$TODO_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}   ⚠️  Found ${TODO_COUNT} TODO/FIXME comments${NC}"
    echo -e "${YELLOW}   Review and address before release${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}   ✅ No TODO/FIXME comments${NC}"
fi

# Summary
echo -e "\n${BLUE}=== Summary ===${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready for release.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  ${WARNINGS} warning(s) found. Review before release.${NC}"
    exit 0
else
    echo -e "${RED}❌ ${ERRORS} error(s) and ${WARNINGS} warning(s) found.${NC}"
    echo -e "${RED}Fix errors before release.${NC}"
    exit 1
fi

