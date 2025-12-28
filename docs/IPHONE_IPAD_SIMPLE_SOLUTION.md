# Simple Solution for iPhone/iPad Access

## The Problem

Port 53 (standard DNS) is already in use by macOS system services. We have simpler solutions!

## ✅ Best Solution: Use IP Address Directly

**No DNS setup needed!** Just use your IP address:

- **Frontend**: `http://192.168.11.211/`
- **API**: `http://192.168.11.211/api/health`

This works on **all devices** immediately, no configuration needed.

## ✅ Alternative: Router DNS Configuration

If your Sky router supports custom DNS entries:

1. Access router admin panel:
   - Usually: `http://192.168.1.1` or `http://192.168.0.1`
   - Check router label for admin URL
   - Login with admin credentials

2. Look for:
   - "DNS" settings
   - "Local DNS" 
   - "Static DNS"
   - "Custom DNS entries"

3. Add entries:
   ```
   dev.lifeworld.com     → 192.168.11.211
   staging.lifeworld.com → 192.168.11.211
   prod.lifeworld.com   → 192.168.11.211
   ```

4. Save and restart router if needed

**Result**: All devices on the network will automatically resolve these domains!

## ✅ Alternative: Hosts File App (iPhone/iPad)

Since port 53 is in use, use a hosts file app:

1. Download **"DNS Override"** or **"AdGuard"** from App Store
2. Configure custom DNS/hosts:
   - Domain: `dev.lifeworld.com`
   - IP: `192.168.11.211`
3. Enable the app
4. Test: `http://dev.lifeworld.com`

## Current Status

✅ **Application is accessible via IP**: `http://192.168.11.211/`  
✅ **All services running**: nginx, backend, frontend  
✅ **Network accessible**: Works from other devices via IP  

## Recommended Approach

**For quick testing**: Use IP address directly (`http://192.168.11.211/`)  
**For development**: Configure router DNS (if supported)  
**For iPhone/iPad**: Use DNS Override app or IP address  

## Test from External Device

### Using IP (Easiest - No Setup):

1. On iPhone/iPad, open Safari
2. Go to: `http://192.168.11.211/`
3. Should work immediately! ✅

### Using Domain (Requires Setup):

1. Configure DNS (router or app)
2. Go to: `http://dev.lifeworld.com`
3. Should work! ✅

## Summary

- ✅ **IP access works**: `http://192.168.11.211/` (no setup needed)
- ⚠️ **DNS setup**: Port 53 conflict - use router DNS or hosts app
- ✅ **Ready for testing**: Use IP address for immediate access

