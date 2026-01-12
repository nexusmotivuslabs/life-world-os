#!/bin/bash

# Life World OS - Dev Environment
# Single script to power the entire dev environment (Docker-based)
# Handles: database, backend, frontend, dev-hub, observability

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo -e "${BLUE}=== Life World OS - Dev Environment ===${NC}\n"

# Check prerequisites
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Get version information
echo -e "${BLUE}📦 Getting version information...${NC}"
VERSION_INFO=$(node "$SCRIPT_DIR/../utils/get-version.js" dev 2>/dev/null || echo '{"version":"dev","commit":"local","branch":"main"}')
VERSION=$(echo "$VERSION_INFO" | grep -o '"version":"[^"]*' | cut -d'"' -f4 || echo "dev")
COMMIT=$(echo "$VERSION_INFO" | grep -o '"commit":"[^"]*' | cut -d'"' -f4 || echo "local")

export BUILD_VERSION=$VERSION
export BUILD_COMMIT=$COMMIT
export BUILD_BRANCH=${BUILD_BRANCH:-main}
export BUILD_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo -e "${GREEN}Version: ${VERSION}${NC}"
echo -e "${GREEN}Commit: ${COMMIT}${NC}\n"

# Step 1: Setup environment
echo -e "${BLUE}📋 Step 1: Setting up environment...${NC}"
if [ ! -f ".env.dev" ]; then
    if [ -f "config/environments/dev.env.example" ]; then
        cp config/environments/dev.env.example .env.dev
        echo -e "${GREEN}✅ Created .env.dev${NC}"
        echo -e "${YELLOW}⚠️  Please update .env.dev with your values!${NC}"
    else
        echo -e "${RED}❌ config/environments/dev.env.example not found${NC}"
        exit 1
    fi
fi

# Load environment variables
if [ -f ".env.dev" ]; then
    set -a
    source .env.dev
    set +a
fi

# Step 2: Stop existing containers
echo -e "\n${BLUE}🛑 Step 2: Stopping existing containers...${NC}"
docker-compose -f docker-compose.dev.yml down 2>/dev/null || true

# Step 3: Start database
echo -e "\n${BLUE}🗄️  Step 3: Starting database...${NC}"
docker-compose --profile db -f docker-compose.dev.yml up -d postgres-dev

# Wait for database
echo "⏳ Waiting for database..."
for i in {1..30}; do
    if docker-compose -f docker-compose.dev.yml exec -T postgres-dev pg_isready -U lifeworld_dev > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is ready${NC}"
        break
    fi
    sleep 1
done

# Step 4: Run migrations and seed
echo -e "\n${BLUE}📊 Step 4: Setting up database...${NC}"
cd apps/backend
npm run generate > /dev/null 2>&1 || true
npm run migrate > /dev/null 2>&1 || echo -e "${YELLOW}⚠️  Migrations may need attention${NC}"
if [ -f "$SCRIPT_DIR/../utils/seed-dev.sh" ]; then
    "$SCRIPT_DIR/../utils/seed-dev.sh" || echo -e "${YELLOW}⚠️  Seeding may need attention${NC}"
fi
cd ../..

# Step 5: Start all services
echo -e "\n${BLUE}🚀 Step 5: Starting all services...${NC}"
docker-compose --profile full -f docker-compose.dev.yml up -d

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check services
for i in {1..30}; do
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready${NC}"
        break
    fi
    sleep 1
done

# Summary
echo -e "\n${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}  ${GREEN}✅ Dev Environment is RUNNING!${NC}                ${GREEN}║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}\n"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🌐 Access Points${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${BLUE}Application Services:${NC}"
echo -e "  Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "  Backend:  ${GREEN}http://localhost:3001${NC}"
echo -e "  Health:   ${GREEN}http://localhost:3001/api/health${NC}"

echo ""
echo -e "${BLUE}Management Services:${NC}"
echo -e "  Dev Hub:  ${GREEN}http://nexus.devhub.com:8080${NC}"

echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}📝 Logs${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${BLUE}Application Logs:${NC}"
echo -e "  All Services: ${YELLOW}docker-compose -f docker-compose.dev.yml logs -f${NC}"
echo -e "  Backend:      ${YELLOW}docker-compose -f docker-compose.dev.yml logs -f backend-dev${NC}"
echo -e "  Frontend:     ${YELLOW}docker-compose -f docker-compose.dev.yml logs -f frontend-dev${NC}"
echo -e "  Database:     ${YELLOW}docker-compose -f docker-compose.dev.yml logs -f postgres-dev${NC}"

echo ""
echo -e "${BLUE}Management Commands:${NC}"
echo -e "  Status: ${YELLOW}docker-compose -f docker-compose.dev.yml ps${NC}"
echo -e "  Stop:   ${YELLOW}docker-compose -f docker-compose.dev.yml down${NC}"

