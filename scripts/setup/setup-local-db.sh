#!/bin/bash

# Life World OS - Local Database Setup Script
# This script sets up the local database connection for development

set -e

echo "🌍 Life World OS - Local Database Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if .env.dev exists
if [ ! -f .env.dev ]; then
    echo -e "${YELLOW}⚠️  .env.dev file not found. Creating from template...${NC}"
    if [ -f config/environments/dev.env.example ]; then
        cp config/environments/dev.env.example .env.dev
        echo -e "${GREEN}✅ Created .env.dev from template${NC}"
    else
        echo -e "${RED}❌ config/environments/dev.env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env.dev file exists${NC}"
fi

# Check backend .env.local
if [ ! -f apps/backend/.env.local ]; then
    echo -e "${YELLOW}⚠️  apps/backend/.env.local not found. Creating...${NC}"
    mkdir -p apps/backend
    cat > apps/backend/.env.local << EOF
# Local Development Environment
NODE_ENV=development
ENVIRONMENT=local

# Database Configuration (connects to dev database)
DATABASE_URL=postgresql://lifeworld_dev:lifeworld_dev_local@localhost:5433/lifeworld_dev

# Backend Configuration
PORT=5001
API_URL=http://localhost:5001

# Authentication
JWT_SECRET=dev-jwt-secret-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# AI Services (optional)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
EOF
    echo -e "${GREEN}✅ Created apps/backend/.env.local${NC}"
else
    echo -e "${GREEN}✅ apps/backend/.env.local exists${NC}"
fi

# Check frontend .env.local
if [ ! -f apps/frontend/.env.local ]; then
    echo -e "${YELLOW}⚠️  apps/frontend/.env.local not found. Creating...${NC}"
    mkdir -p apps/frontend
    cat > apps/frontend/.env.local << EOF
# Local Development Environment
VITE_API_URL=http://localhost:5001
EOF
    echo -e "${GREEN}✅ Created apps/frontend/.env.local${NC}"
else
    echo -e "${GREEN}✅ apps/frontend/.env.local exists${NC}"
fi

echo ""
echo "📦 Starting PostgreSQL database..."
npm run dev:db

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Check if database is ready
until docker-compose -f docker-compose.dev.yml exec -T postgres-dev pg_isready -U lifeworld_dev > /dev/null 2>&1; do
    echo "   Still waiting..."
    sleep 2
done

echo -e "${GREEN}✅ Database is ready${NC}"

echo ""
echo "🔧 Generating Prisma Client..."
cd apps/backend
npm run generate
cd ../..

echo ""
echo -e "${BLUE}📊 Database Status:${NC}"
docker-compose -f docker-compose.dev.yml ps postgres-dev

echo ""
echo -e "${GREEN}✅ Local database setup complete!${NC}"
echo ""
echo "To start development:"
echo "  npm run dev:local     - Start DB + Backend + Frontend"
echo "  npm run dev:backend  - Start backend only (port 5001)"
echo "  npm run dev:frontend - Start frontend only (port 5173)"
echo ""
echo "Database management:"
echo "  npm run studio       - Open Prisma Studio"
echo "  npm run seed:dev     - Seed dev database"
echo "  npm run dev:db:logs  - View database logs"
echo "  npm run dev:db:down  - Stop database"
echo ""

