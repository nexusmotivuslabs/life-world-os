# WiFi Network Access Setup

**Purpose**: Make Life World OS accessible to devices on your home WiFi network  
**Use Case**: Local staging deployment accessible from phones, tablets, and other devices on the same network

## Overview

By default, the application runs on `localhost` which is only accessible from the host machine. To make it accessible on your home WiFi network, you need to:

1. Configure the application to bind to your network interface
2. Allow traffic through your firewall
3. Access the app using your local IP address

## Prerequisites

- Application running in staging mode
- Devices connected to the same WiFi network
- Firewall access to configure (if needed)

## Step 1: Find Your Local IP Address

### macOS/Linux
```bash
# Find your local IP address
ifconfig | grep "inet " | grep -v 127.0.0.1

# Or use:
ipconfig getifaddr en0  # macOS
hostname -I             # Linux
```

### Windows
```bash
ipconfig
# Look for "IPv4 Address" under your WiFi adapter
```

**Example**: `192.168.1.100`

## Step 2: Configure Application to Bind to Network Interface

### Option A: Docker Compose (Recommended)

Update `docker-compose.staging.yml`:

```yaml
services:
  frontend-staging:
    ports:
      - "0.0.0.0:5174:5174"  # Bind to all interfaces
    # ... rest of config

  backend-staging:
    ports:
      - "0.0.0.0:3002:3002"  # Bind to all interfaces
    # ... rest of config
```

### Option B: Environment Variables

Set in `.env.staging`:

```env
STAGING_FRONTEND_PORT=5174
STAGING_BACKEND_PORT=3002
STAGING_API_URL=http://192.168.1.100:3002
STAGING_FRONTEND_URL=http://192.168.1.100:5174
```

**Note**: Replace `192.168.1.100` with your actual local IP address.

## Step 3: Configure Vite Dev Server (Frontend)

The frontend Vite server is already configured in `vite.config.ts`:

```typescript
server: {
  port: 5173,
  host: true,  // This allows access from network
  // ...
}
```

For staging, ensure the Dockerfile or environment uses `--host 0.0.0.0`.

## Step 4: Firewall Configuration

### macOS
```bash
# Allow incoming connections on ports
sudo pfctl -f /etc/pf.conf  # If using pfctl
# Or use System Preferences > Security & Privacy > Firewall
```

### Linux (UFW)
```bash
sudo ufw allow 5174/tcp  # Frontend
sudo ufw allow 3002/tcp  # Backend
```

### Windows
- Windows Defender Firewall: Allow apps through firewall
- Add ports 5174 and 3002 to allowed list

## Step 5: Access from Other Devices

Once configured, access the application from any device on your WiFi network:

- **Frontend**: `http://192.168.1.100:5174`
- **Backend API**: `http://192.168.1.100:3002`
- **Health Check**: `http://192.168.1.100:3002/health`

Replace `192.168.1.100` with your actual local IP address.

## Step 6: Update Frontend API URL

If accessing from a mobile device, the frontend needs to know the backend URL:

**Option 1**: Use environment variable (recommended)
```env
VITE_API_URL=http://192.168.1.100:3002
```

**Option 2**: Use relative URLs (if served from same origin)
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.100:3002'
```

## Troubleshooting

### Cannot Access from Other Devices

1. **Check IP Address**: Ensure you're using the correct local IP
   ```bash
   # Verify IP
   ifconfig | grep "inet "
   ```

2. **Check Firewall**: Ensure ports are open
   ```bash
   # Test connection locally
   curl http://localhost:3002/health
   ```

3. **Check Docker Network**: Ensure containers are on bridge network
   ```bash
   docker network inspect life-world-os-staging-network
   ```

4. **Check Router Settings**: Some routers block inter-device communication
   - Check "AP Isolation" or "Client Isolation" settings
   - Disable if enabled

### Connection Refused

- Verify services are running: `docker-compose -f docker-compose.staging.yml ps`
- Check logs: `docker-compose -f docker-compose.staging.yml logs`
- Verify port bindings: `docker-compose -f docker-compose.staging.yml port frontend-staging 5174`

### CORS Issues

If you see CORS errors, ensure backend allows your frontend origin:

```typescript
// In backend CORS config
app.use(cors({
  origin: [
    'http://localhost:5174',
    'http://192.168.1.100:5174',  // Add your local IP
  ],
}))
```

## Security Considerations

⚠️ **Important**: This setup makes your application accessible on your local network only. For production:

- Use HTTPS (Let's Encrypt, Cloudflare, etc.)
- Implement authentication
- Use a reverse proxy (nginx, Traefik)
- Consider VPN for remote access

## Quick Reference

```bash
# 1. Find your IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# 2. Update .env.staging with your IP
# STAGING_API_URL=http://YOUR_IP:3002
# STAGING_FRONTEND_URL=http://YOUR_IP:5174

# 3. Restart staging
npm run staging:down
npm run staging:up

# 4. Access from device
# http://YOUR_IP:5174
```

## Related Documentation

- [Staging Deployment Guide](../scripts/deploy-staging.sh)
- [Docker Environment Setup](../DOCKER_ENVIRONMENT_SETUP.md)
- [Environment Configuration](../config/environments/staging.env.example)

