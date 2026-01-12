#!/bin/bash

# Run E2E Tests for Local Environment
# This script sets up the local environment and runs E2E tests

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Life World OS - E2E Test Runner (Local)${NC}"
echo "=========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Step 1: Setup database and environment
echo -e "${BLUE}📦 Step 1: Setting up database and environment...${NC}"
if [ -f "./scripts/setup-local-db.sh" ]; then
    ./scripts/setup-local-db.sh
else
    echo -e "${YELLOW}⚠️  Setup script not found, starting database manually...${NC}"
    npm run dev:db
    sleep 5
fi

# Step 2: Check if services are already running
echo ""
echo -e "${BLUE}🔍 Step 2: Checking if services are running...${NC}"

# Check database
if docker-compose -f docker-compose.dev.yml ps postgres-dev | grep -q "Up"; then
    echo -e "${GREEN}✅ Database is running${NC}"
else
    echo -e "${YELLOW}⚠️  Starting database...${NC}"
    npm run dev:db
    sleep 5
fi

# Check backend
if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
    BACKEND_RUNNING=true
else
    echo -e "${YELLOW}⚠️  Backend is not running${NC}"
    BACKEND_RUNNING=false
fi

# Check frontend
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
    FRONTEND_RUNNING=true
else
    echo -e "${YELLOW}⚠️  Frontend is not running${NC}"
    FRONTEND_RUNNING=false
fi

# Step 3: Start services if needed
if [ "$BACKEND_RUNNING" = false ] || [ "$FRONTEND_RUNNING" = false ]; then
    echo ""
    echo -e "${BLUE}🚀 Step 3: Starting services...${NC}"
    
    if [ "$BACKEND_RUNNING" = false ] && [ "$FRONTEND_RUNNING" = false ]; then
        echo -e "${YELLOW}Starting backend and frontend in background...${NC}"
        echo -e "${YELLOW}Note: Services will continue running after tests complete${NC}"
        echo ""
        
        # Start backend in background
        cd apps/backend
        PORT=5001 npm run dev > /tmp/life-world-backend.log 2>&1 &
        BACKEND_PID=$!
        cd ../..
        
        # Wait for backend
        echo "Waiting for backend to start..."
        for i in {1..30}; do
            if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Backend is ready${NC}"
                break
            fi
            sleep 1
        done
        
        # Start frontend in background
        cd apps/frontend
        npm run dev > /tmp/life-world-frontend.log 2>&1 &
        FRONTEND_PID=$!
        cd ../..
        
        # Wait for frontend
        echo "Waiting for frontend to start..."
        for i in {1..60}; do
            if curl -s http://localhost:5173 > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Frontend is ready${NC}"
                break
            fi
            sleep 1
        done
        
        # Cleanup function
        cleanup() {
            echo ""
            echo -e "${YELLOW}Cleaning up background processes...${NC}"
            kill $BACKEND_PID 2>/dev/null || true
            kill $FRONTEND_PID 2>/dev/null || true
        }
        trap cleanup EXIT INT TERM
    fi
fi

# Step 4: Verify services are ready
echo ""
echo -e "${BLUE}✅ Step 4: Verifying services are ready...${NC}"

# Check backend health
BACKEND_HEALTHY=false
for i in {1..10}; do
    if curl -s http://localhost:5001/api/health | grep -q '"status":"ok"'; then
        BACKEND_HEALTHY=true
        break
    fi
    sleep 1
done

if [ "$BACKEND_HEALTHY" = true ]; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo "Backend logs:"
    tail -20 /tmp/life-world-backend.log 2>/dev/null || echo "No logs available"
    exit 1
fi

# Check frontend
FRONTEND_READY=false
for i in {1..10}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        FRONTEND_READY=true
        break
    fi
    sleep 1
done

if [ "$FRONTEND_READY" = true ]; then
    echo -e "${GREEN}✅ Frontend is ready${NC}"
else
    echo -e "${RED}❌ Frontend is not responding${NC}"
    echo "Frontend logs:"
    tail -20 /tmp/life-world-frontend.log 2>/dev/null || echo "No logs available"
    exit 1
fi

# Step 5: Run E2E tests
echo ""
echo -e "${BLUE}🧪 Step 5: Running E2E tests...${NC}"
echo ""

# Set environment variable for backend URL
export BACKEND_URL=http://localhost:5001

# Run Playwright tests
npx playwright test

TEST_EXIT_CODE=$?

# Step 6: Show results
echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ All E2E tests passed!${NC}"
    echo ""
    echo "To view the test report:"
    echo "  npm run test:e2e:report"
else
    echo -e "${RED}❌ Some E2E tests failed${NC}"
    echo ""
    echo "To view the test report:"
    echo "  npm run test:e2e:report"
    echo ""
    echo "To debug, run with UI:"
    echo "  npm run test:e2e:ui"
fi

exit $TEST_EXIT_CODE

