# Testing from External Device (Same WiFi Network)

## ✅ Setup Complete

Your local DNS server is configured and ready!

## Your Configuration

- **Your Mac IP**: `192.168.11.211`
- **DNS Server**: Running on port 53
- **Application**: Accessible at `http://192.168.11.211/`

## Test from iPhone/iPad (External Device)

### Step 1: Configure DNS on iPhone/iPad

1. On your iPhone/iPad, go to **Settings** → **Wi-Fi**
2. Tap the **ⓘ** (info) icon next to your WiFi network
3. Scroll down to **DNS**
4. Tap **Configure DNS**
5. Select **Manual**
6. **Remove** any existing DNS servers (tap red minus)
7. **Add** your Mac's IP: `192.168.11.211`
8. **Add** a backup DNS (optional but recommended): `8.8.8.8`
9. Tap **Save**

### Step 2: Test Domain Resolution

1. Open **Safari** on your iPhone/iPad
2. Go to: `http://dev.lifeworld.com`
3. It should load the application! 🎉

### Step 3: Test API

1. Open Safari
2. Go to: `http://dev.lifeworld.com/api/health`
3. Should return JSON with status information

## Test from Another Computer (External Device)

### Step 1: Configure DNS

**macOS/Linux:**
```bash
# Edit network settings to use custom DNS
# System Preferences → Network → Advanced → DNS
# Add: 192.168.11.211
```

**Windows:**
1. Open **Network Settings**
2. Go to **Wi-Fi** → **Properties**
3. **IPv4** → **Properties**
4. **Use the following DNS server addresses**
5. Add: `192.168.11.211`
6. Add backup: `8.8.8.8`

### Step 2: Test

```bash
# Test DNS resolution
nslookup dev.lifeworld.com 192.168.11.211
# Should return: 192.168.11.211

# Test in browser
http://dev.lifeworld.com
```

## Verification Checklist

Before testing from external device:

- [x] DNS server is running (`docker ps | grep dnsmasq`)
- [x] Nginx is running (`docker ps | grep nginx`)
- [x] Backend is running (`docker ps | grep backend-dev`)
- [x] Frontend is running (`docker ps | grep frontend-dev`)
- [x] Application accessible via IP (`http://192.168.11.211/`)

## Troubleshooting

### DNS Not Resolving on External Device

1. **Check DNS server is running:**
   ```bash
   docker ps | grep dnsmasq
   docker logs life-world-os-dns
   ```

2. **Verify iPhone/iPad DNS settings:**
   - Settings → Wi-Fi → ⓘ → DNS
   - Should show: `192.168.11.211`

3. **Test DNS from Mac:**
   ```bash
   dig @192.168.11.211 dev.lifeworld.com
   # Should return: 192.168.11.211
   ```

4. **Restart WiFi on iPhone/iPad:**
   - Turn WiFi off and on
   - Or forget network and reconnect

### Application Not Loading

1. **Test IP directly first:**
   - `http://192.168.11.211/` (should work)
   - If IP works but domain doesn't, it's a DNS issue

2. **Check firewall:**
   - macOS: System Preferences → Security & Privacy → Firewall
   - Ensure port 80 is allowed

3. **Check router settings:**
   - Some routers block inter-device communication
   - Check "AP Isolation" or "Client Isolation" settings
   - Disable if enabled

## Quick Test Commands

```bash
# From external device (if it's a computer), test DNS:
nslookup dev.lifeworld.com 192.168.11.211

# Test HTTP:
curl http://dev.lifeworld.com/api/health

# Or just open in browser:
http://dev.lifeworld.com
```

## Expected Results

✅ **DNS Resolution**: `dev.lifeworld.com` → `192.168.11.211`  
✅ **Frontend**: `http://dev.lifeworld.com/` → Loads application  
✅ **API**: `http://dev.lifeworld.com/api/health` → Returns JSON  
✅ **Health**: `http://dev.lifeworld.com/health` → Returns JSON  

## Status

**Ready for testing!** Configure DNS on your iPhone/iPad and test `http://dev.lifeworld.com`

