#!/bin/bash

# Import Grafana Dashboards via API
# This script imports dashboards that aren't auto-provisioning

GRAFANA_URL="http://localhost:3000"
GRAFANA_USER="admin"
GRAFANA_PASS="admin"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Importing Grafana Dashboards ===${NC}\n"

# Get auth token
echo -e "${BLUE}Authenticating with Grafana...${NC}"
AUTH_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"user\":\"${GRAFANA_USER}\",\"password\":\"${GRAFANA_PASS}\"}" \
  "${GRAFANA_URL}/api/auth/login")

# Check if auth worked
if echo "$AUTH_RESPONSE" | grep -q "Logged in"; then
  echo -e "${GREEN}✅ Authenticated${NC}\n"
else
  echo -e "${RED}❌ Authentication failed${NC}"
  echo "Response: $AUTH_RESPONSE"
  exit 1
fi

# Import dashboards
DASHBOARDS=(
  "monitoring/grafana/dashboards/local/backend-metrics.json"
  "monitoring/grafana/dashboards/local/frontend-metrics.json"
  "monitoring/grafana/dashboards/local/database-metrics.json"
)

for dashboard_file in "${DASHBOARDS[@]}"; do
  if [ ! -f "$dashboard_file" ]; then
    echo -e "${YELLOW}⚠️  File not found: $dashboard_file${NC}"
    continue
  fi

  dashboard_name=$(basename "$dashboard_file" .json)
  echo -e "${BLUE}Importing: $dashboard_name${NC}"
  
  # Import dashboard
  IMPORT_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Cookie: grafana_session=$(curl -s -c - -X POST -H "Content-Type: application/json" -d "{\"user\":\"${GRAFANA_USER}\",\"password\":\"${GRAFANA_PASS}\"}" "${GRAFANA_URL}/api/auth/login" | grep grafana_session | awk '{print $7}')" \
    -d @"$dashboard_file" \
    "${GRAFANA_URL}/api/dashboards/db")
  
  if echo "$IMPORT_RESPONSE" | grep -q "Dashboard imported"; then
    echo -e "${GREEN}✅ Imported: $dashboard_name${NC}"
  else
    echo -e "${YELLOW}⚠️  Import response: $IMPORT_RESPONSE${NC}"
  fi
done

echo -e "\n${GREEN}✅ Dashboard import complete!${NC}"
echo -e "${BLUE}Access Grafana: ${GRAFANA_URL}${NC}"

