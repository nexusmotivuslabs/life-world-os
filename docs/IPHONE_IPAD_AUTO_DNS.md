# Automatic DNS for iPhone/iPad (Same Network)

**Goal**: Make `dev.lifeworld.com` work on iPhone/iPad automatically without editing hosts files

## The Problem

iPhones/iPads can't easily edit hosts files without jailbreak. But since you're on the same network, we can set up a local DNS server!

## Solution: Local DNS Server

We'll run a DNS server (dnsmasq) on your Mac that resolves the custom domains. Then configure your iPhone/iPad to use your Mac as its DNS server.

## Setup Steps

### Step 1: Start Local DNS Server

```bash
# Start the DNS server
docker-compose -f docker-compose.dns.yml up -d

# Verify it's running
docker ps | grep dnsmasq
```

**Note**: Port 53 requires admin privileges. You may need to run:
```bash
sudo docker-compose -f docker-compose.dns.yml up -d
```

### Step 2: Find Your Mac's IP Address

```bash
ipconfig getifaddr en0
# Example: 192.168.11.211
```

### Step 3: Configure iPhone/iPad DNS

**On your iPhone/iPad:**

1. Go to **Settings** → **Wi-Fi**
2. Tap the **ⓘ** icon next to your WiFi network
3. Scroll down to **DNS**
4. Tap **Configure DNS**
5. Select **Manual**
6. Remove existing DNS servers (tap red minus)
7. Add your Mac's IP: `192.168.11.211`
8. Tap **Save**

**Important**: Keep at least one other DNS server (like 8.8.8.8) as backup, or add it after your Mac's IP.

### Step 4: Test

On your iPhone/iPad:
1. Open Safari
2. Go to: `http://dev.lifeworld.com`
3. It should work! 🎉

## Alternative: Router DNS Configuration

If your router supports custom DNS entries, you can configure it there instead:

1. Access router admin (usually `192.168.1.1` or `192.168.0.1`)
2. Look for "DNS" or "Local DNS" settings
3. Add entries:
   - `dev.lifeworld.com` → `192.168.11.211`
   - `staging.lifeworld.com` → `192.168.11.211`
   - `prod.lifeworld.com` → `192.168.11.211`

Then all devices on the network will automatically resolve these domains!

## Troubleshooting

### DNS Server Not Starting

Port 53 requires root. Try:
```bash
sudo docker-compose -f docker-compose.dns.yml up -d
```

### iPhone Can't Resolve Domain

1. **Check DNS server is running:**
   ```bash
   docker ps | grep dnsmasq
   ```

2. **Test DNS resolution from Mac:**
   ```bash
   dig @192.168.11.211 dev.lifeworld.com
   # Should return 192.168.11.211
   ```

3. **Verify iPhone DNS settings:**
   - Settings → Wi-Fi → ⓘ → DNS
   - Should show your Mac's IP (192.168.11.211)

4. **Restart iPhone WiFi:**
   - Turn WiFi off and on
   - Or forget network and reconnect

### Still Not Working

**Fallback**: Use IP address directly:
- `http://192.168.11.211/` (works everywhere, no DNS needed)

## Update DNS Entries

If your IP changes, update the hosts file:

```bash
# Edit the hosts file
nano dnsmasq/hosts

# Update IP addresses, then restart DNS
docker-compose -f docker-compose.dns.yml restart dnsmasq
```

## Commands Reference

```bash
# Start DNS server
docker-compose -f docker-compose.dns.yml up -d

# Stop DNS server
docker-compose -f docker-compose.dns.yml down

# View DNS logs
docker logs life-world-os-dns

# Test DNS resolution
dig @192.168.11.211 dev.lifeworld.com
nslookup dev.lifeworld.com 192.168.11.211
```

## Security Note

⚠️ This DNS server only resolves the custom domains. All other DNS queries are forwarded to Google DNS (8.8.8.8).

## Benefits

✅ Works on all devices automatically (once DNS is configured)  
✅ No hosts file editing needed  
✅ Works for iPhone/iPad without jailbreak  
✅ Centralized DNS management  

## Quick Setup Script

```bash
# Run this to set up everything
npm run dns:setup
```

