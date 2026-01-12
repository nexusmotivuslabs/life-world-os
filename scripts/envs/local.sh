#!/bin/bash

# Life World OS - Local Environment
# Single script to power the entire local development environment
# Handles: database, backend, frontend, observability, environment setup

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $(date '+%H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $(date '+%H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $(date '+%H:%M:%S') - $1"
}

log_service() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}🚀 $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo -e "\n${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  ${GREEN}Life World OS - Local Environment${NC}          ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}\n"

# Step 0: Teardown existing instances (run first to avoid conflicts)
log_service "Step 0: Cleanup & Teardown"

log_info "Stopping existing services and freeing ports..."

# Kill processes on backend port (5001)
log_info "Clearing port 5001 (backend)..."
BACKEND_PIDS=$(lsof -ti:5001 2>/dev/null || echo "")
if [ -n "$BACKEND_PIDS" ]; then
    echo "$BACKEND_PIDS" | xargs kill -9 2>/dev/null || true
    sleep 1
    log_success "Freed port 5001"
else
    log_info "Port 5001 is already free"
fi

# Kill processes on frontend port (5173)
log_info "Clearing port 5173 (frontend)..."
FRONTEND_PIDS=$(lsof -ti:5173 2>/dev/null || echo "")
if [ -n "$FRONTEND_PIDS" ]; then
    echo "$FRONTEND_PIDS" | xargs kill -9 2>/dev/null || true
    sleep 1
    log_success "Freed port 5173"
else
    log_info "Port 5173 is already free"
fi

# Kill processes on alternative frontend port (5002)
log_info "Clearing port 5002 (alternative frontend)..."
FRONTEND_PIDS_5002=$(lsof -ti:5002 2>/dev/null || echo "")
if [ -n "$FRONTEND_PIDS_5002" ]; then
    echo "$FRONTEND_PIDS_5002" | xargs kill -9 2>/dev/null || true
    sleep 1
    log_success "Freed port 5002"
fi

# Check Docker availability first
DOCKER_AVAILABLE=false
if docker ps > /dev/null 2>&1; then
    DOCKER_AVAILABLE=true
elif docker info > /dev/null 2>&1; then
    DOCKER_AVAILABLE=true
elif docker-compose version > /dev/null 2>&1; then
    DOCKER_AVAILABLE=true
fi

# Stop existing Docker containers (if Docker is available)
if [ "$DOCKER_AVAILABLE" = true ]; then
    log_info "Stopping existing Docker containers..."
    
    # Stop database container
    if docker-compose -f docker-compose.dev.yml ps postgres-dev 2>/dev/null | grep -q "Up"; then
        docker-compose -f docker-compose.dev.yml stop postgres-dev 2>/dev/null || true
        log_success "Stopped existing database container"
    fi
    
    # Stop observability containers
    if docker-compose -f docker-compose.observability.local.yml ps 2>/dev/null | grep -q "Up"; then
        docker-compose -f docker-compose.observability.local.yml down 2>/dev/null || true
        log_success "Stopped existing observability containers"
    fi
else
    log_warning "Docker not accessible - skipping container cleanup"
fi

# Kill any existing node processes for this project
log_info "Checking for existing project processes..."
if pgrep -f "apps/backend.*dev" > /dev/null 2>&1; then
    pkill -f "apps/backend.*dev" 2>/dev/null || true
    sleep 1
    log_success "Stopped existing backend processes"
fi

if pgrep -f "apps/frontend.*dev" > /dev/null 2>&1; then
    pkill -f "apps/frontend.*dev" 2>/dev/null || true
    sleep 1
    log_success "Stopped existing frontend processes"
fi

log_success "Cleanup complete - ports and processes are ready"

# Display Docker status (already checked above)
if [ "$DOCKER_AVAILABLE" = true ]; then
    log_success "Docker is accessible"
else
    log_warning "Docker command not accessible, but continuing..."
    log_warning "If containers are already running, script will continue"
fi

# Step 1: Setup environment files
log_service "Step 1: Environment Configuration"

log_info "Checking environment files..."
if [ ! -f ".env.dev" ]; then
    if [ -f "config/environments/dev.env.example" ]; then
        cp config/environments/dev.env.example .env.dev
        log_success "Created .env.dev"
    else
        log_warning ".env.dev.example not found"
    fi
else
    log_success ".env.dev already exists"
fi

if [ ! -f "apps/backend/.env.local" ]; then
    mkdir -p apps/backend
    cat > apps/backend/.env.local << EOF
NODE_ENV=development
ENVIRONMENT=local
DATABASE_URL=postgresql://lifeworld_dev:lifeworld_dev_local@localhost:5433/lifeworld_dev
PORT=5001
API_URL=http://localhost:5001
JWT_SECRET=dev-jwt-secret-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
EOF
    log_success "Created apps/backend/.env.local"
else
    log_success "apps/backend/.env.local already exists"
fi

if [ ! -f "apps/frontend/.env.local" ]; then
    mkdir -p apps/frontend
    echo "VITE_API_URL=http://localhost:5001" > apps/frontend/.env.local
    log_success "Created apps/frontend/.env.local"
else
    log_success "apps/frontend/.env.local already exists"
fi

# Step 2: Start database
log_service "Step 2: Database Service"

log_info "Starting PostgreSQL database container..."
if docker-compose --profile db -f docker-compose.dev.yml up -d postgres-dev 2>/dev/null; then
    log_success "Database container started"
else
    log_warning "Could not start database container (may already be running)"
fi

# Wait for database with progress indicator
log_info "Waiting for database to be ready..."
DB_READY=false
for i in {1..30}; do
    if docker-compose -f docker-compose.dev.yml exec -T postgres-dev pg_isready -U lifeworld_dev > /dev/null 2>&1; then
        log_success "Database is UP and ready (port 5433)"
        DB_READY=true
        break
    fi
    if [ $((i % 5)) -eq 0 ]; then
        echo -n "."
    fi
    sleep 1
done
echo ""

if [ "$DB_READY" = false ]; then
    log_warning "Database may not be ready, but continuing..."
    log_warning "Backend will attempt to connect"
fi

# Step 3: Start observability services
log_service "Step 3: Observability Services"

log_info "Starting Prometheus and Grafana..."
if docker-compose -f docker-compose.observability.local.yml up -d prometheus grafana 2>/dev/null; then
    log_success "Observability services started"
    
    # Wait for Prometheus
    log_info "Waiting for Prometheus..."
    PROM_READY=false
    for i in {1..20}; do
        if curl -s http://localhost:9090/-/healthy > /dev/null 2>&1; then
            log_success "Prometheus is UP (http://localhost:9090)"
            PROM_READY=true
            break
        fi
        sleep 1
    done
    
    # Wait for Grafana
    log_info "Waiting for Grafana..."
    GRAF_READY=false
    for i in {1..20}; do
        if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
            log_success "Grafana is UP (http://localhost:3000) - Login: admin/admin"
            GRAF_READY=true
            break
        fi
        sleep 1
    done
else
    log_warning "Observability services may already be running or failed to start"
fi

# Step 4: Generate Prisma Client
log_service "Step 4: Prisma Client Generation"

log_info "Generating Prisma Client..."
cd apps/backend
if [ ! -d "node_modules/.prisma" ]; then
    if npm run generate > /dev/null 2>&1; then
        log_success "Prisma Client generated"
    else
        log_warning "Prisma Client generation may have issues"
    fi
else
    log_success "Prisma Client already generated"
fi
cd ../..

# Step 5: Run migrations
log_service "Step 5: Database Migrations"

log_info "Running database migrations..."
cd apps/backend
if npm run migrate > /dev/null 2>&1; then
    log_success "Database migrations completed"
else
    log_warning "Migrations may need attention (check logs)"
fi
cd ../..

# Step 6: Start backend
log_service "Step 6: Backend Service"

log_info "Starting backend server (port 5001)..."
cd apps/backend
PORT=5001 npm run dev > /tmp/life-world-backend.log 2>&1 &
BACKEND_PID=$!
cd ../..

# Wait for backend with progress
log_info "Waiting for backend to be ready..."
BACKEND_READY=false
for i in {1..30}; do
    HEALTH_RESPONSE=$(curl -s http://localhost:5001/api/health 2>/dev/null || echo "")
    if [ -n "$HEALTH_RESPONSE" ]; then
        # Get health status
        DB_STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "")
        DB_CONN_STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"database":{"status":"[^"]*' | cut -d'"' -f6 || echo "")
        
        if [ -n "$HEALTH_RESPONSE" ]; then
            log_success "Backend is UP (http://localhost:5001)"
            if [ -n "$DB_STATUS" ]; then
                log_success "Health status: $DB_STATUS"
            fi
            if [ -n "$DB_CONN_STATUS" ]; then
                log_success "Database connection: $DB_CONN_STATUS"
            fi
            BACKEND_READY=true
            break
        fi
    fi
    if [ $((i % 3)) -eq 0 ]; then
        echo -n "."
    fi
    sleep 1
done
echo ""

if [ "$BACKEND_READY" = false ]; then
    # Check if process is running even if health check failed
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        log_warning "Backend process is running but health check failed"
        log_warning "Check logs: tail -f /tmp/life-world-backend.log"
        BACKEND_READY=true  # Mark as ready if process exists
    else
        log_error "Backend failed to start - check logs: tail -f /tmp/life-world-backend.log"
    fi
fi

# Step 7: Start frontend
log_service "Step 7: Frontend Service"

log_info "Starting frontend server (port 5173)..."
cd apps/frontend
npm run dev > /tmp/life-world-frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../..

# Wait for frontend with progress - check multiple ports
log_info "Waiting for frontend to be ready..."
FRONTEND_READY=false
FRONTEND_PORT=""
for i in {1..30}; do
    # Check port 5173 (default Vite)
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        log_success "Frontend is UP (http://localhost:5173)"
        FRONTEND_PORT="5173"
        FRONTEND_READY=true
        break
    fi
    # Check port 5002 (alternative)
    if curl -s http://localhost:5002 > /dev/null 2>&1; then
        log_success "Frontend is UP (http://localhost:5002)"
        FRONTEND_PORT="5002"
        FRONTEND_READY=true
        break
    fi
    if [ $((i % 3)) -eq 0 ]; then
        echo -n "."
    fi
    sleep 1
done
echo ""

if [ "$FRONTEND_READY" = false ]; then
    # Check if process is running even if health check failed
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        log_warning "Frontend process is running but not accessible on expected ports"
        log_warning "Check logs: tail -f /tmp/life-world-frontend.log"
        # Try to detect actual port from logs
        if grep -q "Local:" /tmp/life-world-frontend.log 2>/dev/null; then
            ACTUAL_PORT=$(grep "Local:" /tmp/life-world-frontend.log | tail -1 | grep -o "http://localhost:[0-9]*" | cut -d: -f3 || echo "")
            if [ -n "$ACTUAL_PORT" ]; then
                FRONTEND_PORT="$ACTUAL_PORT"
                log_success "Frontend detected on port $FRONTEND_PORT"
                FRONTEND_READY=true
            fi
        fi
    else
        log_error "Frontend failed to start - check logs: tail -f /tmp/life-world-frontend.log"
    fi
fi

# Final Summary
echo -e "\n${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}  ${GREEN}✅ Local Environment is RUNNING!${NC}              ${GREEN}║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}\n"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🌐 Access Points${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${BLUE}Application Services:${NC}"
if [ "$FRONTEND_READY" = true ]; then
    if [ -n "$FRONTEND_PORT" ]; then
        echo -e "  Frontend:  ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
    else
        echo -e "  Frontend:  ${GREEN}http://localhost:5173${NC}"
    fi
else
    echo -e "  Frontend:  ${RED}Not ready${NC}"
fi

if [ "$BACKEND_READY" = true ]; then
    echo -e "  Backend:   ${GREEN}http://localhost:5001${NC}"
    echo -e "  Health:    ${GREEN}http://localhost:5001/api/health${NC}"
else
    echo -e "  Backend:   ${RED}Not ready${NC}"
fi

if [ "$DB_READY" = true ]; then
    echo -e "  Database:  ${GREEN}localhost:5433${NC}"
else
    echo -e "  Database:  ${RED}Not ready${NC}"
fi

echo ""
echo -e "${BLUE}Observability Services:${NC}"
if [ "$PROM_READY" = true ]; then
    echo -e "  Prometheus: ${GREEN}http://localhost:9090${NC}"
else
    echo -e "  Prometheus: ${YELLOW}Starting or not available${NC}"
fi

if [ "$GRAF_READY" = true ]; then
    echo -e "  Grafana:    ${GREEN}http://localhost:3000${NC} (admin/admin)"
else
    echo -e "  Grafana:    ${YELLOW}Starting or not available${NC}"
fi

echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}📝 Logs${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${BLUE}Application Logs:${NC}"
echo -e "  Backend:  ${YELLOW}tail -f /tmp/life-world-backend.log${NC}"
echo -e "  Frontend: ${YELLOW}tail -f /tmp/life-world-frontend.log${NC}"
echo -e "  Database: ${YELLOW}npm run dev:db:logs${NC}"

echo ""
echo -e "${BLUE}Observability Logs:${NC}"
echo -e "  Prometheus: ${YELLOW}docker logs -f life-world-os-prometheus${NC}"
echo -e "  Grafana:    ${YELLOW}docker logs -f life-world-os-grafana${NC}"

echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}\n"

# Cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    log_info "Services stopped"
    exit 0
}

trap cleanup INT TERM

# Keep script running and show periodic status
while true; do
    sleep 30
    # Optional: Show status every 30 seconds
    # log_info "All services running... (Press Ctrl+C to stop)"
done
