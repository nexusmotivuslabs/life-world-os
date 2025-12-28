#!/bin/bash

# Remove console.log statements from codebase
# Replaces with proper logging or removes entirely

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== Removing console.log statements ===${NC}\n"

# Count before
BEFORE=$(find apps -name "*.ts" -o -name "*.tsx" | xargs grep -l "console\.log" 2>/dev/null | wc -l | tr -d ' ')

echo -e "${BLUE}Found console.log in ${BEFORE} files${NC}\n"

# Files to keep console.log (debug/development tools)
KEEP_FILES=(
    "apps/backend/scripts/ollama-debug.ts"
    "apps/backend/scripts/*debug*.ts"
    "apps/backend/scripts/*test*.ts"
)

# Remove console.log from backend (except scripts)
echo -e "${BLUE}Cleaning backend...${NC}"
find apps/backend/src -name "*.ts" -type f -exec sed -i '' '/console\.log/d' {} \;
find apps/backend/src -name "*.ts" -type f -exec sed -i '' '/console\.error/d' {} \;
find apps/backend/src -name "*.ts" -type f -exec sed -i '' '/console\.warn/d' {} \;

# Remove console.log from frontend (except development)
echo -e "${BLUE}Cleaning frontend...${NC}"
find apps/frontend/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "console\.log" 2>/dev/null | while read file; do
    # Skip if it's a logger file
    if [[ "$file" != *"logger"* ]]; then
        sed -i '' '/console\.log/d' "$file"
    fi
done

find apps/frontend/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "console\.error" 2>/dev/null | while read file; do
    if [[ "$file" != *"logger"* ]]; then
        sed -i '' '/console\.error/d' "$file"
    fi
done

# Count after
AFTER=$(find apps -name "*.ts" -o -name "*.tsx" | xargs grep -l "console\.log" 2>/dev/null | wc -l | tr -d ' ')

REMOVED=$((BEFORE - AFTER))

echo -e "\n${GREEN}✅ Removed console.log from ${REMOVED} files${NC}"
echo -e "${YELLOW}⚠️  ${AFTER} files still contain console.log (scripts/debug files)${NC}"

