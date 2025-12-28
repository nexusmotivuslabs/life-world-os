# Prerequisites

**Last Updated**: 2025-01-15

---

## Required Software

### 1. Node.js
- **Version**: >= 20.0.0
- **Download**: https://nodejs.org/
- **Verify**: `node --version`

### 2. npm
- **Version**: >= 9.0.0
- **Comes with**: Node.js
- **Verify**: `npm --version`

### 3. Docker
- **Version**: >= 20.10.0
- **Download**: 
  - macOS: https://www.docker.com/products/docker-desktop
  - Linux: https://docs.docker.com/engine/install/
  - Windows: https://www.docker.com/products/docker-desktop
- **Verify**: `docker --version`

### 4. Docker Compose
- **Version**: >= 2.0.0
- **Comes with**: Docker Desktop (macOS/Windows)
- **Linux**: May need separate install
- **Verify**: `docker compose version`

## Optional (for AI features)

### 5. Ollama (Local AI)
- **Purpose**: Run LLM locally without API costs
- **Download**: https://ollama.ai
- **Install**:
  ```bash
  # macOS
  brew install ollama
  
  # Linux
  curl -fsSL https://ollama.ai/install.sh | sh
  ```
- **Verify**: `ollama --version`
- **Note**: Optional - can use cloud AI services instead

### 6. Git
- **Version**: >= 2.30.0
- **Download**: https://git-scm.com/
- **Verify**: `git --version`

---

## System Requirements

### Minimum
- **RAM**: 4GB
- **Disk Space**: 5GB free
- **CPU**: 2 cores

### Recommended
- **RAM**: 8GB+ (16GB for full Docker stack)
- **Disk Space**: 10GB+ free
- **CPU**: 4+ cores
- **OS**: macOS 12+, Ubuntu 20.04+, Windows 10+

---

## Port Requirements

Ensure these ports are available:

| Port | Service | Required |
|------|---------|----------|
| 3001 | Backend API | Yes |
| 5173 | Frontend Dev Server | Yes |
| 5433 | PostgreSQL (Dev) | Yes |
| 5434 | PostgreSQL (Staging) | Optional |
| 11434 | Ollama (Local AI) | Optional |

### Check Port Availability

```bash
# macOS/Linux
lsof -i :3001
lsof -i :5173
lsof -i :5433

# Windows
netstat -ano | findstr :3001
```

---

## Verification Script

Create `scripts/verify-prerequisites.sh`:

```bash
#!/bin/bash
# verify-prerequisites.sh

echo "🔍 Verifying Prerequisites..."
echo ""

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js: Not installed"
fi

# npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm: Not installed"
fi

# Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ Docker: $DOCKER_VERSION"
else
    echo "❌ Docker: Not installed"
fi

# Docker Compose
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo "✅ Docker Compose: Installed"
else
    echo "❌ Docker Compose: Not installed"
fi

# Ollama (optional)
if command -v ollama &> /dev/null; then
    OLLAMA_VERSION=$(ollama --version 2>/dev/null || echo "installed")
    echo "✅ Ollama: $OLLAMA_VERSION (optional)"
else
    echo "⚠️  Ollama: Not installed (optional - for local AI)"
fi

# Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo "✅ Git: $GIT_VERSION"
else
    echo "❌ Git: Not installed"
fi

# Port availability
echo ""
echo "🔍 Checking Port Availability..."

check_port() {
    if lsof -i :$1 &> /dev/null || netstat -ano | findstr :$1 &> /dev/null; then
        echo "⚠️  Port $1: In use"
    else
        echo "✅ Port $1: Available"
    fi
}

check_port 3001
check_port 5173
check_port 5433

echo ""
echo "✅ Verification complete!"
```

---

## Quick Install Commands

### macOS (Homebrew)

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install prerequisites
brew install node@20
brew install docker
brew install --cask docker
brew install ollama  # Optional

# Start Docker Desktop
open -a Docker

# Verify
node --version
npm --version
docker --version
```

### Linux (Ubuntu/Debian)

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose
sudo apt-get install docker-compose-plugin

# Ollama (optional)
curl -fsSL https://ollama.ai/install.sh | sh

# Log out and back in for Docker group to take effect
```

### Windows

1. **Node.js**: Download from https://nodejs.org/
2. **Docker Desktop**: Download from https://www.docker.com/products/docker-desktop
3. **Git**: Download from https://git-scm.com/
4. **Ollama** (optional): Download from https://ollama.ai

---

## Post-Installation Setup

After installing prerequisites:

1. **Start Docker Desktop** (macOS/Windows)
   - Wait for Docker to be running (whale icon in menu bar)

2. **Verify Docker is running**
   ```bash
   docker info
   ```

3. **Install project dependencies**
   ```bash
   npm install
   cd apps/backend && npm install
   cd ../frontend && npm install
   ```

4. **Setup environment files**
   ```bash
   cp config/environments/dev.env.example .env.dev
   # Edit .env.dev if needed
   ```

---

## Troubleshooting

### Docker not running
```bash
# macOS/Windows: Start Docker Desktop
# Linux: Start Docker service
sudo systemctl start docker
```

### Port already in use
```bash
# Find process using port
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill process or change port in .env.dev
```

### Permission denied (Linux)
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

### Node version mismatch
```bash
# Use nvm to manage Node versions
nvm install 20
nvm use 20
```

---

## Next Steps

Once prerequisites are installed:

1. ✅ Run verification script: `./scripts/verify-prerequisites.sh`
2. ✅ Setup environment: `cp config/environments/dev.env.example .env.dev`
3. ✅ Start development: `npm run dev:db && npm run dev`

See [DOCKER_ENVIRONMENT_SETUP.md](./DOCKER_ENVIRONMENT_SETUP.md) for detailed setup instructions.

---

**Maintained By**: Atlas (DevOps Engineer)


