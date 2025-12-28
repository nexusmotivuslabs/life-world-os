#!/bin/bash

# Local Development Startup Script
# Runs backend on port 5000 and frontend on port 5173
# Database must be running in Docker (port 5433)

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Life World OS - Local Development ===${NC}\n"

# Check if database is running
echo -e "${BLUE}Checking database connection (port 5000)...${NC}"
if ! docker ps | grep -q "life-db-dev\|postgres-dev"; then
  echo -e "${YELLOW}⚠️  Database container not running${NC}"
  echo -e "${YELLOW}   Starting database container on port 5000...${NC}"
  DEV_DB_PORT=5000 docker-compose -f docker-compose.dev.yml up -d postgres-dev
  echo -e "${BLUE}   Waiting for database to be ready...${NC}"
  sleep 5
fi

# Check database connection on port 5000
if ! docker-compose -f docker-compose.dev.yml exec -T postgres-dev pg_isready -U lifeworld_dev > /dev/null 2>&1; then
  echo -e "${RED}❌ Database is not ready${NC}"
  echo -e "${YELLOW}   Please ensure Docker database is running on port 5000:${NC}"
  echo -e "${YELLOW}   DEV_DB_PORT=5000 docker-compose -f docker-compose.dev.yml up -d postgres-dev${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Database is ready on port 5000${NC}\n"

# Check if .env.local exists in backend
if [ ! -f "apps/backend/.env.local" ]; then
  echo -e "${YELLOW}⚠️  apps/backend/.env.local not found${NC}"
  if [ -f "apps/backend/.env.local.example" ]; then
    echo -e "${YELLOW}   Copying from .env.local.example...${NC}"
    cp apps/backend/.env.local.example apps/backend/.env.local
    echo -e "${GREEN}   ✅ Created apps/backend/.env.local${NC}"
  else
    echo -e "${RED}   ❌ .env.local.example not found${NC}"
    echo -e "${YELLOW}   Please create apps/backend/.env.local manually${NC}"
    exit 1
  fi
fi

# Check if .env.local exists in frontend
if [ ! -f "apps/frontend/.env.local" ]; then
  echo -e "${YELLOW}⚠️  apps/frontend/.env.local not found${NC}"
  if [ -f "apps/frontend/.env.local.example" ]; then
    echo -e "${YELLOW}   Copying from .env.local.example...${NC}"
    cp apps/frontend/.env.local.example apps/frontend/.env.local
    echo -e "${GREEN}   ✅ Created apps/frontend/.env.local${NC}"
  else
    echo -e "${RED}   ❌ .env.local.example not found${NC}"
    echo -e "${YELLOW}   Please create apps/frontend/.env.local manually${NC}"
    exit 1
  fi
fi

# Check if Prisma Client is generated
if [ ! -d "apps/backend/node_modules/.prisma" ]; then
  echo -e "${BLUE}Generating Prisma Client...${NC}"
  cd apps/backend
  npm run generate
  cd ../..
fi

# Kill any processes on ports 5001 and 5002
echo -e "${BLUE}Clearing ports 5001 and 5002...${NC}"
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:5002 | xargs kill -9 2>/dev/null || true
sleep 1

# Start backend in background
echo -e "${BLUE}Starting backend on port 5001...${NC}"
cd apps/backend
PORT=5001 npm run dev > /tmp/life-world-backend.log 2>&1 &
BACKEND_PID=$!
cd ../..

# Wait for backend to start
echo -e "${BLUE}Waiting for backend to start...${NC}"
sleep 3

# Check if backend is running
if ! curl -s http://localhost:5001/api/health > /dev/null; then
  echo -e "${RED}❌ Backend failed to start${NC}"
  echo -e "${YELLOW}   Check logs: tail -f /tmp/life-world-backend.log${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  exit 1
fi

echo -e "${GREEN}✅ Backend is running on http://localhost:5001${NC}\n"

# Start frontend
echo -e "${BLUE}Starting frontend on port 5002...${NC}"
echo -e "${GREEN}✅ Frontend will be available at http://localhost:5002${NC}\n"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}\n"

cd apps/frontend
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null; exit" INT TERM

