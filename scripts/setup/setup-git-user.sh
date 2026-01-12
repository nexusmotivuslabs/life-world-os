#!/bin/bash
# Setup Git User for motivus_labs Account
# Run this script to configure git for Life World OS development

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== Git User Setup for motivus_labs ===${NC}\n"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Not in a git repository${NC}"
    echo -e "${YELLOW}   Run this script from the project root${NC}"
    exit 1
fi

# Get current config
CURRENT_NAME=$(git config user.name || echo "not set")
CURRENT_EMAIL=$(git config user.email || echo "not set")

echo -e "${BLUE}Current Git Configuration:${NC}"
echo -e "  Name:  ${CURRENT_NAME}"
echo -e "  Email: ${CURRENT_EMAIL}\n"

# Prompt for email
read -p "Enter your motivus_labs email address: " email

if [ -z "$email" ]; then
    echo -e "${YELLOW}⚠️  Email is required${NC}"
    exit 1
fi

# Set git config
echo -e "\n${BLUE}Configuring git user...${NC}"
git config user.name "motivus_labs"
git config user.email "$email"

# Verify
echo -e "\n${GREEN}✅ Git user configured:${NC}"
echo -e "  Name:  $(git config user.name)"
echo -e "  Email: $(git config user.email)\n"

# Check remote
echo -e "${BLUE}Current remote configuration:${NC}"
git remote -v

echo -e "\n${YELLOW}📋 Next Steps:${NC}"
echo -e "1. Update remote URL if needed:"
echo -e "   ${BLUE}git remote set-url origin git@github.com:motivus_labs/life-world-os.git${NC}"
echo -e ""
echo -e "2. Set up SSH key (see docs/confluence/domains/platform-engineering/implementation/git-user-setup.md)"
echo -e ""
echo -e "3. Test connection:"
echo -e "   ${BLUE}ssh -T git@github.com${NC}"
echo -e ""
echo -e "4. Test push:"
echo -e "   ${BLUE}git push origin main${NC}"


