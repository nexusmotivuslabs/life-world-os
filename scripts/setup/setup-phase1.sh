#!/bin/bash

# Phase 1 Setup Script
# Sets up local observability stack (Prometheus + Grafana + Portainer)

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Phase 1: Local Infrastructure Setup ===${NC}\n"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Create directory structure
echo -e "${BLUE}Creating directory structure...${NC}"
mkdir -p monitoring/prometheus
mkdir -p monitoring/grafana/dashboards/local
mkdir -p monitoring/grafana/datasources

echo -e "${GREEN}✅ Directories created${NC}\n"

# Check if configuration files exist
if [ ! -f "monitoring/prometheus/prometheus.local.yml" ]; then
    echo -e "${YELLOW}⚠️  Prometheus config not found. Please create it.${NC}"
    exit 1
fi

if [ ! -f "monitoring/grafana/datasources/prometheus.yml" ]; then
    echo -e "${YELLOW}⚠️  Grafana datasource config not found. Please create it.${NC}"
    exit 1
fi

# Ensure dev network exists (for Prometheus to connect to dev services)
echo -e "${BLUE}Ensuring Docker networks exist...${NC}"
if ! docker network inspect life-world-os-dev-network > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Creating life-world-os-dev-network...${NC}"
    docker network create life-world-os-dev-network || true
fi

echo -e "${GREEN}✅ Networks ready${NC}\n"

# Start observability stack
echo -e "${BLUE}Starting observability stack (Prometheus + Grafana)...${NC}"
docker-compose -f docker-compose.observability.local.yml up -d

# Wait for services to be healthy
echo -e "${BLUE}Waiting for services to be healthy...${NC}"
sleep 5

# Check Prometheus
if curl -s http://localhost:9090/-/healthy > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Prometheus is running${NC}"
else
    echo -e "${YELLOW}⚠️  Prometheus may still be starting...${NC}"
fi

# Check Grafana
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Grafana is running${NC}"
else
    echo -e "${YELLOW}⚠️  Grafana may still be starting...${NC}"
fi

# Start Portainer
echo -e "\n${BLUE}Starting Portainer...${NC}"
docker-compose -f docker-compose.portainer.yml up -d

# Wait for Portainer
sleep 3

# Check Portainer
if curl -s http://localhost:9000/api/status > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Portainer is running${NC}"
else
    echo -e "${YELLOW}⚠️  Portainer may still be starting...${NC}"
fi

echo -e "\n${GREEN}✅ Phase 1 setup complete!${NC}\n"

echo -e "${BLUE}Access URLs:${NC}"
echo -e "  Prometheus: ${GREEN}http://localhost:9090${NC}"
echo -e "  Grafana:    ${GREEN}http://localhost:3000${NC} (admin/admin)"
echo -e "  Portainer:  ${GREEN}http://localhost:9000${NC}\n"

echo -e "${BLUE}Useful commands:${NC}"
echo -e "  Start:   ${YELLOW}npm run phase1:up${NC}"
echo -e "  Stop:    ${YELLOW}npm run phase1:down${NC}"
echo -e "  Logs:    ${YELLOW}npm run phase1:logs${NC}"
echo -e "  Status:  ${YELLOW}npm run phase1:status${NC}\n"

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "1. Open Grafana: http://localhost:3000"
echo -e "2. Login with admin/admin"
echo -e "3. Check Prometheus data source is configured"
echo -e "4. View 'Local Development' dashboard"
echo -e "5. Access Portainer: http://localhost:9000\n"

