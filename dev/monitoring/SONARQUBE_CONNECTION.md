# SonarQube Connection Guide

**Quick Start**: Run `npm run sonar:start` (automatically checks Docker and starts SonarQube)

---

## Step 1: Start Docker

**macOS**:
```bash
# Option 1: Open Docker Desktop manually
open -a Docker

# Option 2: Use the start script (tries to open Docker)
npm run sonar:start
```

**Wait for Docker to start** (check Docker Desktop icon in menu bar)

---

## Step 2: Start SonarQube

Once Docker is running:

```bash
npm run sonar:start
```

This will:
1. Check if Docker is running
2. Start SonarQube containers
3. Wait for SonarQube to be ready
4. Display connection details

---

## Step 3: Access SonarQube

**URL**: http://localhost:9000

**Default Credentials**:
- Username: `admin`
- Password: `admin`

**⚠️ Important**: Change the password on first login!

---

## Step 4: Generate Token

1. Login to SonarQube (http://localhost:9000)
2. Click your profile (top right)
3. Go to: **My Account > Security**
4. Click: **Generate Token**
5. Name it (e.g., "life-world-os")
6. **Copy the token** (you won't see it again!)

---

## Step 5: Configure Project

Edit `.sonarqube.env`:

```bash
SONAR_HOST_URL=http://localhost:9000
SONAR_TOKEN=your-copied-token-here
SONAR_PROJECT_KEY=life-world-os
```

---

## Step 6: Run Analysis

```bash
npm run sonar:analyze:docker
```

---

## Troubleshooting

### Docker Not Running
```bash
# Check Docker status
docker info

# Start Docker Desktop
open -a Docker

# Wait for Docker to start, then:
npm run sonar:start
```

### SonarQube Not Ready
```bash
# Check status
npm run sonar:status

# Check logs
npm run sonar:logs

# Wait for "SonarQube is operational" in logs
```

### Port 9000 Already in Use
Edit `docker-compose.sonarqube.yml`:
```yaml
ports:
  - "9001:9000"  # Change to different port
```

Then access at: http://localhost:9001

---

## Quick Commands

| Command | Description |
|---------|-------------|
| `npm run sonar:start` | Start SonarQube (checks Docker first) |
| `npm run sonar:up` | Start SonarQube (assumes Docker running) |
| `npm run sonar:ready` | Check if SonarQube is ready |
| `npm run sonar:status` | Check container status |
| `npm run sonar:logs` | View SonarQube logs |
| `npm run sonar:down` | Stop SonarQube |

---

**Next**: After SonarQube is running, generate a token and configure `.sonarqube.env`

