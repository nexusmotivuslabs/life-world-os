# Docker Dev Rebuild Guide

## Quick Reference

### Fast Restart (Code Changes Only)
```bash
npm run dev:restart
# or
./scripts/rebuild-dev.sh
```
**Time: ~5-10 seconds**  
**Use when:** You've changed code files (TypeScript/TSX)  
**Why fast:** Volumes are mounted, so code changes are hot-reloaded

### Rebuild (Dependency Changes)
```bash
npm run dev:rebuild
# or
./scripts/rebuild-dev.sh --rebuild
```
**Time: ~2-3 minutes**  
**Use when:** You've changed `package.json` dependencies  
**Why slower:** Rebuilds containers but uses Docker layer cache

### Clean Rebuild (Full Reset)
```bash
npm run dev:rebuild:clean
# or
./scripts/rebuild-dev.sh --clean
```
**Time: ~3-5 minutes**  
**Use when:** 
- First time setup
- Dependency issues
- Need completely fresh state

## Why Rebuild Times Vary

### Fast Restart (~5-10 seconds)
- **What it does:** Restarts containers
- **Why fast:** Code is mounted as volumes, so changes are immediate
- **When to use:** Code changes only (no dependency changes)

### Rebuild with Cache (~2-3 minutes)
- **What it does:** Rebuilds containers using Docker layer cache
- **Why slower:** 
  - Installs npm dependencies (~1-2 min)
  - Generates Prisma Client (~5-10 sec)
  - Builds TypeScript (~10-20 sec)
- **When to use:** Dependency changes (`package.json`)

### Clean Rebuild (~3-5 minutes)
- **What it does:** Rebuilds everything from scratch
- **Why slowest:**
  - No cache used
  - Full npm install (~2-3 min)
  - All layers rebuilt
- **When to use:** Troubleshooting or first setup

## Optimization Tips

### 1. Use Volume Mounts (Already Configured)
Your `docker-compose.dev.yml` already has:
```yaml
volumes:
  - ./apps/backend/src:/app/src  # Hot reload
  - ./apps/frontend/src:/app/src  # Hot reload
```

**This means:** Code changes don't require rebuilds!

### 2. Only Rebuild When Needed
- **Code changes:** Just restart (`npm run dev:restart`)
- **Dependency changes:** Rebuild (`npm run dev:rebuild`)
- **Issues:** Clean rebuild (`npm run dev:rebuild:clean`)

### 3. Docker Layer Caching
The Dockerfiles are optimized for caching:
- Dependencies installed before copying source
- Prisma schema copied separately
- Source code copied last (changes most frequently)

### 4. Parallel Rebuilds
Docker Compose rebuilds services in parallel when possible.

## Average Build Times

| Operation | Time | When to Use |
|-----------|------|-------------|
| Restart | 5-10s | Code changes only |
| Rebuild (cached) | 2-3 min | Dependency changes |
| Clean rebuild | 3-5 min | Troubleshooting |
| First build | 5-8 min | Initial setup |

## Common Scenarios

### Scenario 1: Changed a React Component
```bash
# Just restart - code is mounted as volume
npm run dev:restart
```

### Scenario 2: Added a New npm Package
```bash
# Rebuild to install new dependencies
npm run dev:rebuild
```

### Scenario 3: Changed Prisma Schema
```bash
# Rebuild to regenerate Prisma Client
npm run dev:rebuild
```

### Scenario 4: Everything Broken
```bash
# Nuclear option - clean rebuild
npm run dev:rebuild:clean
```

## Security Notes

### npm Audit Warnings

You may see warnings like:
```
5 moderate severity vulnerabilities
```

**These are typically safe to ignore in dev because:**
- They're in dev dependencies (vitest, vite, esbuild)
- The vulnerability affects the dev server only
- Dev servers should never be exposed to untrusted networks
- Local development is isolated

**If you want to address them:**
```bash
# Check vulnerabilities
docker-compose -f docker-compose.dev.yml exec backend-dev npm audit

# Fix automatically (may cause breaking changes)
docker-compose -f docker-compose.dev.yml exec backend-dev npm audit fix

# Or update packages manually
docker-compose -f docker-compose.dev.yml exec backend-dev npm update
```

**For production:** Always run `npm audit` and fix critical/high vulnerabilities before deploying.

## Troubleshooting Slow Builds

### If builds are taking longer than expected:

1. **Check Docker resources:**
   ```bash
   docker system df
   docker system prune  # Clean up unused resources
   ```

2. **Check network speed:**
   - npm install downloads packages
   - Slow network = slow builds

3. **Check disk space:**
   ```bash
   df -h
   ```

4. **Use BuildKit (faster builds):**
   ```bash
   export DOCKER_BUILDKIT=1
   export COMPOSE_DOCKER_CLI_BUILD=1
   ```

## Best Practices

1. **Default to restart** - Only rebuild when necessary
2. **Use cached rebuilds** - Avoid `--no-cache` unless needed
3. **Keep dependencies minimal** - Fewer packages = faster installs
4. **Monitor build times** - If consistently slow, investigate

## Quick Commands

```bash
# Fast restart (most common)
npm run dev:restart

# Rebuild with cache
npm run dev:rebuild

# Clean rebuild
npm run dev:rebuild:clean

# Check status
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

