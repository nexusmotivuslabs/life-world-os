#!/bin/bash

# Security and Secret Scanning Script
# Scans for exposed secrets, vulnerabilities, and security issues

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Security & Secret Scan ===${NC}\n"

ERRORS=0
WARNINGS=0

# 1. Check for .env files in git
echo -e "${BLUE}1. Checking for .env files in git...${NC}"
ENV_FILES=$(git ls-files | grep -E "\.env$" | grep -v "\.env\.example" || true)
if [ -n "$ENV_FILES" ]; then
    echo -e "${RED}   ❌ Found .env files in git:${NC}"
    echo "$ENV_FILES"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}   ✅ No .env files in git${NC}"
fi

# 2. Scan for hardcoded secrets
echo -e "\n${BLUE}2. Scanning for hardcoded secrets...${NC}"
SECRET_PATTERNS=(
    "password\s*=\s*['\"][^'\"]{8,}['\"]"
    "secret\s*=\s*['\"][^'\"]{8,}['\"]"
    "api[_-]?key\s*=\s*['\"][^'\"]{8,}['\"]"
    "private[_-]?key\s*=\s*['\"][^'\"]{8,}['\"]"
    "access[_-]?token\s*=\s*['\"][^'\"]{8,}['\"]"
    "jwt[_-]?secret\s*=\s*['\"][^'\"]{16,}['\"]"
)

SECRET_FOUND=false
for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -r -i -E "$pattern" \
        --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
        --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build \
        --exclude="*.test.ts" --exclude="*.test.tsx" \
        apps/ 2>/dev/null | grep -v "example\|mock\|test" > /tmp/secret-scan.txt; then
        SECRET_FOUND=true
        break
    fi
done

if [ "$SECRET_FOUND" = true ]; then
    echo -e "${RED}   ❌ Potential secrets found!${NC}"
    cat /tmp/secret-scan.txt | head -10
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}   ✅ No hardcoded secrets detected${NC}"
fi

# 3. Check for API keys in frontend
echo -e "\n${BLUE}3. Checking for API keys in frontend...${NC}"
if grep -r -i "api.*key\|secret.*key" apps/frontend/src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "example\|test\|mock" | grep -v "VITE_" > /tmp/frontend-keys.txt; then
    echo -e "${YELLOW}   ⚠️  Potential API keys in frontend:${NC}"
    cat /tmp/frontend-keys.txt | head -5
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}   ✅ No API keys in frontend code${NC}"
fi

# 4. npm audit
echo -e "\n${BLUE}4. Running npm audit...${NC}"
cd apps/backend
if npm audit --audit-level=moderate > /tmp/backend-audit.txt 2>&1; then
    echo -e "${GREEN}   ✅ Backend: No moderate+ vulnerabilities${NC}"
else
    VULNS=$(grep -c "moderate\|high\|critical" /tmp/backend-audit.txt || echo "0")
    if [ "$VULNS" -gt 0 ]; then
        echo -e "${YELLOW}   ⚠️  Backend: ${VULNS} vulnerabilities found${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi
cd ../..

cd apps/frontend
if npm audit --audit-level=moderate > /tmp/frontend-audit.txt 2>&1; then
    echo -e "${GREEN}   ✅ Frontend: No moderate+ vulnerabilities${NC}"
else
    VULNS=$(grep -c "moderate\|high\|critical" /tmp/frontend-audit.txt || echo "0")
    if [ "$VULNS" -gt 0 ]; then
        echo -e "${YELLOW}   ⚠️  Frontend: ${VULNS} vulnerabilities found${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi
cd ../..

# 5. Check for SQL injection risks
echo -e "\n${BLUE}5. Checking for SQL injection risks...${NC}"
if grep -r "query.*\$\{" apps/backend/src --include="*.ts" 2>/dev/null | grep -v "test" > /tmp/sql-injection.txt; then
    echo -e "${YELLOW}   ⚠️  Potential SQL injection risks (using Prisma should be safe):${NC}"
    cat /tmp/sql-injection.txt | head -5
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}   ✅ No obvious SQL injection risks${NC}"
fi

# Summary
echo -e "\n${BLUE}=== Security Scan Summary ===${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Security scan passed!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  ${WARNINGS} warning(s) found${NC}"
    exit 0
else
    echo -e "${RED}❌ ${ERRORS} error(s) and ${WARNINGS} warning(s) found${NC}"
    exit 1
fi

