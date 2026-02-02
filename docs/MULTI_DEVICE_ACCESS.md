# Multi-Device Network Access

**Goal**: Make the app accessible from other devices on your WiFi network (phones, tablets, other PCs).

## Local Lite (npm run local-lite)

When running `npm run local-lite`, the app is already configured for LAN access:

1. **Frontend** (Vite) binds to `0.0.0.0:5002` – reachable from any device
2. **Backend** (Express) binds to `0.0.0.0:5001` – reachable from any device
3. **API URLs** default to relative paths – Vite proxies `/api` to the backend, so API calls work from any device

**To access from another device:**
- Find your LAN IP (shown when local-lite starts, or run `ipconfig getifaddr en0` on macOS)
- Open `http://<YOUR_IP>:5002` in a browser on the other device

**If API calls fail from other devices:** Remove or comment out `VITE_API_URL` in `apps/frontend/.env.local` so the app uses relative URLs.

---

## Docker / Nginx Setup

**Goal**: Make `http://dev.lifeworld.com` accessible from other devices on your WiFi network

## Quick Setup

### Step 1: Find Your Local IP Address

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Or
ipconfig getifaddr en0  # macOS
hostname -I             # Linux
```

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your WiFi adapter
```

**Example IP**: `192.168.1.100` (yours will be different)

### Step 2: Verify Nginx is Bound to Network

The nginx container should already be bound to `0.0.0.0:80`, which means it's accessible from the network. Verify:

```bash
docker ps | grep nginx
# Should show: 0.0.0.0:80->80/tcp
```

### Step 3: Configure Other Devices

You have **3 options** for other devices:

## Option 1: Use IP Address Directly (Easiest)

On other devices, access using your local IP:

```
http://192.168.1.100/
http://192.168.1.100/api/health
```

**Pros**: No configuration needed  
**Cons**: Uses IP instead of domain name

## Option 2: Add to /etc/hosts on Each Device

On each device (phone, tablet, laptop), add the domain to their hosts file:

### macOS/iOS (iPhone/iPad)

**macOS:**
```bash
sudo nano /etc/hosts
```

Add:
```
192.168.1.100 dev.lifeworld.com
192.168.1.100 staging.lifeworld.com
192.168.1.100 prod.lifeworld.com
```

**iOS (iPhone/iPad):**
- Use a hosts file editor app, or
- Use a VPN/DNS app that supports custom hosts

### Android

**Rooted:**
```bash
# Edit /etc/hosts (requires root)
192.168.1.100 dev.lifeworld.com
```

**Non-rooted:**
- Use a hosts file editor app from Play Store
- Or use a VPN app that supports custom hosts

### Windows

```cmd
# Run Notepad as Administrator
notepad C:\Windows\System32\drivers\etc\hosts
```

Add:
```
192.168.1.100 dev.lifeworld.com
192.168.1.100 staging.lifeworld.com
192.168.1.100 prod.lifeworld.com
```

### Linux

```bash
sudo nano /etc/hosts
```

Add the same entries as above.

## Option 3: Local DNS Server (Advanced)

Set up a local DNS server (like Pi-hole or dnsmasq) to resolve the domains for all devices automatically.

**Pros**: Works for all devices automatically  
**Cons**: Requires additional setup

## Step 4: Test from Other Device

Once configured, test from another device:

```bash
# From another device on the network
curl http://dev.lifeworld.com/api/health
# Or open in browser: http://dev.lifeworld.com
```

## Troubleshooting

### Can't Access from Other Device

1. **Check Firewall**
   ```bash
   # macOS - Allow incoming connections
   # System Preferences > Security & Privacy > Firewall
   
   # Linux
   sudo ufw allow 80/tcp
   
   # Windows - Allow port 80 in Windows Firewall
   ```

2. **Verify IP Address**
   ```bash
   # On host machine
   ifconfig | grep "inet "
   # Make sure you're using the WiFi IP, not localhost
   ```

3. **Check Docker Port Binding**
   ```bash
   docker ps | grep nginx
   # Should show: 0.0.0.0:80->80/tcp
   ```

4. **Test Direct IP Access**
   ```bash
   # From other device, try IP directly
   curl http://192.168.1.100/api/health
   # If this works, the issue is DNS/hosts file
   ```

5. **Check Network Connectivity**
   ```bash
   # From other device, ping the host
   ping 192.168.1.100
   # Should get responses
   ```

### Router/Network Issues

Some routers have "AP Isolation" or "Client Isolation" enabled, which prevents devices from talking to each other:

1. Access your router admin panel (usually `192.168.1.1` or `192.168.0.1`)
2. Look for "AP Isolation", "Client Isolation", or "Wireless Isolation"
3. **Disable** it if enabled
4. Save and restart router if needed

## Quick Reference

### Find Your IP
```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I

# Windows
ipconfig | findstr IPv4
```

### Test from Another Device
```bash
# Using IP
curl http://YOUR_IP/api/health

# Using domain (if hosts file configured)
curl http://dev.lifeworld.com/api/health
```

### Update Hosts File
```bash
# macOS/Linux
sudo nano /etc/hosts

# Windows (as Admin)
notepad C:\Windows\System32\drivers\etc\hosts
```

## Recommended Approach

**For quick testing**: Use Option 1 (IP address directly)  
**For development**: Use Option 2 (hosts file on each device)  
**For production-like setup**: Use Option 3 (local DNS)

## Security Note

⚠️ This setup makes your application accessible on your local network only. For production:
- Use HTTPS
- Implement authentication
- Use a reverse proxy with SSL
- Consider VPN for remote access

