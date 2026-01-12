#!/bin/bash

# Setup Local DNS Server for Automatic Domain Resolution
# This allows iPhone/iPad and other devices to access dev.lifeworld.com
# without editing hosts files

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Life World OS - Local DNS Setup ===${NC}\n"

# Get local IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1 || echo "")
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    LOCAL_IP=$(hostname -I | awk '{print $1}')
else
    LOCAL_IP=""
fi

if [ -z "$LOCAL_IP" ]; then
    echo -e "${YELLOW}⚠️  Could not automatically detect IP address${NC}"
    read -p "Enter your local IP address: " LOCAL_IP
else
    echo -e "${GREEN}✅ Detected local IP: ${LOCAL_IP}${NC}\n"
fi

# Update hosts file
echo -e "${BLUE}Updating DNS hosts file...${NC}"
mkdir -p dnsmasq
cat > dnsmasq/hosts << EOF
${LOCAL_IP} dev.lifeworld.com
${LOCAL_IP} staging.lifeworld.com
${LOCAL_IP} prod.lifeworld.com
${LOCAL_IP} localdev.lifeworld.com
EOF

echo -e "${GREEN}✅ DNS hosts file updated${NC}\n"

# Check if port 53 is available
if lsof -i :53 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 53 is already in use${NC}"
    echo -e "${YELLOW}   You may need to stop other DNS services or use sudo${NC}\n"
fi

# Start DNS server
echo -e "${BLUE}Starting DNS server...${NC}"
if docker-compose -f docker-compose.dns.yml up -d 2>&1 | grep -q "permission denied\|Permission denied"; then
    echo -e "${YELLOW}⚠️  Permission denied. Port 53 requires root.${NC}"
    echo -e "${YELLOW}   Trying with sudo...${NC}\n"
    sudo docker-compose -f docker-compose.dns.yml up -d
else
    docker-compose -f docker-compose.dns.yml up -d
fi

sleep 2

# Check if DNS is running
if docker ps | grep -q "life-world-os-dns"; then
    echo -e "${GREEN}✅ DNS server is running${NC}\n"
else
    echo -e "${RED}❌ DNS server failed to start${NC}"
    echo -e "${YELLOW}   Check logs: docker logs life-world-os-dns${NC}\n"
    exit 1
fi

# Test DNS
echo -e "${BLUE}Testing DNS resolution...${NC}"
if command -v dig > /dev/null; then
    RESULT=$(dig @${LOCAL_IP} dev.lifeworld.com +short 2>/dev/null || echo "")
    if [ "$RESULT" = "$LOCAL_IP" ]; then
        echo -e "${GREEN}✅ DNS resolution working!${NC}\n"
    else
        echo -e "${YELLOW}⚠️  DNS resolution test inconclusive${NC}\n"
    fi
fi

# Display instructions
echo -e "${BLUE}=== iPhone/iPad Configuration ===${NC}\n"
echo -e "1. Go to ${YELLOW}Settings → Wi-Fi${NC}"
echo -e "2. Tap ${YELLOW}ⓘ${NC} next to your WiFi network"
echo -e "3. Scroll to ${YELLOW}DNS${NC}"
echo -e "4. Tap ${YELLOW}Configure DNS${NC} → ${YELLOW}Manual${NC}"
echo -e "5. Add: ${GREEN}${LOCAL_IP}${NC}"
echo -e "6. Save\n"

echo -e "${BLUE}=== Test ===${NC}\n"
echo -e "On iPhone/iPad, open: ${YELLOW}http://dev.lifeworld.com${NC}\n"

echo -e "${BLUE}=== Commands ===${NC}\n"
echo -e "View logs:    ${YELLOW}npm run dns:logs${NC}"
echo -e "Stop DNS:     ${YELLOW}npm run dns:down${NC}"
echo -e "Restart DNS:  ${YELLOW}npm run dns:up${NC}\n"

