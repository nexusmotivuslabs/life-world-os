#!/bin/bash

# Life World OS - Local Lite (UI, Backend, DB only — no observability)
# All optional dependencies supported: OAuth (Google), AI (Ollama/GROQ/OpenAI), etc.
# Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, API keys to apps/backend/.env.local as needed.

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC} $(date '+%H:%M:%S') - $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $(date '+%H:%M:%S') - $1"; }
log_warning() { echo -e "${YELLOW}[⚠]${NC} $(date '+%H:%M:%S') - $1"; }
log_error()   { echo -e "${RED}[✗]${NC} $(date '+%H:%M:%S') - $1"; }
log_service() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}🚀 $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "\n${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  ${GREEN}Life World OS - Local Lite${NC} (UI, Backend, DB)  ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}\n"

# Step 0: Cleanup
log_service "Step 0: Cleanup & Teardown"
for PORT in 5001 5173 5002; do
    PIDS=$(lsof -ti:$PORT 2>/dev/null || echo "")
    [ -n "$PIDS" ] && echo "$PIDS" | xargs kill -9 2>/dev/null || true
    sleep 1
done
DOCKER_AVAILABLE=false
docker ps >/dev/null 2>&1 || docker info >/dev/null 2>&1 || docker-compose version >/dev/null 2>&1 && DOCKER_AVAILABLE=true
if [ "$DOCKER_AVAILABLE" = true ]; then
    if docker-compose -f docker-compose.dev.yml ps postgres-dev 2>/dev/null | grep -q "Up"; then
        docker-compose -f docker-compose.dev.yml stop postgres-dev 2>/dev/null || true
        log_success "Stopped existing database container"
    fi
fi
pgrep -f "apps/backend.*dev"  >/dev/null 2>&1 && pkill -f "apps/backend.*dev"  2>/dev/null || true
pgrep -f "apps/frontend.*dev" >/dev/null 2>&1 && pkill -f "apps/frontend.*dev" 2>/dev/null || true
sleep 1
log_success "Cleanup complete"

# Step 1: Environment (support OAuth, AI, etc. — create only if missing)
log_service "Step 1: Environment Configuration"
[ ! -f ".env.dev" ] && [ -f "config/environments/dev.env.example" ] && cp config/environments/dev.env.example .env.dev && log_success "Created .env.dev" || true

if [ ! -f "apps/backend/.env.local" ]; then
    mkdir -p apps/backend
    cat > apps/backend/.env.local << 'ENVEOF'
# Local Lite - add OAuth/AI keys here; all optional deps supported
NODE_ENV=development
ENVIRONMENT=local
DATABASE_URL=postgresql://lifeworld_dev:lifeworld_dev_local@localhost:5433/lifeworld_dev
PORT=5001
API_URL=http://localhost:5001
JWT_SECRET=dev-jwt-secret-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# OAuth (optional - add for Google sign-in)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI (optional - Ollama local, or GROQ/OpenAI)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
GROQ_API_KEY=
OPENAI_API_KEY=

LOG_LEVEL=debug
ENVEOF
    log_success "Created apps/backend/.env.local (add GOOGLE_CLIENT_ID etc. for OAuth)"
else
    log_success "apps/backend/.env.local exists (OAuth/AI keys preserved)"
fi

if [ ! -f "apps/frontend/.env.local" ]; then
    mkdir -p apps/frontend
    # Empty VITE_API_URL = relative URLs (proxy in dev); enables LAN access from other devices
    touch apps/frontend/.env.local
    log_success "Created apps/frontend/.env.local"
else
    log_success "apps/frontend/.env.local exists"
fi

# Step 2: Database
log_service "Step 2: Database Service"
log_info "Starting PostgreSQL (Docker)..."
if docker-compose --profile db -f docker-compose.dev.yml up -d postgres-dev 2>/dev/null; then
    log_success "Database container started"
else
    log_warning "Could not start database (may already be running)"
fi

log_info "Waiting for database..."
DB_READY=false
for i in {1..30}; do
    if docker-compose -f docker-compose.dev.yml exec -T postgres-dev pg_isready -U lifeworld_dev >/dev/null 2>&1; then
        log_success "Database is UP (port 5433)"
        DB_READY=true
        break
    fi
    [ $((i % 5)) -eq 0 ] && echo -n "."
    sleep 1
done
echo ""
[ "$DB_READY" = false ] && log_warning "Database may not be ready; backend will retry."

# Step 3: Prisma
log_service "Step 3: Prisma Client Generation"
cd apps/backend
if [ ! -d "node_modules/.prisma" ]; then
    npm run generate >/dev/null 2>&1 && log_success "Prisma Client generated" || log_warning "Prisma generate had issues"
else
    log_success "Prisma Client already generated"
fi
cd ../..

# Step 4: Schema Sync (migrations with db push fallback — local mirrors production schema)
log_service "Step 4: Database Schema Sync"
cd apps/backend
if npm run migrate >/dev/null 2>&1; then
    log_success "Migrations completed"
else
    log_warning "Migrations failed; falling back to db push to ensure schema is in sync"
    npx prisma db push >/dev/null 2>&1 && log_success "Schema synced via db push" || log_warning "Schema sync may need manual attention"
fi
cd ../..

# Step 5: Backend
log_service "Step 5: Backend Service"
log_info "Starting backend (port 5001)..."
cd apps/backend
PORT=5001 npm run dev > /tmp/life-world-backend.log 2>&1 &
BACKEND_PID=$!
cd ../..

log_info "Waiting for backend..."
BACKEND_READY=false
for i in {1..30}; do
    if curl -s http://localhost:5001/api/health >/dev/null 2>&1; then
        log_success "Backend is UP (http://localhost:5001)"
        BACKEND_READY=true
        break
    fi
    [ $((i % 3)) -eq 0 ] && echo -n "."
    sleep 1
done
echo ""
if [ "$BACKEND_READY" = false ]; then
    ps -p $BACKEND_PID >/dev/null 2>&1 && log_warning "Backend process running; check: tail -f /tmp/life-world-backend.log" || log_error "Backend failed - see /tmp/life-world-backend.log"
fi

# Step 6: Frontend
log_service "Step 6: Frontend Service"
log_info "Starting frontend..."
cd apps/frontend
npm run dev > /tmp/life-world-frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../..

log_info "Waiting for frontend..."
FRONTEND_READY=false
FRONTEND_PORT="5173"
for i in {1..30}; do
    if curl -s http://localhost:5002 >/dev/null 2>&1; then
        FRONTEND_PORT="5002"
        FRONTEND_READY=true
        break
    fi
    if curl -s http://localhost:5173 >/dev/null 2>&1; then
        FRONTEND_PORT="5173"
        FRONTEND_READY=true
        break
    fi
    [ $((i % 3)) -eq 0 ] && echo -n "."
    sleep 1
done
echo ""
if [ "$FRONTEND_READY" = true ]; then
    log_success "Frontend is UP (http://localhost:$FRONTEND_PORT)"
else
    if ps -p $FRONTEND_PID >/dev/null 2>&1; then
        log_warning "Frontend process running; check: tail -f /tmp/life-world-frontend.log"
        grep -q "Local:" /tmp/life-world-frontend.log 2>/dev/null && FRONTEND_PORT=$(grep "Local:" /tmp/life-world-frontend.log | tail -1 | grep -o "http://localhost:[0-9]*" | cut -d: -f3 || echo "5173")
    else
        log_error "Frontend failed - see /tmp/life-world-frontend.log"
    fi
fi

# Detect LAN IP for network access
LOCAL_IP=""
if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "")
fi

# Summary
echo -e "\n${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}  ${GREEN}✅ Local Lite is RUNNING!${NC}                      ${GREEN}║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}\n"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🌐 Access${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo -e "  Frontend:  ${GREEN}http://localhost:${FRONTEND_PORT}${NC}"
echo -e "  Backend:   ${GREEN}http://localhost:5001${NC}"
echo -e "  Health:    ${GREEN}http://localhost:5001/api/health${NC}"
echo -e "  Database:  ${GREEN}localhost:5433${NC}"
if [ -n "$LOCAL_IP" ]; then
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}📱 Same Network (phones, tablets, other PCs)${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    echo -e "  Frontend:  ${GREEN}http://${LOCAL_IP}:${FRONTEND_PORT}${NC}"
    echo -e "  Health:    ${GREEN}http://${LOCAL_IP}:5001/api/health${NC}"
    echo -e "\n  ${YELLOW}Ensure devices are on the same WiFi.${NC}"
    echo -e "  ${YELLOW}Tip: Remove VITE_API_URL from apps/frontend/.env.local if API calls fail.${NC}"
fi
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}📟 Backend & frontend logs (live below)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"

cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    log_info "Stopped backend and frontend"
    exit 0
}
trap cleanup INT TERM

# Stream backend and frontend logs so you see them running
tail -f /tmp/life-world-backend.log /tmp/life-world-frontend.log 2>/dev/null || while true; do sleep 30; done
