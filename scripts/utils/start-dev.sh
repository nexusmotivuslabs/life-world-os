#!/bin/bash

# Quick Start Script for Local Development
# Starts all services on monorepo ports: 5000 (DB), 5001 (Backend), 5002 (Frontend)

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Starting Life World OS (Local Development) ===${NC}\n"

# 1. Start Database
echo -e "${BLUE}1. Starting database on port 5000...${NC}"
cd "$(dirname "$0")/.."
DEV_DB_PORT=5000 docker-compose -f docker-compose.dev.yml up -d postgres-dev
sleep 3

# Check database
if docker-compose -f docker-compose.dev.yml ps postgres-dev | grep -q "healthy"; then
  echo -e "${GREEN}   ✅ Database is running on port 5000${NC}\n"
else
  echo -e "${RED}   ❌ Database failed to start${NC}"
  exit 1
fi

# 2. Setup environment files
echo -e "${BLUE}2. Setting up environment files...${NC}"
if [ ! -f "apps/backend/.env.local" ]; then
  if [ -f "apps/backend/.env.local.example" ]; then
    cp apps/backend/.env.local.example apps/backend/.env.local
    echo -e "${GREEN}   ✅ Created apps/backend/.env.local${NC}"
  fi
fi

if [ ! -f "apps/frontend/.env.local" ]; then
  if [ -f "apps/frontend/.env.local.example" ]; then
    cp apps/frontend/.env.local.example apps/frontend/.env.local
    echo -e "${GREEN}   ✅ Created apps/frontend/.env.local${NC}"
  fi
fi

# 3. Generate Prisma Client
echo -e "${BLUE}3. Checking Prisma Client...${NC}"
cd apps/backend
if [ ! -d "node_modules/.prisma" ]; then
  echo -e "${YELLOW}   Generating Prisma Client...${NC}"
  npm run generate > /dev/null 2>&1
fi
echo -e "${GREEN}   ✅ Prisma Client ready${NC}\n"
cd ../..

# 4. Kill existing processes
echo -e "${BLUE}4. Clearing ports...${NC}"
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:5002 | xargs kill -9 2>/dev/null || true
sleep 1

# 5. Start Backend
echo -e "${BLUE}5. Starting backend on port 5001...${NC}"
cd apps/backend
PORT=5001 npm run dev > /tmp/life-world-backend.log 2>&1 &
BACKEND_PID=$!
cd ../..

# Wait for backend
sleep 4

# Check backend
if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
  echo -e "${GREEN}   ✅ Backend is running on http://localhost:5001${NC}\n"
else
  echo -e "${RED}   ❌ Backend failed to start${NC}"
  echo -e "${YELLOW}   Check logs: tail -f /tmp/life-world-backend.log${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  exit 1
fi

# 6. Start Frontend
echo -e "${BLUE}6. Starting frontend on port 5002...${NC}"
echo -e "${GREEN}   ✅ Frontend will be available at http://localhost:5002${NC}\n"

echo -e "${GREEN}=== All services started! ===${NC}\n"
echo -e "${BLUE}📊 Database:  http://localhost:5000${NC}"
echo -e "${BLUE}🔧 Backend:   http://localhost:5001${NC}"
echo -e "${BLUE}🎨 Frontend:  http://localhost:5002${NC}\n"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}\n"

# Start frontend (foreground)
cd apps/frontend
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null; docker-compose -f docker-compose.dev.yml stop postgres-dev 2>/dev/null; exit" INT TERM
