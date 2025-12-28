# Phase 1: Local Build with Dev - Observability

**Priority**: 1  
**Environment**: Local Build connecting to Dev Environment  
**Timeline**: Current  
**Status**: ✅ Complete  
**Connection to Dev**: Monitors and manages dev environment services for development and testing

---

## Overview

Phase 1 focuses on setting up observability and management tools for **local build with dev environment**. This phase provides monitoring and container management that connects to **BOTH**:

1. **Local/Local**: Services running directly on your local machine (not in Docker)
2. **Local/Dev**: Services running in Docker containers with dev profile

This provides complete visibility for development and testing, regardless of which deployment method you're using.

---

## Goals

1. Set up local monitoring and observability
2. Provide container management UI
3. Enable local development best practices
4. Prepare foundation for future phases

---

## Components

### 1. Prometheus + Grafana (Monitoring)

**Purpose**: Local metrics collection and dashboards for development

**Configuration:**
- Prometheus: Scrape metrics from local services
- Grafana: Visualize metrics with dashboards
- Node Exporter: System-level metrics (optional)

**Access:**
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000` (admin/admin)

**Files to Create:**
- `docker-compose.observability.local.yml`
- `monitoring/prometheus/prometheus.local.yml`
- `monitoring/grafana/dashboards/local/`

---

### 2. Portainer (Container Management)

**Purpose**: Web UI for managing Docker containers locally

**Features:**
- Container management
- Image management
- Network and volume management
- Log viewing

**Access:**
- Portainer: `http://localhost:9000`

**Files to Create:**
- `docker-compose.portainer.yml`

---

### 3. Optional: Docker Registry (Local Image Testing)

**Purpose**: Self-hosted container registry for local image testing

**Use Case**: Only if you need to test image registry workflows locally

**Access:**
- Registry: `http://localhost:5000`

**Files to Create:**
- `docker-compose.registry.local.yml` (optional)

---

## Excluded from Phase 1

The following tools are **NOT** included in Phase 1 (they will be introduced in Phase 2):

- ❌ **Loki** (log aggregation) - For staging/prod
- ❌ **Vault** (secrets management) - For staging/prod
- ❌ **Production secrets management** - For staging/prod
- ❌ **Staging/prod observability** - For Phase 2

---

## Implementation Steps

### Step 1: Create Observability Stack

```bash
# Create directory structure
mkdir -p monitoring/prometheus
mkdir -p monitoring/grafana/dashboards/local
mkdir -p monitoring/grafana/datasources

# Create docker-compose file
# See: docker-compose.observability.local.yml

# Start services
docker-compose -f docker-compose.observability.local.yml up -d
```

### Step 2: Create Portainer

```bash
# Create docker-compose file
# See: docker-compose.portainer.yml

# Start service
docker-compose -f docker-compose.portainer.yml up -d
```

### Step 3: Configure Prometheus

Create `monitoring/prometheus/prometheus.local.yml`:
- Scrape local backend (port 3001)
- Scrape local frontend (if metrics available)
- System metrics (optional)

### Step 4: Configure Grafana

Create `monitoring/grafana/datasources/prometheus.yml`:
- Add Prometheus as data source
- Create local development dashboards

---

## Deliverables

### Files to Create

1. **Docker Compose Files:**
   - `docker-compose.observability.local.yml` - Prometheus, Grafana
   - `docker-compose.portainer.yml` - Portainer

2. **Configuration Files:**
   - `monitoring/prometheus/prometheus.local.yml` - Prometheus config
   - `monitoring/grafana/datasources/prometheus.yml` - Grafana data source
   - `monitoring/grafana/dashboards/local/*.json` - Local dashboards

3. **Documentation:**
   - Setup instructions
   - Usage guide
   - Troubleshooting guide

---

## Usage

### Start Local Observability

```bash
# Start all local infrastructure
docker-compose -f docker-compose.observability.local.yml up -d
docker-compose -f docker-compose.portainer.yml up -d

# Verify services
curl http://localhost:9090/api/v1/status/config  # Prometheus
curl http://localhost:3000/api/health            # Grafana
curl http://localhost:9000/api/status            # Portainer
```

### Access Dashboards

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)
- **Portainer**: http://localhost:9000

### Stop Services

```bash
docker-compose -f docker-compose.observability.local.yml down
docker-compose -f docker-compose.portainer.yml down
```

---

## Integration with Existing Setup

### Current Local Setup

- ✅ Docker Compose (dev environment)
- ✅ PostgreSQL (Docker)
- ✅ Nginx (domains)
- ✅ Console logging

### Phase 1 Adds

- ⚠️ Prometheus (metrics)
- ⚠️ Grafana (dashboards)
- ⚠️ Portainer (management UI)

### No Changes Required

- Existing Docker Compose files remain unchanged
- Existing services continue to work
- Phase 1 is additive only

---

## Next Steps

After Phase 1 is complete:

1. **Phase 2**: AWS Staging Migration
   - Introduce AWS services for staging
   - Add Loki + Promtail for log aggregation
   - Add Vault or Secrets Manager
   - Migrate staging to ECS Fargate

2. **Phase 3**: AWS Production Migration
   - Production-grade AWS services
   - Enhanced security and reliability
   - Multi-AZ deployment

---

## Related Documentation

- [Architecture Overview](./overview.md)
- [Phase 2: AWS Staging](./phase-2-aws-staging.md)
- [Phase 3: AWS Production](./phase-3-aws-production.md)
- [Tool Mapping](./tool-mapping.md)

