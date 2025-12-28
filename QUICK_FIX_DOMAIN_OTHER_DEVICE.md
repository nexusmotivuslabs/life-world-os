# Quick Fix: Domain Not Working on Other Device

## Issue
- ✅ Works on your device: `http://dev.lifeworld.com`
- ✅ Works via IP on other device: `http://192.168.11.211`
- ❌ Domain doesn't work on other device: `http://dev.lifeworld.com`

## Solution: Add Domain to Other Device's Hosts File

The other device needs to know that `dev.lifeworld.com` = `192.168.11.211`

### Step-by-Step Instructions

## For iPhone/iPad

**Option 1: Use a Hosts File App**
1. Download "AdGuard" or "DNS Override" from App Store
2. Add custom DNS/hosts entry:
   - Domain: `dev.lifeworld.com`
   - IP: `192.168.11.211`

**Option 2: Use a VPN App with Hosts Support**
1. Download "DNS Override" or similar
2. Configure custom hosts

**Note**: iOS doesn't allow direct /etc/hosts editing without jailbreak.

## For Android

**Option 1: Rooted Device**
```bash
# Edit /etc/hosts (requires root)
192.168.11.211 dev.lifeworld.com
192.168.11.211 staging.lifeworld.com
192.168.11.211 prod.lifeworld.com
```

**Option 2: Non-Rooted (Use App)**
1. Download "Hosts Go" or "Hosts File Editor" from Play Store
2. Add entries:
   ```
   192.168.11.211 dev.lifeworld.com
   192.168.11.211 staging.lifeworld.com
   192.168.11.211 prod.lifeworld.com
   ```

## For macOS/Linux (Other Computer)

```bash
sudo nano /etc/hosts
```

Add these lines:
```
192.168.11.211 dev.lifeworld.com
192.168.11.211 staging.lifeworld.com
192.168.11.211 prod.lifeworld.com
```

Save (Ctrl+X, then Y, then Enter)

## For Windows (Other Computer)

1. Open Notepad **as Administrator**
   - Right-click Notepad → "Run as administrator"
2. Open file: `C:\Windows\System32\drivers\etc\hosts`
3. Add these lines at the end:
   ```
   192.168.11.211 dev.lifeworld.com
   192.168.11.211 staging.lifeworld.com
   192.168.11.211 prod.lifeworld.com
   ```
4. Save the file

## Verify It Works

After adding to hosts file:

```bash
# Test from the other device
ping dev.lifeworld.com
# Should ping 192.168.11.211

# Or test in browser
http://dev.lifeworld.com
```

## Alternative: Use IP Directly

If you don't want to edit hosts files, just use the IP:
- `http://192.168.11.211/` (works everywhere, no setup needed)

## Quick Copy-Paste for Hosts File

```
192.168.11.211 dev.lifeworld.com
192.168.11.211 staging.lifeworld.com
192.168.11.211 prod.lifeworld.com
```

