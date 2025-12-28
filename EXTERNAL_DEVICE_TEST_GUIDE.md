# External Device Test Guide

## ✅ Setup Status: READY

All services are running and configured for external device access.

## Quick Test Instructions

### For iPhone/iPad:

1. **Configure DNS:**
   - Settings → Wi-Fi → ⓘ → DNS → Configure DNS → Manual
   - Add: `192.168.11.211`
   - Save

2. **Test:**
   - Open Safari
   - Go to: `http://dev.lifeworld.com`
   - Should load! ✅

### For Another Computer:

1. **Configure DNS:**
   - Network Settings → DNS
   - Add: `192.168.11.211`

2. **Test:**
   ```bash
   # Test DNS
   nslookup dev.lifeworld.com 192.168.11.211
   
   # Test in browser
   http://dev.lifeworld.com
   ```

## Current Status

- ✅ DNS Server: Running on port 53
- ✅ Nginx: Running on port 80
- ✅ Backend: Running on port 3001
- ✅ Frontend: Running on port 5173
- ✅ Your IP: `192.168.11.211`

## Test URLs

- **Frontend**: `http://dev.lifeworld.com` or `http://192.168.11.211`
- **API Health**: `http://dev.lifeworld.com/api/health`
- **Health Check**: `http://dev.lifeworld.com/health`

## If It Doesn't Work

1. **Verify DNS on device**: Settings → Wi-Fi → DNS should show `192.168.11.211`
2. **Test IP first**: `http://192.168.11.211/` (should work)
3. **Restart WiFi**: Turn off/on WiFi on device
4. **Check firewall**: Ensure port 80 is allowed on Mac

## Commands to Check Status

```bash
# Check all services
docker ps | grep -E "dnsmasq|nginx|backend|frontend"

# Check DNS logs
docker logs life-world-os-dns

# Test DNS resolution
dig @192.168.11.211 dev.lifeworld.com
```

