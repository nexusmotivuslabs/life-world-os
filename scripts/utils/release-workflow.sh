#!/bin/bash

# Complete Release Workflow
# 1. Commit and merge staging to main
# 2. Deploy to UAT/staging
# 3. Run smoke tests
# 4. Deploy to production
# 5. Monitor and apply hotfixes if needed

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Life World OS - Release Workflow ===${NC}\n"

# Step 1: Commit current changes
echo -e "${BLUE}Step 1: Committing current changes...${NC}"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "staging" ]; then
    echo -e "${YELLOW}⚠️  Not on staging branch. Current: ${CURRENT_BRANCH}${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Uncommitted changes detected.${NC}"
    git status --short
    read -p "Commit all changes? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add -A
        git commit -m "chore: prepare for release - commit pending changes"
        echo -e "${GREEN}✅ Changes committed${NC}\n"
    else
        echo -e "${RED}❌ Please commit or stash changes before release${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}\n"
fi

# Step 2: Merge staging to main
echo -e "${BLUE}Step 2: Merging staging to main (release)...${NC}"
git checkout main
git pull origin main || true
git merge --no-ff staging -m "chore: merge staging to main for release"
echo -e "${GREEN}✅ Merged staging to main${NC}\n"

# Get version for tagging
VERSION_INFO=$(node scripts/get-version.js prod)
VERSION=$(echo "$VERSION_INFO" | grep -o '"version":"[^"]*' | cut -d'"' -f4 || echo "1.1.0")
MAJOR=$(echo "$VERSION" | cut -d'.' -f1)
MINOR=$(echo "$VERSION" | cut -d'.' -f2)
PATCH=$(echo "$VERSION" | cut -d'.' -f3)
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="${MAJOR}.${MINOR}.${NEW_PATCH}"

echo -e "${BLUE}Creating release tag v${NEW_VERSION}...${NC}"
git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}: Production deployment"
echo -e "${GREEN}✅ Tagged v${NEW_VERSION}${NC}\n"

# Step 3: Deploy to staging/UAT
echo -e "${BLUE}Step 3: Deploying to UAT/staging environment...${NC}"
git checkout staging
git pull origin staging || true
./scripts/deploy-staging.sh
echo -e "${GREEN}✅ Deployed to staging${NC}\n"

# Wait for services to be ready
echo -e "${BLUE}Waiting for staging services to be ready...${NC}"
sleep 10

# Step 4: Run smoke tests
echo -e "${BLUE}Step 4: Running smoke tests on staging...${NC}"
npm run smoke-test || {
    echo -e "${RED}❌ Smoke tests failed${NC}"
    echo -e "${YELLOW}Please fix issues before deploying to production${NC}"
    exit 1
}
echo -e "${GREEN}✅ Smoke tests passed${NC}\n"

# Step 5: Deploy to production
echo -e "${BLUE}Step 5: Deploying to production...${NC}"
read -p "Deploy to production? (yes/no): " -r
if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    git checkout main
    ./scripts/deploy-prod.sh
    echo -e "${GREEN}✅ Deployed to production${NC}\n"
else
    echo -e "${YELLOW}⚠️  Production deployment skipped${NC}\n"
fi

# Step 6: Monitor and hotfix instructions
echo -e "${BLUE}Step 6: Post-deployment monitoring${NC}"
echo -e "${GREEN}✅ Release workflow complete!${NC}\n"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Monitor production health: curl http://localhost:3000/api/health"
echo -e "2. Check logs: docker-compose -f docker-compose.prod.yml logs -f"
echo -e "3. If issues found, create hotfix:"
echo -e "   git checkout main"
echo -e "   git checkout -b hotfix/issue-description"
echo -e "   # Fix issue"
echo -e "   git commit -m 'fix: issue description'"
echo -e "   git checkout main && git merge --no-ff hotfix/issue-description"
echo -e "   git tag -a v${NEW_VERSION}.1 -m 'Hotfix: issue description'"
echo -e "   git checkout staging && git merge --no-ff hotfix/issue-description"
echo -e "   ./scripts/deploy-prod.sh"
echo -e "\n${GREEN}Release v${NEW_VERSION} complete!${NC}"

