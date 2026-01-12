#!/bin/bash

# Setup Custom Domains for Life World OS
# Adds domain entries to /etc/hosts for local development

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Life World OS - Domain Setup ===${NC}\n"

# Check if running as root (needed for /etc/hosts)
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  This script needs sudo privileges to modify /etc/hosts${NC}"
    echo -e "${YELLOW}   Please run: sudo ./scripts/setup-domains.sh${NC}"
    exit 1
fi

HOSTS_FILE="/etc/hosts"
DOMAINS=(
    "127.0.0.1 localdev.lifeworld.com"
    "127.0.0.1 dev.lifeworld.com"
    "127.0.0.1 staging.lifeworld.com"
    "127.0.0.1 prod.lifeworld.com"
)

echo -e "${BLUE}Adding domain entries to /etc/hosts...${NC}\n"

# Backup hosts file
cp "$HOSTS_FILE" "$HOSTS_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${GREEN}✅ Backup created: $HOSTS_FILE.backup.$(date +%Y%m%d_%H%M%S)${NC}\n"

# Check if entries already exist
EXISTING_ENTRIES=false
for domain_entry in "${DOMAINS[@]}"; do
    if grep -q "lifeworld.com" "$HOSTS_FILE" 2>/dev/null; then
        EXISTING_ENTRIES=true
        break
    fi
done

if [ "$EXISTING_ENTRIES" = true ]; then
    echo -e "${YELLOW}⚠️  Found existing lifeworld.com entries in /etc/hosts${NC}"
    read -p "Do you want to remove old entries and add new ones? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Remove old entries
        sed -i.bak '/lifeworld.com/d' "$HOSTS_FILE"
        echo -e "${GREEN}✅ Removed old entries${NC}\n"
    else
        echo -e "${YELLOW}⚠️  Skipping. Existing entries remain.${NC}"
        exit 0
    fi
fi

# Add new entries
echo -e "${BLUE}Adding domain entries:${NC}"
for domain_entry in "${DOMAINS[@]}"; do
    echo "$domain_entry" | tee -a "$HOSTS_FILE" > /dev/null
    echo -e "  ${GREEN}✅${NC} $domain_entry"
done

echo -e "\n${GREEN}✅ Domain setup complete!${NC}\n"
echo -e "${BLUE}Domains configured:${NC}"
echo -e "  • ${GREEN}localdev.lifeworld.com${NC} → localhost (for local development)"
echo -e "  • ${GREEN}dev.lifeworld.com${NC} → Docker dev environment"
echo -e "  • ${GREEN}staging.lifeworld.com${NC} → Docker staging environment"
echo -e "  • ${GREEN}prod.lifeworld.com${NC} → Docker production environment\n"

echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Start services: ${YELLOW}docker-compose -f docker-compose.domains.yml up -d${NC}"
echo -e "2. Access: ${YELLOW}http://dev.lifeworld.com${NC}\n"

