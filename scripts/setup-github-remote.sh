#!/bin/bash

# Setup GitHub Remote Repository
# Configures and pushes to GitHub

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== GitHub Remote Setup ===${NC}\n"

cd "$(dirname "$0")/.."

# Check if remote exists
if git remote get-url origin > /dev/null 2>&1; then
    CURRENT_REMOTE=$(git remote get-url origin)
    echo -e "${GREEN}Current remote: ${CURRENT_REMOTE}${NC}\n"
    read -p "Update remote? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Using existing remote${NC}\n"
    else
        read -p "Enter GitHub repository URL (e.g., git@github.com:username/repo.git): " REPO_URL
        git remote set-url origin "$REPO_URL"
        echo -e "${GREEN}✅ Remote updated${NC}\n"
    fi
else
    echo -e "${YELLOW}No remote configured${NC}\n"
    read -p "Enter GitHub repository URL (e.g., git@github.com:username/repo.git): " REPO_URL
    
    if [ -z "$REPO_URL" ]; then
        echo -e "${RED}❌ Repository URL required${NC}"
        exit 1
    fi
    
    git remote add origin "$REPO_URL"
    echo -e "${GREEN}✅ Remote added${NC}\n"
fi

# Show current branches
echo -e "${BLUE}Current branches:${NC}"
git branch -a
echo ""

# Push all branches and tags
echo -e "${BLUE}Pushing to GitHub...${NC}\n"

# Push main branch
echo -e "${BLUE}1. Pushing main branch...${NC}"
git checkout main
git push -u origin main || {
    echo -e "${YELLOW}⚠️  Main branch push failed. Creating upstream?${NC}"
    read -p "Create new repository on GitHub? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Please create the repository on GitHub first, then run this script again${NC}"
        exit 1
    fi
}

# Push staging branch
echo -e "${BLUE}2. Pushing staging branch...${NC}"
git checkout staging
git push -u origin staging || echo -e "${YELLOW}⚠️  Staging branch push failed${NC}"

# Push all tags
echo -e "${BLUE}3. Pushing tags...${NC}"
git push origin --tags || echo -e "${YELLOW}⚠️  Tags push failed${NC}"

# Push all branches
echo -e "${BLUE}4. Pushing all branches...${NC}"
git push origin --all || echo -e "${YELLOW}⚠️  Some branches may have failed${NC}"

echo -e "\n${GREEN}✅ GitHub push complete!${NC}\n"
echo -e "${BLUE}Repository: $(git remote get-url origin)${NC}"
echo -e "${BLUE}Branches pushed: main, staging${NC}"
echo -e "${BLUE}Tags pushed: $(git tag -l | tr '\n' ' ')${NC}\n"

