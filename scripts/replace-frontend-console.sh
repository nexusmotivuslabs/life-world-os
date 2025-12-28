#!/bin/bash

# Replace console.log/error/warn with logger in frontend
# Uses existing logger utility

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== Replacing console.* with logger (Frontend) ===${NC}\n"

FRONTEND_SRC="apps/frontend/src"

# Count before
BEFORE=$(find "$FRONTEND_SRC" -name "*.ts" -o -name "*.tsx" | xargs grep -l "console\.\(log\|error\|warn\)" 2>/dev/null | wc -l | tr -d ' ')

echo -e "${BLUE}Found console.* in ${BEFORE} files${NC}\n"

# Process each file
find "$FRONTEND_SRC" -name "*.ts" -o -name "*.tsx" | while read file; do
    # Skip if it's a logger file itself
    if [[ "$file" == *"logger.ts" ]]; then
        continue
    fi
    
    # Check if file has console statements
    if grep -q "console\.\(log\|error\|warn\)" "$file" 2>/dev/null; then
        # Add logger import if not present
        if ! grep -q "from.*logger" "$file"; then
            # Find the last import statement
            LAST_IMPORT=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
            if [ -n "$LAST_IMPORT" ]; then
                # Add logger import after last import
                sed -i '' "${LAST_IMPORT}a\\
import { logger } from '../lib/logger'
" "$file"
            else
                # Add at top if no imports
                sed -i '' "1i\\
import { logger } from '../lib/logger'
\\
" "$file"
            fi
        fi
        
        # Replace console.log with logger.log
        sed -i '' 's/console\.log(/logger.log(/g' "$file"
        
        # Replace console.error with logger.error
        sed -i '' 's/console\.error(/logger.error(/g' "$file"
        
        # Replace console.warn with logger.warn
        sed -i '' 's/console\.warn(/logger.warn(/g' "$file"
        
        echo -e "${GREEN}✅ Updated: ${file}${NC}"
    fi
done

# Count after
AFTER=$(find "$FRONTEND_SRC" -name "*.ts" -o -name "*.tsx" | xargs grep -l "console\.\(log\|error\|warn\)" 2>/dev/null | wc -l | tr -d ' ')

REMOVED=$((BEFORE - AFTER))

echo -e "\n${GREEN}✅ Replaced console.* in ${REMOVED} files${NC}"
echo -e "${YELLOW}⚠️  ${AFTER} files still contain console.*${NC}"

