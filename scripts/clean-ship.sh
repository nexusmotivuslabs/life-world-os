#!/bin/bash

# Clean Ship - Complete Docker Cleanup Script
# Safely removes all containers, images, volumes, and networks
# Only runs when containers <= 1 (safety check)

# Don't use set -e, we want to handle errors manually for verification

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Life World OS - Clean Ship ===${NC}\n"

# Check Docker is running
echo -e "${BLUE}1. Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo -e "${YELLOW}   Please start Docker Desktop and try again${NC}\n"
    exit 1
else
    echo -e "${GREEN}✅ Docker is running${NC}\n"
fi

# Safety check: Count running containers
echo -e "${BLUE}2. Safety check: Counting running containers...${NC}"
RUNNING_CONTAINERS=$(docker ps -q | wc -l | tr -d ' ')
echo -e "${BLUE}   Found ${RUNNING_CONTAINERS} running container(s)${NC}"

if [ "$RUNNING_CONTAINERS" -gt 1 ]; then
    echo -e "${RED}❌ Safety check failed: ${RUNNING_CONTAINERS} containers running${NC}"
    echo -e "${YELLOW}   This script only runs when 1 or fewer containers are running${NC}"
    echo -e "${YELLOW}   Please stop containers manually first, or use with caution${NC}\n"
    echo -e "${BLUE}Running containers:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo
    read -p "Force cleanup anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}⚠️  Cleanup cancelled${NC}\n"
        exit 0
    fi
    echo -e "${YELLOW}⚠️  Proceeding with force cleanup...${NC}\n"
else
    echo -e "${GREEN}✅ Safety check passed (${RUNNING_CONTAINERS} container(s) running)${NC}\n"
fi

# Get script directory and change to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}3. Stopping all containers from docker-compose files...${NC}"

# List of all docker-compose files
COMPOSE_FILES=(
    "docker-compose.yml"
    "docker-compose.dev.yml"
    "docker-compose.domains.yml"
    "docker-compose.staging.yml"
    "docker-compose.prod.yml"
    "docker-compose.dns.yml"
    "docker-compose.dns-alt.yml"
    "docker-compose.observability.local.yml"
    "docker-compose.portainer.yml"
    "apps/dev-hub-app/docker-compose.yml"
)

# Stop and remove containers from all compose files
for compose_file in "${COMPOSE_FILES[@]}"; do
    if [ -f "$compose_file" ]; then
        echo -e "${BLUE}   Cleaning up: ${compose_file}${NC}"
        docker-compose -f "$compose_file" down -v --remove-orphans 2>/dev/null || true
    fi
done

echo -e "${GREEN}✅ All compose projects cleaned${NC}\n"

# Stop any remaining running containers
echo -e "${BLUE}4. Stopping all remaining containers...${NC}"
RUNNING=$(docker ps -q)
if [ -n "$RUNNING" ]; then
    echo "$RUNNING" | xargs docker stop 2>/dev/null || true
    echo -e "${GREEN}✅ Stopped remaining containers${NC}\n"
else
    echo -e "${GREEN}✅ No remaining containers to stop${NC}\n"
fi

# Remove all stopped containers
echo -e "${BLUE}5. Removing all stopped containers...${NC}"
STOPPED=$(docker ps -aq)
if [ -n "$STOPPED" ]; then
    echo "$STOPPED" | xargs docker rm 2>/dev/null || true
    echo -e "${GREEN}✅ Removed stopped containers${NC}\n"
else
    echo -e "${GREEN}✅ No stopped containers to remove${NC}\n"
fi

# Remove all images
echo -e "${BLUE}6. Removing all Docker images...${NC}"
IMAGES=$(docker images -q)
if [ -n "$IMAGES" ]; then
    docker rmi -f $IMAGES 2>/dev/null || true
    echo -e "${GREEN}✅ Removed all images${NC}\n"
else
    echo -e "${GREEN}✅ No images to remove${NC}\n"
fi

# Remove all volumes (optional - uncomment if you want to delete volumes)
echo -e "${BLUE}7. Cleaning up volumes...${NC}"
VOLUMES=$(docker volume ls -q)
if [ -n "$VOLUMES" ]; then
    docker volume rm $VOLUMES 2>/dev/null || true
    echo -e "${GREEN}✅ Removed unused volumes${NC}\n"
else
    echo -e "${GREEN}✅ No volumes to remove${NC}\n"
fi

# Remove all networks (except defaults)
echo -e "${BLUE}8. Cleaning up networks...${NC}"
NETWORKS=$(docker network ls -q --filter "type=custom")
if [ -n "$NETWORKS" ]; then
    echo "$NETWORKS" | xargs docker network rm 2>/dev/null || true
    echo -e "${GREEN}✅ Removed custom networks${NC}\n"
else
    echo -e "${GREEN}✅ No custom networks to remove${NC}\n"
fi

# Optional: System prune (commented out by default - very aggressive)
# Uncomment if you want to remove everything including build cache
# echo -e "${BLUE}9. System prune (build cache, etc.)...${NC}"
# docker system prune -a --volumes -f 2>/dev/null || true
# echo -e "${GREEN}✅ System prune complete${NC}\n"

# Verification: Check if cleanup was complete
echo -e "${BLUE}9. Verifying cleanup...${NC}"
VERIFICATION_FAILED=false

# Check for containers
CONTAINERS=$(docker ps -aq 2>/dev/null | wc -l | tr -d ' ')
if [ "$CONTAINERS" -gt 0 ]; then
    echo -e "${RED}❌ Found ${CONTAINERS} container(s) still remaining${NC}"
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Image}}" 2>/dev/null || true
    VERIFICATION_FAILED=true
fi

# Check for images
IMAGES=$(docker images -q 2>/dev/null | wc -l | tr -d ' ')
if [ "$IMAGES" -gt 0 ]; then
    echo -e "${RED}❌ Found ${IMAGES} image(s) still remaining${NC}"
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}" 2>/dev/null || true
    VERIFICATION_FAILED=true
fi

# Check for volumes
VOLUMES=$(docker volume ls -q 2>/dev/null | wc -l | tr -d ' ')
if [ "$VOLUMES" -gt 0 ]; then
    echo -e "${RED}❌ Found ${VOLUMES} volume(s) still remaining${NC}"
    docker volume ls --format "table {{.Name}}\t{{.Driver}}" 2>/dev/null || true
    VERIFICATION_FAILED=true
fi

# Check for custom networks
NETWORKS=$(docker network ls -q --filter "type=custom" 2>/dev/null | wc -l | tr -d ' ')
if [ "$NETWORKS" -gt 0 ]; then
    echo -e "${RED}❌ Found ${NETWORKS} custom network(s) still remaining${NC}"
    docker network ls --filter "type=custom" --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}" 2>/dev/null || true
    VERIFICATION_FAILED=true
fi

# Final result
echo
if [ "$VERIFICATION_FAILED" = true ]; then
    echo -e "${RED}=== Clean Ship INCOMPLETE ===${NC}\n"
    echo -e "${YELLOW}⚠️  Some Docker resources still remain${NC}"
    echo -e "${YELLOW}   Cleanup may need to be run again or resources removed manually${NC}\n"
    exit 1
else
    echo -e "${GREEN}=== Clean Ship Complete ===${NC}\n"
    echo -e "${GREEN}✅ Verification passed - All Docker resources cleaned${NC}\n"
    echo -e "${BLUE}Summary:${NC}"
    echo -e "  • All containers stopped and removed"
    echo -e "  • All images removed"
    echo -e "  • All volumes removed"
    echo -e "  • All custom networks removed\n"
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "  • Rebuild and start: ${YELLOW}npm run dev:db${NC}"
    echo -e "  • Or start full stack: ${YELLOW}npm run dev:full${NC}\n"
    exit 0
fi

