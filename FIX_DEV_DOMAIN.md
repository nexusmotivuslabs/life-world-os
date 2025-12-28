# Fix: http://dev.lifeworld.com Not Working

## Issues Found

1. ❌ Docker daemon is not running
2. ❌ `/etc/hosts` doesn't have domain entries
3. ❌ Services are not started
4. ⚠️  Missing `.env.prod` file (needed for prod environment)

## Step-by-Step Fix

### Step 1: Start Docker

**macOS (Docker Desktop)**:
- Open Docker Desktop application
- Wait for it to fully start (whale icon in menu bar)
- Verify: `docker info` should work

**Linux**:
```bash
sudo systemctl start docker
sudo systemctl enable docker
```

**Windows**:
- Open Docker Desktop
- Wait for it to start

### Step 2: Add Domain Entries to /etc/hosts

Run the setup script:
```bash
sudo ./scripts/setup-domains.sh
```

Or manually edit `/etc/hosts`:
```bash
sudo nano /etc/hosts
```

Add these lines at the end:
```
127.0.0.1 localdev.lifeworld.com
127.0.0.1 dev.lifeworld.com
127.0.0.1 staging.lifeworld.com
127.0.0.1 prod.lifeworld.com
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 3: Create Missing Environment File

```bash
# Create .env.prod from example
cp config/environments/prod.env.example .env.prod

# Edit if needed (for now, defaults should work)
```

### Step 4: Start Services

```bash
# Start all services (this will take 1-2 minutes)
docker-compose -f docker-compose.domains.yml up -d

# Or start just dev environment
docker-compose -f docker-compose.domains.yml up -d \
  nginx \
  postgres-dev \
  backend-dev \
  frontend-dev
```

### Step 5: Wait for Services to Start

Services need time to initialize:
- Database: ~10 seconds
- Backend: ~30-60 seconds
- Frontend: ~20 seconds
- Nginx: ~5 seconds

Check status:
```bash
docker-compose -f docker-compose.domains.yml ps
```

All services should show "Up" status.

### Step 6: Test

```bash
# Test domain resolution
ping -c 1 dev.lifeworld.com

# Test HTTP connection
curl http://dev.lifeworld.com/health

# Or open in browser
open http://dev.lifeworld.com
```

## Quick Fix Script

I've created an automated fix script:

```bash
./scripts/fix-domains.sh
```

This script will:
1. Check if Docker is running
2. Add /etc/hosts entries (if you have sudo)
3. Create missing .env.prod
4. Check service status
5. Provide next steps

## Verification

After following the steps, verify:

```bash
# 1. Check Docker is running
docker info

# 2. Check /etc/hosts has entries
cat /etc/hosts | grep lifeworld

# 3. Check services are running
docker ps | grep life-world-os

# 4. Test domain
curl http://dev.lifeworld.com/health
```

## Expected Output

When working correctly:
- `curl http://dev.lifeworld.com/health` should return JSON with version info
- Browser should load the frontend
- No connection errors

## Still Having Issues?

See [TROUBLESHOOTING_DOMAINS.md](./TROUBLESHOOTING_DOMAINS.md) for detailed troubleshooting.

## Common Errors

### "Cannot connect to Docker daemon"
→ Start Docker Desktop

### "Could not resolve host"
→ Run `sudo ./scripts/setup-domains.sh`

### "Connection refused"
→ Services not started, run `docker-compose -f docker-compose.domains.yml up -d`

### "502 Bad Gateway"
→ Backend not ready, wait 30 seconds and check logs: `docker logs life-world-os-backend-dev`

