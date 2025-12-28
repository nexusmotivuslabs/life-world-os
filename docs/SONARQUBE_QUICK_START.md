# SonarQube Quick Start

**Using Official Docker Image**  
**Time**: ~5 minutes

---

## Quick Setup (Docker)

### 1. Start SonarQube Server
```bash
npm run sonar:up
```

This pulls and starts the official `sonarqube:latest` Docker image.

### 2. Wait for Startup
```bash
npm run sonar:logs
```

Wait for: `"SonarQube is operational"` (takes 1-2 minutes first time)

### 3. Access SonarQube
- Open: http://localhost:9000
- Login: `admin` / `admin`
- **Change password** when prompted

### 4. Generate Token
1. Click your profile (top right)
2. Go to: **My Account > Security**
3. Generate token: Name it (e.g., "life-world-os")
4. **Copy the token** (you won't see it again!)

### 5. Configure Project
```bash
npm run sonar:setup
```

Edit `.sonarqube.env`:
```bash
SONAR_HOST_URL=http://localhost:9000
SONAR_TOKEN=your-copied-token-here
SONAR_PROJECT_KEY=life-world-os
```

### 6. Run Analysis (Docker - No Install Needed!)
```bash
npm run sonar:analyze:docker
```

### 7. View Results
Open: http://localhost:9000/dashboard?id=life-world-os

---

## What You Get

- ✅ **Code Quality Metrics**: Bugs, vulnerabilities, code smells
- ✅ **Coverage Reports**: Test coverage (if tests available)
- ✅ **Duplication Analysis**: Code duplication detection
- ✅ **Security Hotspots**: Security issue identification
- ✅ **Technical Debt**: Maintainability metrics

---

## Docker Images Used

- **SonarQube Server**: `sonarqube:latest` (official)
- **PostgreSQL**: `postgres:15-alpine` (for SonarQube data)
- **SonarScanner**: `sonarsource/sonar-scanner-cli:latest` (for analysis)

---

## Troubleshooting

### SonarQube Not Starting
```bash
# Check logs
npm run sonar:logs

# Check status
npm run sonar:status

# Restart
npm run sonar:down
npm run sonar:up
```

### Analysis Fails
- Verify SonarQube is running: `npm run sonar:status`
- Check token is correct in `.sonarqube.env`
- Verify project key matches SonarQube project

### Port Already in Use
If port 9000 is taken, edit `docker-compose.sonarqube.yml`:
```yaml
ports:
  - "9001:9000"  # Change to different port
```

---

## Next Steps

- Set up **Quality Gates** in SonarQube UI
- Integrate with **CI/CD** pipeline
- Configure **branch analysis** for feature branches
- Set up **notifications** for quality issues

---

**See**: [Full Setup Guide](./SONARQUBE_SETUP.md) for detailed documentation

