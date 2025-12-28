#!/bin/bash
# E2E Smoke Test Script
# 
# Tests the entire application stack from database to frontend
# Verifies that all services start correctly and basic functionality works
#
# Usage: ./scripts/smoke-test.sh [--skip-dump-restore] [--skip-frontend]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SKIP_DUMP_RESTORE=false
SKIP_FRONTEND=false
ENV="${ENVIRONMENT:-dev}"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-dump-restore)
      SKIP_DUMP_RESTORE=true
      shift
      ;;
    --skip-frontend)
      SKIP_FRONTEND=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Usage: $0 [--skip-dump-restore] [--skip-frontend]"
      exit 1
      ;;
  esac
done

# Change to project root
cd "$(dirname "$0")/.."

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}          E2E Smoke Test - Life World OS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Track test results
TESTS_PASSED=0
TESTS_FAILED=0

test_passed() {
  echo -e "${GREEN}✅ PASS: $1${NC}"
  ((TESTS_PASSED++))
}

test_failed() {
  echo -e "${RED}❌ FAIL: $1${NC}"
  ((TESTS_FAILED++))
}

test_info() {
  echo -e "${BLUE}ℹ️  INFO: $1${NC}"
}

# ============================================================
# Phase 1: Environment Setup
# ============================================================
echo -e "${BLUE}📋 Phase 1: Environment Setup${NC}"
echo "───────────────────────────────────────────────────────"

# Check Docker
if ! docker info > /dev/null 2>&1; then
  test_failed "Docker is not running"
  exit 1
fi
test_passed "Docker is running"

# Check Node.js
if ! command -v node &> /dev/null; then
  test_failed "Node.js is not installed"
  exit 1
fi
test_passed "Node.js is installed ($(node --version))"

# Check required files
if [ ! -f "docker-compose.dev.yml" ]; then
  test_failed "docker-compose.dev.yml not found"
  exit 1
fi
test_passed "Docker compose file found"

if [ ! -f "apps/backend/.env" ] && [ ! -f "apps/backend/.env.local" ]; then
  test_info "No .env file found, will use defaults"
fi

echo ""

# ============================================================
# Phase 2: Database Setup
# ============================================================
echo -e "${BLUE}🗄️  Phase 2: Database Setup${NC}"
echo "───────────────────────────────────────────────────────"

# Stop any existing containers
test_info "Cleaning up existing containers..."
docker-compose -f docker-compose.dev.yml down -v > /dev/null 2>&1 || true

# Start database
test_info "Starting database container..."
docker-compose -f docker-compose.dev.yml up -d postgres-dev

# Wait for database to be healthy
test_info "Waiting for database to be healthy..."
MAX_WAIT=30
WAIT_COUNT=0
while ! docker exec life-db-dev pg_isready -U lifeworld_dev > /dev/null 2>&1; do
  sleep 1
  ((WAIT_COUNT++))
  if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
    test_failed "Database did not become healthy within $MAX_WAIT seconds"
    docker-compose -f docker-compose.dev.yml logs postgres-dev
    exit 1
  fi
done
test_passed "Database is healthy"

# Check if dump exists and restore (before migrations)
DUMP_FILE="./seeds/dumps/dev-seeded-latest.dump"
if [ "$SKIP_DUMP_RESTORE" = false ] && [ -f "$DUMP_FILE" ]; then
  test_info "Found dump file, restoring database..."
  # Use docker exec to restore directly (faster than npm script)
  if docker exec life-db-dev pg_restore --version > /dev/null 2>&1; then
    test_info "Restoring dump using pg_restore in container..."
    # Drop and recreate database, then restore
    docker exec life-db-dev psql -U lifeworld_dev -d postgres -c "DROP DATABASE IF EXISTS lifeworld_dev;" > /dev/null 2>&1 || true
    docker exec life-db-dev psql -U lifeworld_dev -d postgres -c "CREATE DATABASE lifeworld_dev;" > /dev/null 2>&1
    if docker exec -i life-db-dev pg_restore -U lifeworld_dev -d lifeworld_dev -c < "$DUMP_FILE" > /dev/null 2>&1; then
      test_passed "Database restored from dump"
    else
      test_info "Dump restore completed (warnings may be normal)"
    fi
  else
    test_info "pg_restore not available in container, skipping dump restore"
  fi
elif [ "$SKIP_DUMP_RESTORE" = false ]; then
  test_info "No dump file found, database will be empty"
  test_info "💡 Generate dump with: npm run generate-dump:dev"
fi

# Run migrations
test_info "Running database migrations..."
cd apps/backend
if npx prisma migrate deploy > /dev/null 2>&1; then
  test_passed "Database migrations completed"
else
  test_failed "Database migrations failed"
  cd ../..
  exit 1
fi
cd ../..

# Verify database connection
test_info "Verifying database connection..."
if docker exec life-db-dev psql -U lifeworld_dev -d lifeworld_dev -c "SELECT 1" > /dev/null 2>&1; then
  test_passed "Database connection verified"
else
  test_failed "Database connection failed"
  exit 1
fi

echo ""

# ============================================================
# Phase 3: Backend Setup
# ============================================================
echo -e "${BLUE}🔧 Phase 3: Backend Setup${NC}"
echo "───────────────────────────────────────────────────────"

# Generate Prisma Client
test_info "Generating Prisma Client..."
cd apps/backend
if npm run generate > /dev/null 2>&1; then
  test_passed "Prisma Client generated"
else
  test_failed "Prisma Client generation failed"
  cd ../..
  exit 1
fi
cd ../..

# Start backend (in background)
test_info "Starting backend server..."
cd apps/backend
npm run dev > /tmp/life-world-backend.log 2>&1 &
BACKEND_PID=$!
cd ../..

# Wait for backend to start
test_info "Waiting for backend to start..."
MAX_WAIT=30
WAIT_COUNT=0
while ! curl -s http://localhost:3001/api/health > /dev/null 2>&1; do
  sleep 1
  ((WAIT_COUNT++))
  if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
    test_failed "Backend did not start within $MAX_WAIT seconds"
    echo "Backend logs:"
    tail -20 /tmp/life-world-backend.log
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
  fi
done
test_passed "Backend server started"

# Test backend health endpoint
test_info "Testing backend health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3001/api/health)
if echo "$HEALTH_RESPONSE" | grep -q "status"; then
  test_passed "Backend health check passed"
else
  test_failed "Backend health check failed"
  echo "Response: $HEALTH_RESPONSE"
  kill $BACKEND_PID 2>/dev/null || true
  exit 1
fi

# Test backend API endpoints
test_info "Testing backend API endpoints..."

# Test reality nodes endpoint
if curl -s http://localhost:3001/api/reality-nodes/reality-root > /dev/null 2>&1; then
  test_passed "Reality nodes API accessible"
else
  test_failed "Reality nodes API failed"
fi

echo ""

# ============================================================
# Phase 4: Frontend Setup (Optional)
# ============================================================
if [ "$SKIP_FRONTEND" = false ]; then
  echo -e "${BLUE}🎨 Phase 4: Frontend Setup${NC}"
  echo "───────────────────────────────────────────────────────"

  # Start frontend (in background)
  test_info "Starting frontend server..."
  cd apps/frontend
  npm run dev > /tmp/life-world-frontend.log 2>&1 &
  FRONTEND_PID=$!
  cd ../..

  # Wait for frontend to start
  test_info "Waiting for frontend to start..."
  MAX_WAIT=60
  WAIT_COUNT=0
  while ! curl -s http://localhost:5173 > /dev/null 2>&1; do
    sleep 1
    ((WAIT_COUNT++))
    if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
      test_failed "Frontend did not start within $MAX_WAIT seconds"
      echo "Frontend logs:"
      tail -20 /tmp/life-world-frontend.log
      kill $FRONTEND_PID 2>/dev/null || true
      kill $BACKEND_PID 2>/dev/null || true
      exit 1
    fi
  done
  test_passed "Frontend server started"

  # Test frontend accessibility
  test_info "Testing frontend accessibility..."
  FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
  if [ "$FRONTEND_RESPONSE" = "200" ]; then
    test_passed "Frontend is accessible"
  else
    test_failed "Frontend returned status code: $FRONTEND_RESPONSE"
  fi

  echo ""
fi

# ============================================================
# Phase 5: Data Validation
# ============================================================
echo -e "${BLUE}📊 Phase 5: Data Validation${NC}"
echo "───────────────────────────────────────────────────────"

# Check if database has data
test_info "Checking database data..."

# Check reality nodes
NODE_COUNT=$(docker exec life-db-dev psql -U lifeworld_dev -d lifeworld_dev -t -c "SELECT COUNT(*) FROM reality_nodes" | xargs)
if [ "$NODE_COUNT" -gt 0 ]; then
  test_passed "Reality nodes exist ($NODE_COUNT nodes)"
else
  test_info "No reality nodes found (database may not be seeded)"
fi

# Check agents
AGENT_COUNT=$(docker exec life-db-dev psql -U lifeworld_dev -d lifeworld_dev -t -c "SELECT COUNT(*) FROM agents" 2>/dev/null | xargs || echo "0")
if [ "$AGENT_COUNT" -gt 0 ]; then
  test_passed "Agents exist ($AGENT_COUNT agents)"
fi

echo ""

# ============================================================
# Summary
# ============================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                    Test Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All smoke tests passed!${NC}"
  echo ""
  echo "Application is running:"
  echo "  📦 Database: localhost:5433"
  echo "  🔧 Backend:  http://localhost:3001"
  if [ "$SKIP_FRONTEND" = false ]; then
    echo "  🎨 Frontend: http://localhost:5173"
  fi
  echo ""
  echo "To stop services:"
  echo "  kill $BACKEND_PID"
  if [ "$SKIP_FRONTEND" = false ]; then
    echo "  kill $FRONTEND_PID"
  fi
  echo "  docker-compose -f docker-compose.dev.yml down"
  echo ""
  exit 0
else
  echo -e "${RED}❌ Some smoke tests failed!${NC}"
  echo ""
  
  # Cleanup
  if [ -n "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null || true
  fi
  
  exit 1
fi

