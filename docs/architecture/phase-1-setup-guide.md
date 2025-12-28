# Phase 1 Setup Guide

**Phase**: 1 - Local Infrastructure  
**Status**: ✅ Ready to Deploy  
**Purpose**: Set up local observability and container management

---

## Quick Start

```bash
# One-command setup
npm run phase1:up

# Or use the setup script
./scripts/setup-phase1.sh
```

---

## What Gets Installed

### 1. Prometheus (Metrics Collection)
- **Port**: 9090
- **URL**: http://localhost:9090
- **Purpose**: Collects metrics from local services

### 2. Grafana (Dashboards)
- **Port**: 3000
- **URL**: http://localhost:3000
- **Credentials**: admin/admin
- **Purpose**: Visualize metrics with dashboards

### 3. Portainer (Container Management)
- **Port**: 9000
- **URL**: http://localhost:9000
- **Purpose**: Web UI for managing Docker containers

### 4. Node Exporter (System Metrics)
- **Port**: 9100
- **Purpose**: System-level metrics (CPU, memory, disk)

---

## Prerequisites

Before starting Phase 1, ensure:

- ✅ Docker is running
- ✅ Docker Compose is installed
- ✅ Ports 9090, 3000, 9000, 9100 are available

**Check prerequisites:**
```bash
npm run verify
```

---

## Setup Steps

### Step 1: Create Directory Structure

The setup script creates this automatically, but you can create manually:

```bash
mkdir -p monitoring/prometheus
mkdir -p monitoring/grafana/dashboards/local
mkdir -p monitoring/grafana/datasources
```

### Step 2: Start Services

```bash
# Option 1: Using NPM scripts
npm run phase1:up

# Option 2: Using setup script
./scripts/setup-phase1.sh

# Option 3: Manual
docker-compose -f docker-compose.observability.local.yml up -d
docker-compose -f docker-compose.portainer.yml up -d
```

### Step 3: Verify Services

```bash
# Check status
npm run phase1:status

# Or manually
curl http://localhost:9090/-/healthy  # Prometheus
curl http://localhost:3000/api/health  # Grafana
curl http://localhost:9000/api/status  # Portainer
```

### Step 4: Access Dashboards

1. **Grafana**: http://localhost:3000
   - Login: admin/admin
   - Change password on first login
   - Check "Local Development" dashboard

2. **Prometheus**: http://localhost:9090
   - View targets: http://localhost:9090/targets
   - Query metrics: http://localhost:9090/graph

3. **Portainer**: http://localhost:9000
   - Create admin account on first access
   - Manage containers, images, networks

---

## Configuration

### Prometheus Configuration

**File**: `monitoring/prometheus/prometheus.local.yml`

**Scrapes**:
- Prometheus itself (localhost:9090)
- Backend service - **BOTH**:
  - `backend-dev:3001` (Docker dev services - local/dev)
  - `host.docker.internal:3001` (Local machine services - local/local)
- Node Exporter (node-exporter:9100)

**Connection Types**:
- **local/local**: Monitors services running on your local machine
- **local/dev**: Monitors dev environment Docker containers

**To add more targets**, edit the scrape_configs section.

**See**: [Connection Types](../../monitoring/CONNECTION_TYPES.md) for details

### Grafana Configuration

**Data Source**: `monitoring/grafana/datasources/prometheus.yml`
- Automatically configured to use Prometheus
- No manual setup needed

**Dashboards**: `monitoring/grafana/dashboards/local/`
- Pre-configured "Local Development" dashboard
- Add more dashboards as JSON files

---

## Usage

### Start Services

```bash
npm run phase1:up
```

### Stop Services

```bash
npm run phase1:down
```

### View Logs

```bash
npm run phase1:logs
```

### Check Status

```bash
npm run phase1:status
```

### Individual Service Management

```bash
# Observability only
npm run observability:up
npm run observability:down
npm run observability:logs

# Portainer only
npm run portainer:up
npm run portainer:down
npm run portainer:logs
```

---

## Integration with Existing Services

### Connecting to Services

Prometheus scrapes metrics from **BOTH** connection types:

1. **Local/Local** (local/local):
   - **Backend locally**: `host.docker.internal:3001` (if running on your machine)
   - Use case: Active development with hot reload

2. **Local/Dev** (local/dev):
   - **Backend in Docker**: `backend-dev:3001` (if running in Docker Compose)
   - Use case: Testing Docker deployment

**Both are monitored simultaneously** - Prometheus will scrape whichever is running (or both if both are active).

**See**: [Connection Types](../../monitoring/CONNECTION_TYPES.md) for complete details

**Note**: Your backend needs to expose a `/api/metrics` endpoint for Prometheus to scrape. This is optional for Phase 1.

### Network Configuration

Phase 1 services connect to:
- `observability-network` - Internal network for observability stack
- `life-world-os-dev-network` - Connects to dev services (if running)

---

## Troubleshooting

### Services Not Starting

```bash
# Check Docker is running
docker info

# Check ports are available
lsof -i :9090  # Prometheus
lsof -i :3000  # Grafana
lsof -i :9000  # Portainer
```

### Prometheus Not Scraping

1. Check targets: http://localhost:9090/targets
2. Verify backend is running
3. Check network connectivity
4. Verify scrape config in `prometheus.local.yml`

### Grafana Not Showing Data

1. Check Prometheus data source is configured
2. Verify Prometheus is accessible from Grafana
3. Check dashboard queries
4. View Grafana logs: `npm run observability:logs`

### Portainer Not Accessible

1. Check container is running: `docker ps | grep portainer`
2. Check logs: `npm run portainer:logs`
3. Verify port 9000 is not in use

---

## Adding Metrics to Backend

To expose metrics for Prometheus scraping, add a metrics endpoint:

```typescript
// apps/backend/src/routes/metrics.ts
import { Router } from 'express'

const router = Router()

router.get('/metrics', async (req, res) => {
  // Return Prometheus-formatted metrics
  res.set('Content-Type', 'text/plain')
  res.send('# Metrics endpoint\n')
})

export default router
```

Then add to main app:
```typescript
app.use('/api/metrics', metricsRoutes)
```

---

## Next Steps

After Phase 1 is set up:

1. **Explore Grafana**: Create custom dashboards
2. **Monitor Services**: Watch metrics in real-time
3. **Manage Containers**: Use Portainer for container management
4. **Prepare for Phase 2**: When ready, proceed to AWS Staging migration

---

## Related Documentation

- [Phase 1: Local Infrastructure](./phase-1-local-infrastructure.md)
- [Architecture Overview](./overview.md)
- [Phase 0: Foundation](./phase-0-foundation.md)

