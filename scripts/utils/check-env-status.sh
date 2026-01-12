#!/bin/bash

# Check Environment Status
# Shows which environments (local/dev) are currently running

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Environment Status Check ===${NC}\n"

# Check Local Backend (5001)
echo -e "${BLUE}Local Environment:${NC}"
if lsof -i:5001 > /dev/null 2>&1; then
  echo -e "  ${GREEN}✅ Backend: Running on port 5001${NC}"
  curl -s http://localhost:5001/api/health > /dev/null 2>&1 && \
    echo -e "     ${GREEN}✓ Health check passed${NC}" || \
    echo -e "     ${YELLOW}⚠ Health check failed${NC}"
else
  echo -e "  ${YELLOW}⚪ Backend: Not running on port 5001${NC}"
fi

if lsof -i:5002 > /dev/null 2>&1; then
  echo -e "  ${GREEN}✅ Frontend: Running on port 5002${NC}"
else
  echo -e "  ${YELLOW}⚪ Frontend: Not running on port 5002${NC}"
fi

# Check Dev Backend (3001)
echo -e "\n${BLUE}Dev Environment (Docker):${NC}"
if lsof -i:3001 > /dev/null 2>&1; then
  echo -e "  ${GREEN}✅ Backend: Running on port 3001${NC}"
  curl -s http://localhost:3001/api/health > /dev/null 2>&1 && \
    echo -e "     ${GREEN}✓ Health check passed${NC}" || \
    echo -e "     ${YELLOW}⚠ Health check failed${NC}"
else
  echo -e "  ${YELLOW}⚪ Backend: Not running on port 3001${NC}"
fi

if lsof -i:5173 > /dev/null 2>&1; then
  echo -e "  ${GREEN}✅ Frontend: Running on port 5173${NC}"
else
  echo -e "  ${YELLOW}⚪ Frontend: Not running on port 5173${NC}"
fi

# Check Database
echo -e "\n${BLUE}Shared Database:${NC}"
if docker ps | grep -q "life-db-dev\|postgres-dev"; then
  echo -e "  ${GREEN}✅ Database: Running (Docker)${NC}"
  docker-compose -f docker-compose.dev.yml exec -T postgres-dev pg_isready -U lifeworld_dev > /dev/null 2>&1 && \
    echo -e "     ${GREEN}✓ Connection healthy${NC}" || \
    echo -e "     ${YELLOW}⚠ Connection issues${NC}"
else
  echo -e "  ${RED}❌ Database: Not running${NC}"
  echo -e "     Start with: docker-compose -f docker-compose.dev.yml up -d postgres-dev"
fi

# Summary
echo -e "\n${BLUE}Summary:${NC}"
LOCAL_RUNNING=$([ -n "$(lsof -i:5001 2>/dev/null)" ] && [ -n "$(lsof -i:5002 2>/dev/null)" ] && echo "yes" || echo "no")
DEV_RUNNING=$([ -n "$(lsof -i:3001 2>/dev/null)" ] && [ -n "$(lsof -i:5173 2>/dev/null)" ] && echo "yes" || echo "no")
DB_RUNNING=$(docker ps | grep -q "life-db-dev\|postgres-dev" && echo "yes" || echo "no")

if [ "$LOCAL_RUNNING" = "yes" ]; then
  echo -e "  ${GREEN}✅ Local environment: Active${NC}"
  echo -e "     Access: http://localhost:5002"
fi

if [ "$DEV_RUNNING" = "yes" ]; then
  echo -e "  ${GREEN}✅ Dev environment: Active${NC}"
  echo -e "     Access: http://localhost:5173"
fi

if [ "$DB_RUNNING" = "yes" ]; then
  echo -e "  ${GREEN}✅ Database: Available${NC}"
  echo -e "     Port: 5433"
fi

if [ "$LOCAL_RUNNING" = "no" ] && [ "$DEV_RUNNING" = "no" ]; then
  echo -e "  ${YELLOW}⚪ No environments running${NC}"
  echo -e "     Start local: npm run dev:local"
  echo -e "     Start dev: docker-compose -f docker-compose.dev.yml --profile full up -d"
fi

