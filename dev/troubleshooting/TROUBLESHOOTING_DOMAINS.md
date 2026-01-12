# Troubleshooting Custom Domains

## Issue: `http://dev.lifeworld.com` Not Working

### Quick Fix

Run the troubleshooting script:
```bash
./scripts/fix-domains.sh
```

### Manual Troubleshooting Steps

#### 1. Check Docker is Running

```bash
docker info
```

If Docker is not running:
- **macOS**: Open Docker Desktop
- **Linux**: `sudo systemctl start docker`
- **Windows**: Start Docker Desktop

#### 2. Setup /etc/hosts

The domain needs to be in your `/etc/hosts` file:

```bash
sudo ./scripts/setup-domains.sh
```

Or manually:
```bash
sudo nano /etc/hosts
```

Add:
```
127.0.0.1 dev.lifeworld.com
127.0.0.1 staging.lifeworld.com
127.0.0.1 prod.lifeworld.com
127.0.0.1 localdev.lifeworld.com
```

#### 3. Create Missing Environment Files

```bash
# Create .env.prod if missing
cp config/environments/prod.env.example .env.prod
# Edit with your values
```

#### 4. Start Services

```bash
# Start all services
docker-compose -f docker-compose.domains.yml up -d

# Or start just dev environment
docker-compose -f docker-compose.domains.yml up -d nginx backend-dev frontend-dev postgres-dev
```

#### 5. Wait for Services

Services need time to start:
- Database: ~10 seconds
- Backend: ~30 seconds
- Frontend: ~20 seconds
- Nginx: ~5 seconds

Check status:
```bash
docker-compose -f docker-compose.domains.yml ps
```

#### 6. Test Connection

```bash
# Test domain resolution
ping -c 1 dev.lifeworld.com

# Test HTTP
curl http://dev.lifeworld.com/health

# Test in browser
open http://dev.lifeworld.com
```

## Common Issues

### Issue: "Could not resolve host"

**Cause**: `/etc/hosts` not configured

**Fix**:
```bash
sudo ./scripts/setup-domains.sh
```

### Issue: "Connection refused" on port 80

**Cause**: Nginx not running or port 80 in use

**Fix**:
```bash
# Check if nginx is running
docker ps | grep nginx

# Check if port 80 is in use
lsof -i :80

# Start nginx
docker-compose -f docker-compose.domains.yml up -d nginx

# Check nginx logs
docker logs life-world-os-nginx
```

### Issue: "502 Bad Gateway"

**Cause**: Backend services not running

**Fix**:
```bash
# Check backend status
docker ps | grep backend-dev

# Start backend
docker-compose -f docker-compose.domains.yml up -d backend-dev

# Check backend logs
docker logs life-world-os-backend-dev
```

### Issue: "503 Service Unavailable"

**Cause**: Services starting up or health check failing

**Fix**:
```bash
# Wait a bit longer
sleep 30

# Check service health
docker-compose -f docker-compose.domains.yml ps

# Check individual service logs
docker logs life-world-os-backend-dev
docker logs life-world-os-frontend-dev
```

### Issue: Domain works but shows wrong environment

**Cause**: Nginx configuration issue or wrong service running

**Fix**:
```bash
# Check nginx config
docker exec life-world-os-nginx nginx -t

# Restart nginx
docker-compose -f docker-compose.domains.yml restart nginx

# Verify routing
curl -H "Host: dev.lifeworld.com" http://localhost/health
```

## Verification Checklist

- [ ] Docker is running
- [ ] `/etc/hosts` has domain entries
- [ ] `.env.prod` exists (if using prod)
- [ ] Nginx container is running
- [ ] Backend containers are running
- [ ] Frontend containers are running
- [ ] Database containers are running
- [ ] Port 80 is not blocked
- [ ] Domain resolves: `ping dev.lifeworld.com`
- [ ] HTTP works: `curl http://dev.lifeworld.com/health`

## Debug Commands

```bash
# Check all containers
docker ps -a | grep life-world-os

# Check nginx logs
docker logs life-world-os-nginx

# Check backend logs
docker logs life-world-os-backend-dev

# Check frontend logs
docker logs life-world-os-frontend-dev

# Test nginx config
docker exec life-world-os-nginx nginx -t

# Check network connectivity
docker network inspect life-world-os-dev-network

# Test backend directly
docker exec life-world-os-backend-dev curl http://localhost:3001/health

# Test frontend directly
docker exec life-world-os-frontend-dev curl http://localhost:5173
```

## Still Not Working?

1. **Check Docker Desktop**: Ensure it's fully started
2. **Restart Docker**: Sometimes helps with networking issues
3. **Check Firewall**: Ensure port 80 is not blocked
4. **Try Different Browser**: Clear cache and try incognito
5. **Check DNS Cache**: Flush DNS cache (see below)

### Flush DNS Cache

**macOS**:
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

**Linux**:
```bash
sudo systemd-resolve --flush-caches
```

**Windows**:
```cmd
ipconfig /flushdns
```

## Getting Help

If still having issues, provide:
1. Output of `docker ps`
2. Output of `docker-compose -f docker-compose.domains.yml ps`
3. Output of `cat /etc/hosts | grep lifeworld`
4. Output of `docker logs life-world-os-nginx`
5. Output of `curl -v http://dev.lifeworld.com/health`

