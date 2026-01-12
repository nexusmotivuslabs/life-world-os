#!/bin/bash

# Optimized Dev Rebuild Script
# 
# This script provides fast rebuild options for dev environment.
# Since volumes are mounted, code changes don't require rebuilds.
#
# Usage:
#   ./scripts/rebuild-dev.sh              # Restart only (fastest - ~5 seconds)
#   ./scripts/rebuild-dev.sh --rebuild    # Rebuild containers (slow - ~2-3 minutes)
#   ./scripts/rebuild-dev.sh --clean      # Clean rebuild (slowest - ~3-5 minutes)

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

MODE=${1:-restart}

echo -e "${BLUE}=== Life World OS - Dev Rebuild ===${NC}\n"

case "$MODE" in
  restart)
    echo -e "${GREEN}⚡ Fast Restart Mode (Code changes only)${NC}"
    echo -e "${YELLOW}   Since volumes are mounted, code changes are hot-reloaded${NC}"
    echo -e "${YELLOW}   Average time: ~5-10 seconds${NC}\n"
    
    echo -e "${BLUE}Restarting containers...${NC}"
    docker-compose -f docker-compose.dev.yml restart backend-dev frontend-dev
    
    echo -e "${GREEN}✅ Containers restarted${NC}"
    echo -e "${BLUE}   Code changes will be picked up automatically via volume mounts${NC}"
    ;;
    
  --rebuild)
    echo -e "${YELLOW}🔨 Rebuild Mode (Dependency changes)${NC}"
    echo -e "${YELLOW}   Rebuilds containers with dependency cache${NC}"
    echo -e "${YELLOW}   Average time: ~2-3 minutes${NC}\n"
    
    echo -e "${BLUE}Rebuilding containers (with cache)...${NC}"
    docker-compose -f docker-compose.dev.yml build backend-dev frontend-dev
    
    echo -e "${BLUE}Restarting containers...${NC}"
    docker-compose -f docker-compose.dev.yml up -d --force-recreate backend-dev frontend-dev
    
    echo -e "${GREEN}✅ Containers rebuilt and restarted${NC}"
    ;;
    
  --clean)
    echo -e "${RED}🧹 Clean Rebuild Mode (Full rebuild)${NC}"
    echo -e "${YELLOW}   Rebuilds everything from scratch${NC}"
    echo -e "${YELLOW}   Average time: ~3-5 minutes${NC}\n"
    
    echo -e "${BLUE}Stopping containers...${NC}"
    docker-compose -f docker-compose.dev.yml stop backend-dev frontend-dev
    
    echo -e "${BLUE}Rebuilding containers (no cache)...${NC}"
    docker-compose -f docker-compose.dev.yml build --no-cache backend-dev frontend-dev
    
    echo -e "${BLUE}Starting containers...${NC}"
    docker-compose -f docker-compose.dev.yml up -d backend-dev frontend-dev
    
    echo -e "${GREEN}✅ Clean rebuild complete${NC}"
    ;;
    
  *)
    echo -e "${RED}❌ Unknown mode: $MODE${NC}"
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  $0              # Fast restart (~5-10 seconds)"
    echo -e "  $0 --rebuild    # Rebuild with cache (~2-3 minutes)"
    echo -e "  $0 --clean      # Clean rebuild (~3-5 minutes)"
    exit 1
    ;;
esac

# Wait for services to be ready
echo -e "\n${BLUE}Waiting for services to be ready...${NC}"
sleep 3

# Check status
echo -e "\n${BLUE}Container Status:${NC}"
docker-compose -f docker-compose.dev.yml ps

echo -e "\n${GREEN}✅ Dev environment ready!${NC}"
echo -e "${BLUE}   Frontend: http://localhost:5173${NC}"
echo -e "${BLUE}   Backend:  http://localhost:3001${NC}"

