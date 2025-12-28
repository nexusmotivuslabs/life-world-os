# Dev Hub Setup

## Overview

Dev Hub is an environment management and networking UI that runs in Docker and is accessible via the `nexus.devhub.com` domain. It provides:

- **Environment Status**: View local and dev environment status
- **Networking UI**: Visualize service connections and ports
- **Service Health**: Monitor backend, frontend, and database health
- **Port Management**: Configure and view port allocations

## Domain Configuration

**Domain**: `nexus.devhub.com`  
**Port**: Configurable via `DEV_HUB_PORT` (default: 8080)

## Quick Start

### 1. Add Domain to /etc/hosts

```bash
# macOS/Linux
sudo bash -c 'echo "127.0.0.1 nexus.devhub.com" >> /etc/hosts'

# Or manually edit /etc/hosts
sudo nano /etc/hosts
# Add: 127.0.0.1 nexus.devhub.com
```

**Windows:**
1. Open Notepad as Administrator
2. Open `C:\Windows\System32\drivers\etc\hosts`
3. Add: `127.0.0.1 nexus.devhub.com`
4. Save

### 2. Start Dev Hub

**Option A: With Dev Hub Profile**
```bash
docker-compose -f docker-compose.dev.yml --profile dev-hub up -d
```

**Option B: With Full Stack**
```bash
docker-compose -f docker-compose.dev.yml --profile full up -d
```

**Option C: Custom Port**
```bash
DEV_HUB_PORT=9000 docker-compose -f docker-compose.dev.yml --profile dev-hub up -d
```

### 3. Access Dev Hub

- **Via Domain**: http://nexus.devhub.com
- **Via Direct Port**: http://localhost:8080 (or your custom port)

## Configuration

### Environment Variables

**In `.env.dev` or environment:**
```env
DEV_HUB_PORT=8080
DEV_HUB_URL=http://nexus.devhub.com
DEV_HUB_CONTAINER_NAME=life-world-os-dev-hub
DEV_HUB_IMAGE_NAME=life-world-os-dev-hub
```

### Port Configuration

The port is fully configurable:

```bash
# Use default port (8080)
docker-compose -f docker-compose.dev.yml --profile dev-hub up -d

# Use custom port
DEV_HUB_PORT=9000 docker-compose -f docker-compose.dev.yml --profile dev-hub up -d

# Or set in .env.dev
echo "DEV_HUB_PORT=9000" >> .env.dev
```

### Nginx Configuration

Dev Hub is automatically configured in `nginx/nginx.conf`:

```nginx
upstream dev-hub {
    server dev-hub:8080;  # Uses DEV_HUB_PORT env var
}

server {
    listen 80;
    server_name nexus.devhub.com;
    
    location / {
        proxy_pass http://dev-hub;
        # ... proxy headers
    }
}
```

## Architecture

```
Browser Request
    ↓
nexus.devhub.com (Domain)
    ↓
Nginx Reverse Proxy (Port 80)
    ↓
dev-hub Container (Port 8080, configurable)
    ↓
Next.js Application
```

## Features

### Environment Status
- View which environments are running (local, dev)
- Check service health (backend, frontend, database)
- Monitor port usage

### Networking UI
- Visualize service connections
- See port mappings
- Track service dependencies

### Service Health
- Backend health checks
- Frontend status
- Database connectivity
- Response times

## Development

### Local Development

```bash
cd apps/dev-hub-app
npm install
npm run dev
```

Access at: http://localhost:3000

### Docker Development

```bash
# Build and run
docker-compose -f docker-compose.dev.yml --profile dev-hub up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f dev-hub

# Rebuild
docker-compose -f docker-compose.dev.yml build dev-hub
```

### Hot Reload

Dev Hub supports hot reload in Docker:
- Source code changes are reflected automatically
- Volume mounts enable live updates
- No container restart needed

## Troubleshooting

### Domain Not Resolving

**Problem**: `nexus.devhub.com` doesn't resolve

**Solution**:
1. Check `/etc/hosts` entry:
   ```bash
   grep nexus.devhub.com /etc/hosts
   # Should show: 127.0.0.1 nexus.devhub.com
   ```

2. Flush DNS cache:
   ```bash
   # macOS
   sudo dscacheutil -flushcache
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

### Port Already in Use

**Problem**: Port 8080 (or custom port) is already in use

**Solution**:
```bash
# Check what's using the port
lsof -i:8080

# Use a different port
DEV_HUB_PORT=9000 docker-compose -f docker-compose.dev.yml --profile dev-hub up -d
```

### Nginx Not Routing

**Problem**: Domain works but shows nginx error

**Solution**:
1. Check nginx is running:
   ```bash
   docker ps | grep nginx
   ```

2. Check nginx logs:
   ```bash
   docker logs life-world-os-nginx
   ```

3. Verify dev-hub is running:
   ```bash
   docker ps | grep dev-hub
   ```

4. Restart nginx:
   ```bash
   docker restart life-world-os-nginx
   ```

### Dev Hub Not Starting

**Problem**: Container fails to start

**Solution**:
1. Check logs:
   ```bash
   docker-compose -f docker-compose.dev.yml logs dev-hub
   ```

2. Verify dependencies:
   ```bash
   # Ensure network exists
   docker network ls | grep life-world-os-dev-network
   ```

3. Rebuild:
   ```bash
   docker-compose -f docker-compose.dev.yml build --no-cache dev-hub
   docker-compose -f docker-compose.dev.yml up -d dev-hub
   ```

## Integration with Other Services

Dev Hub can monitor and interact with:

- **Backend**: `backend-dev` (port 3001)
- **Frontend**: `frontend-dev` (port 5173)
- **Database**: `postgres-dev` (port 5433)
- **Local Services**: `localhost:5001` (backend), `localhost:5002` (frontend)

## Access Patterns

### Via Domain (Recommended)
```
http://nexus.devhub.com
```

### Via Direct Port
```
http://localhost:8080
# Or custom port: http://localhost:9000
```

### Via Nginx Proxy
If nginx is running:
```
http://nexus.devhub.com  # Routes to dev-hub
```

## Summary

✅ **Domain**: `nexus.devhub.com`  
✅ **Port**: Configurable (default: 8080)  
✅ **Docker**: Runs in `docker-compose.dev.yml`  
✅ **Profile**: `dev-hub` or `full`  
✅ **Hot Reload**: Supported in development  
✅ **Nginx**: Auto-configured for domain routing  

Dev Hub is now ready to manage your environments!

