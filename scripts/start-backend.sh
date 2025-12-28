#!/bin/bash

# Start Backend Server
# Starts the backend on port 5001

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Starting Backend Server ===${NC}\n"

cd "$(dirname "$0")/.."

# Check if port 5001 is in use
if lsof -ti:5001 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 5001 is already in use${NC}"
    read -p "Kill existing process? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:5001 | xargs kill -9 2>/dev/null || true
        sleep 1
        echo -e "${GREEN}✅ Port 5001 cleared${NC}\n"
    else
        echo -e "${RED}❌ Cannot start backend - port 5001 in use${NC}"
        exit 1
    fi
fi

# Check if database is running
echo -e "${BLUE}Checking database...${NC}"
if docker ps | grep -q "postgres-dev\|life-world-os.*postgres"; then
    echo -e "${GREEN}✅ Database is running${NC}\n"
else
    echo -e "${YELLOW}⚠️  Database not running. Starting database...${NC}"
    npm run dev:db
    sleep 3
fi

# Check if backend dependencies are installed
if [ ! -d "apps/backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Backend dependencies not installed. Installing...${NC}"
    cd apps/backend
    npm install
    cd ../..
fi

# Check if Prisma Client is generated
if [ ! -d "apps/backend/node_modules/.prisma" ]; then
    echo -e "${BLUE}Generating Prisma Client...${NC}"
    cd apps/backend
    npm run generate
    cd ../..
fi

# Check if .env.local exists
if [ ! -f "apps/backend/.env.local" ]; then
    if [ -f "apps/backend/.env.local.example" ]; then
        echo -e "${YELLOW}⚠️  .env.local not found. Creating from example...${NC}"
        cp apps/backend/.env.local.example apps/backend/.env.local
        echo -e "${GREEN}✅ Created apps/backend/.env.local${NC}"
        echo -e "${YELLOW}⚠️  Please edit apps/backend/.env.local with your configuration${NC}\n"
    fi
fi

# Start backend
echo -e "${BLUE}Starting backend on port 5001...${NC}"
cd apps/backend
PORT=5001 npm run dev > /tmp/life-world-backend.log 2>&1 &
BACKEND_PID=$!
cd ../..

# Wait for backend to start
echo -e "${BLUE}Waiting for backend to start...${NC}"
sleep 4

# Check if backend is running
if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on http://localhost:5001${NC}"
    echo -e "${GREEN}✅ Health check: http://localhost:5001/api/health${NC}\n"
    echo -e "${BLUE}Backend PID: ${BACKEND_PID}${NC}"
    echo -e "${BLUE}Logs: tail -f /tmp/life-world-backend.log${NC}\n"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    
    # Keep script running and handle cleanup
    trap "kill $BACKEND_PID 2>/dev/null; exit" INT TERM
    wait $BACKEND_PID
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    echo -e "${YELLOW}Check logs: tail -f /tmp/life-world-backend.log${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

