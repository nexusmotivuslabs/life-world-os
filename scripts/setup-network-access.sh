#!/bin/bash

# Setup Network Access for Other Devices
# Helps configure the application to be accessible from other devices on the network

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Life World OS - Network Access Setup ===${NC}\n"

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

# Check nginx port binding
echo -e "${BLUE}Checking nginx configuration...${NC}"
NGINX_PORTS=$(docker ps --format "{{.Ports}}" | grep nginx || echo "")

if echo "$NGINX_PORTS" | grep -q "0.0.0.0:80"; then
    echo -e "${GREEN}✅ Nginx is bound to 0.0.0.0:80 (accessible from network)${NC}\n"
else
    echo -e "${YELLOW}⚠️  Nginx may not be accessible from network${NC}"
    echo -e "${YELLOW}   Check: docker ps | grep nginx${NC}\n"
fi

# Display access information
echo -e "${BLUE}=== Access Information ===${NC}\n"
echo -e "${GREEN}Your local IP: ${LOCAL_IP}${NC}\n"

echo -e "${BLUE}Option 1: Access via IP (No configuration needed)${NC}"
echo -e "  Frontend: ${YELLOW}http://${LOCAL_IP}/${NC}"
echo -e "  API:      ${YELLOW}http://${LOCAL_IP}/api/health${NC}\n"

echo -e "${BLUE}Option 2: Access via Domain (Requires hosts file on each device)${NC}"
echo -e "  Add to /etc/hosts on each device:${NC}"
echo -e "  ${YELLOW}${LOCAL_IP} dev.lifeworld.com${NC}"
echo -e "  ${YELLOW}${LOCAL_IP} staging.lifeworld.com${NC}"
echo -e "  ${YELLOW}${LOCAL_IP} prod.lifeworld.com${NC}\n"

echo -e "${BLUE}Testing connectivity...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "http://${LOCAL_IP}/api/health" | grep -q "200"; then
    echo -e "${GREEN}✅ Application is accessible at http://${LOCAL_IP}/${NC}\n"
else
    echo -e "${YELLOW}⚠️  Could not reach application at http://${LOCAL_IP}/${NC}"
    echo -e "${YELLOW}   Check firewall settings${NC}\n"
fi

echo -e "${BLUE}=== Next Steps ===${NC}\n"
echo -e "1. Test from another device: ${YELLOW}http://${LOCAL_IP}/${NC}"
echo -e "2. If using domains, add entries to hosts file on each device"
echo -e "3. Check firewall if devices can't connect\n"

echo -e "${BLUE}For detailed instructions, see:${NC}"
echo -e "  ${YELLOW}docs/MULTI_DEVICE_ACCESS.md${NC}\n"

