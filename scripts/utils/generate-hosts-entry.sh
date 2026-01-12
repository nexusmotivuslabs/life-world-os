#!/bin/bash

# Generate Hosts File Entry for Other Devices
# Prints the hosts file entries needed for other devices

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== Hosts File Entry for Other Devices ===${NC}\n"

# Get local IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1 || echo "")
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    LOCAL_IP=$(hostname -I | awk '{print $1}')
else
    LOCAL_IP=""
fi

if [ -z "$LOCAL_IP" ]; then
    read -p "Enter your local IP address: " LOCAL_IP
fi

echo -e "${GREEN}Copy these lines to the hosts file on the OTHER device:${NC}\n"
echo -e "${YELLOW}${LOCAL_IP} dev.lifeworld.com${NC}"
echo -e "${YELLOW}${LOCAL_IP} staging.lifeworld.com${NC}"
echo -e "${YELLOW}${LOCAL_IP} prod.lifeworld.com${NC}\n"

echo -e "${BLUE}Where to add:${NC}"
echo -e "  • ${YELLOW}macOS/Linux${NC}: sudo nano /etc/hosts"
echo -e "  • ${YELLOW}Windows${NC}: C:\\Windows\\System32\\drivers\\etc\\hosts (as Admin)"
echo -e "  • ${YELLOW}iPhone/iPad${NC}: Use 'DNS Override' or 'AdGuard' app"
echo -e "  • ${YELLOW}Android${NC}: Use 'Hosts Go' app or edit /etc/hosts (rooted)\n"

echo -e "${BLUE}Or use IP directly (no setup):${NC}"
echo -e "  ${YELLOW}http://${LOCAL_IP}/${NC}\n"

