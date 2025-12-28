# Custom Domains Setup

**Purpose**: Configure custom domain names for different environments  
**Domains**: 
- `localdev.lifeworld.com` - Local development (localhost)
- `dev.lifeworld.com` - Docker development environment
- `staging.lifeworld.com` - Docker staging environment
- `prod.lifeworld.com` - Docker production environment

## Overview

This setup uses Nginx as a reverse proxy to route traffic based on domain names. All environments run in Docker containers and are accessible via custom domains.

## Architecture

```
Browser Request
    ↓
Nginx Reverse Proxy (Port 80)
    ↓
Routes by Domain:
    • dev.lifeworld.com → frontend-dev:5173 / backend-dev:3001
    • staging.lifeworld.com → frontend-staging:5174 / backend-staging:3002
    • prod.lifeworld.com → frontend-prod:5175 / backend-prod:3003
    • localdev.lifeworld.com → host.docker.internal (localhost services)
```

## Prerequisites

- Docker and Docker Compose installed
- Root/sudo access (for /etc/hosts modification)
- Port 80 available (or change nginx port)

## Setup Steps

### 1. Configure /etc/hosts

Add domain entries to your hosts file:

**macOS/Linux:**
```bash
sudo ./scripts/setup-domains.sh
```

**Manual (macOS/Linux):**
```bash
sudo nano /etc/hosts
```

Add these lines:
```
127.0.0.1 localdev.lifeworld.com
127.0.0.1 dev.lifeworld.com
127.0.0.1 staging.lifeworld.com
127.0.0.1 prod.lifeworld.com
```

**Windows:**
1. Open Notepad as Administrator
2. Open `C:\Windows\System32\drivers\etc\hosts`
3. Add the same lines as above
4. Save

### 2. Configure Environment Variables

Create/update environment files:

**`.env.dev`** (for dev environment):
```env
DEV_API_URL=http://dev.lifeworld.com/api
DEV_FRONTEND_URL=http://dev.lifeworld.com
```

**`.env.staging`**:
```env
STAGING_API_URL=http://staging.lifeworld.com/api
STAGING_FRONTEND_URL=http://staging.lifeworld.com
```

**`.env.prod`**:
```env
PROD_API_URL=http://prod.lifeworld.com/api
PROD_FRONTEND_URL=http://prod.lifeworld.com
```

### 3. Start Services

```bash
# Start all environments with domain routing
docker-compose -f docker-compose.domains.yml up -d

# Or start specific environments
docker-compose -f docker-compose.domains.yml up -d nginx backend-dev frontend-dev
```

### 4. Verify Setup

```bash
# Check nginx is running
docker ps | grep nginx

# Test domains
curl http://dev.lifeworld.com/health
curl http://staging.lifeworld.com/health
curl http://prod.lifeworld.com/health
```

## Access URLs

Once setup is complete, access the application via:

- **Development**: http://dev.lifeworld.com
- **Staging**: http://staging.lifeworld.com
- **Production**: http://prod.lifeworld.com
- **Local Dev**: http://localdev.lifeworld.com (requires local services running)

## Environment Details

### Development (dev.lifeworld.com)
- **Frontend**: Port 5173 (internal)
- **Backend**: Port 3001 (internal)
- **Database**: Port 5433 (exposed)
- **Network**: `life-world-os-dev-network`

### Staging (staging.lifeworld.com)
- **Frontend**: Port 5174 (internal)
- **Backend**: Port 3002 (internal)
- **Database**: Port 5434 (exposed)
- **Network**: `life-world-os-staging-network`

### Production (prod.lifeworld.com)
- **Frontend**: Port 5175 (internal)
- **Backend**: Port 3003 (internal)
- **Database**: Port 5435 (exposed)
- **Network**: `life-world-os-prod-network`

## Nginx Configuration

The Nginx configuration (`nginx/nginx.conf`) routes traffic based on the `Host` header:

- Requests to `dev.lifeworld.com` → Development services
- Requests to `staging.lifeworld.com` → Staging services
- Requests to `prod.lifeworld.com` → Production services
- Requests to `localdev.lifeworld.com` → Localhost services (via host.docker.internal)

## Troubleshooting

### Domain Not Resolving

1. **Check /etc/hosts**:
   ```bash
   cat /etc/hosts | grep lifeworld
   ```

2. **Flush DNS cache**:
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Linux
   sudo systemd-resolve --flush-caches
   
   # Windows
   ipconfig /flushdns
   ```

### Nginx Not Starting

1. **Check logs**:
   ```bash
   docker logs life-world-os-nginx
   ```

2. **Verify port 80 is available**:
   ```bash
   lsof -i :80
   ```

3. **Check nginx config**:
   ```bash
   docker exec life-world-os-nginx nginx -t
   ```

### Services Not Accessible

1. **Check services are running**:
   ```bash
   docker-compose -f docker-compose.domains.yml ps
   ```

2. **Check network connectivity**:
   ```bash
   docker network inspect life-world-os-dev-network
   ```

3. **Test backend directly**:
   ```bash
   docker exec life-world-os-backend-dev curl http://localhost:3001/health
   ```

### CORS Issues

If you see CORS errors, ensure backend CORS configuration allows the domains:

```typescript
// In backend CORS config
app.use(cors({
  origin: [
    'http://dev.lifeworld.com',
    'http://staging.lifeworld.com',
    'http://prod.lifeworld.com',
    'http://localdev.lifeworld.com',
  ],
}))
```

## Cloud Migration (AWS)

When migrating to AWS, replace Nginx with:

- **Application Load Balancer (ALB)** - For routing
- **Route 53** - For DNS
- **CloudFront** - For CDN (optional)
- **ACM** - For SSL certificates

The domain structure remains the same:
- `dev.lifeworld.com` → ALB → ECS/EC2 services
- `staging.lifeworld.com` → ALB → ECS/EC2 services
- `prod.lifeworld.com` → ALB → ECS/EC2 services

## Commands Reference

```bash
# Setup domains
sudo ./scripts/setup-domains.sh

# Start all environments
docker-compose -f docker-compose.domains.yml up -d

# Start specific environment
docker-compose -f docker-compose.domains.yml up -d nginx backend-dev frontend-dev

# Stop all
docker-compose -f docker-compose.domains.yml down

# View logs
docker-compose -f docker-compose.domains.yml logs -f nginx

# Restart nginx
docker-compose -f docker-compose.domains.yml restart nginx

# Test domains
curl http://dev.lifeworld.com/health
curl http://staging.lifeworld.com/health
curl http://prod.lifeworld.com/health
```

## Security Notes

⚠️ **Important**: This setup is for local development. For production:

1. **Use HTTPS**: Configure SSL certificates (Let's Encrypt, ACM)
2. **Update CORS**: Only allow production domains
3. **Use AWS ALB**: Replace Nginx with managed load balancer
4. **Configure WAF**: Add web application firewall
5. **Use Route 53**: Proper DNS management

## Related Documentation

- [Docker Environment Setup](../DOCKER_ENVIRONMENT_SETUP.md)
- [Staging Deployment Guide](../scripts/deploy-staging.sh)
- [WiFi Network Access](./WIFI_NETWORK_ACCESS.md)

