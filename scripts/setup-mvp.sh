#!/bin/bash
# MVP Setup Script - In-Home WiFi Access
# Quick setup for local deployment

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Life World OS - MVP Setup ===${NC}\n"
echo -e "${BLUE}Setting up local deployment for in-home WiFi access${NC}\n"

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
  exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}❌ Node.js version 18+ required. Current: $(node -v)${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
  echo -e "${RED}❌ npm not found${NC}"
  exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
  echo -e "${YELLOW}⚠️  Docker not found. You'll need to install PostgreSQL manually${NC}"
  DOCKER_AVAILABLE=false
else
  echo -e "${GREEN}✅ Docker $(docker --version)${NC}"
  DOCKER_AVAILABLE=true
fi

echo ""

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"

# Root dependencies
if [ -f "package.json" ]; then
  echo -e "${BLUE}Installing root dependencies...${NC}"
  npm install
fi

# Backend dependencies
if [ -d "apps/backend" ]; then
  echo -e "${BLUE}Installing backend dependencies...${NC}"
  cd apps/backend
  npm install
  cd ../..
fi

# Frontend dependencies
if [ -d "apps/frontend" ]; then
  echo -e "${BLUE}Installing frontend dependencies...${NC}"
  cd apps/frontend
  npm install
  cd ../..
fi

echo -e "${GREEN}✅ Dependencies installed${NC}\n"

# Setup environment files
echo -e "${BLUE}Setting up environment files...${NC}"

# Backend .env
if [ ! -f "apps/backend/.env" ]; then
  echo -e "${BLUE}Creating apps/backend/.env...${NC}"
  cat > apps/backend/.env <<EOF
# Database
DATABASE_URL=postgresql://lifeworld_dev:lifeworld_dev_local@localhost:5433/lifeworld_dev

# JWT Authentication
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d

# Server
NODE_ENV=development
PORT=3001

# Optional: LLM for Travel System
# GROQ_API_KEY=your-groq-api-key-here
# USE_LLM_FOR_LOCATIONS=true
EOF
  echo -e "${GREEN}✅ Created apps/backend/.env${NC}"
else
  echo -e "${YELLOW}⚠️  apps/backend/.env already exists${NC}"
fi

# Frontend .env
if [ ! -f "apps/frontend/.env" ]; then
  echo -e "${BLUE}Creating apps/frontend/.env...${NC}"
  cat > apps/frontend/.env <<EOF
VITE_API_URL=http://localhost:3001
EOF
  echo -e "${GREEN}✅ Created apps/frontend/.env${NC}"
else
  echo -e "${YELLOW}⚠️  apps/frontend/.env already exists${NC}"
fi

echo ""

# Start database
if [ "$DOCKER_AVAILABLE" = true ]; then
  echo -e "${BLUE}Starting PostgreSQL database...${NC}"
  
  # Check if already running
  if docker ps | grep -q "life-world-os-db-dev"; then
    echo -e "${YELLOW}⚠️  Database already running${NC}"
  else
    docker-compose -f docker-compose.dev.yml up -d postgres-dev
    echo -e "${GREEN}✅ Database started${NC}"
    
    # Wait for database to be ready
    echo -e "${BLUE}Waiting for database to be ready...${NC}"
    sleep 5
  fi
else
  echo -e "${YELLOW}⚠️  Docker not available. Please start PostgreSQL manually${NC}"
fi

echo ""

# Run migrations
if [ -d "apps/backend" ]; then
  echo -e "${BLUE}Running database migrations...${NC}"
  cd apps/backend
  
  # Generate Prisma client
  npx prisma generate
  
  # Run migrations
  npx prisma migrate dev --name mvp_setup || echo -e "${YELLOW}⚠️  Migrations may have already run${NC}"
  
  cd ../..
  echo -e "${GREEN}✅ Database migrations completed${NC}"
fi

echo ""

# Get local IP address
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n1)
if [ -z "$LOCAL_IP" ]; then
  LOCAL_IP="[your-local-ip]"
fi

echo -e "${GREEN}✅ MVP setup complete!${NC}\n"
echo -e "${BLUE}=== Next Steps ===${NC}\n"
echo -e "1. Start backend:"
echo -e "   ${GREEN}cd apps/backend && npm run dev${NC}\n"
echo -e "2. Start frontend (in new terminal):"
echo -e "   ${GREEN}cd apps/frontend && npm run dev${NC}\n"
echo -e "3. Access application:"
echo -e "   ${GREEN}Local:${NC} http://localhost:5173"
echo -e "   ${GREEN}Network:${NC} http://${LOCAL_IP}:5173\n"
echo -e "${BLUE}=== Cost ===${NC}"
echo -e "${GREEN}Total: \$0/month (local deployment)${NC}\n"
echo -e "${BLUE}For more details, see:${NC}"
echo -e "  - ${GREEN}docs/MVP_DEPLOYMENT_GUIDE.md${NC}"
echo -e "  - ${GREEN}dev-hub/domains/platform-engineering/implementation/deployment-strategy.md${NC}\n"


