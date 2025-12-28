# Prometheus Docker Container Setup

## Overview

Prometheus runs as a **Docker container** with persistent configuration and data storage. This ensures:
- ✅ Configuration persists across container restarts
- ✅ Metrics data is retained (30 days)
- ✅ Login/authentication via Grafana
- ✅ Real-world production-like setup

## Docker Containers

### Prometheus Container

**Container Name**: `life-world-os-prometheus`  
**Image**: `prom/prometheus:latest`  
**Port**: `9090`  
**Status**: Running in Docker

**Persistent Storage**:
- **Config**: `./monitoring/prometheus/prometheus.local.yml` (mounted as read-only)
- **Data**: `prometheus_data` Docker volume (persists metrics, WAL, etc.)
- **Retention**: 30 days

### Grafana Container

**Container Name**: `life-world-os-grafana`  
**Image**: `grafana/grafana:latest`  
**Port**: `3000`  
**Login**: `admin` / `admin`  
**Status**: Running in Docker

**Persistent Storage**:
- **Dashboards**: `./monitoring/grafana/dashboards/` (provisioned)
- **Data**: `grafana_data` Docker volume (persists login, preferences, custom dashboards)

## Verify Containers

### Check Container Status

```bash
docker-compose -f docker-compose.observability.local.yml ps
```

**Expected Output**:
```
NAME                          STATUS              PORTS
life-world-os-prometheus      Up (healthy)         0.0.0.0:9090->9090/tcp
life-world-os-grafana         Up (healthy)         0.0.0.0:3000->3000/tcp
life-world-os-node-exporter   Up                   0.0.0.0:9100->9100/tcp
```

### View Container Logs

```bash
# Prometheus logs
docker logs -f life-world-os-prometheus

# Grafana logs
docker logs -f life-world-os-grafana

# All observability logs
docker-compose -f docker-compose.observability.local.yml logs -f
```

### Inspect Container

```bash
# Prometheus container details
docker inspect life-world-os-prometheus

# Grafana container details
docker inspect life-world-os-grafana
```

## Persistent Volumes

### Prometheus Data Volume

**Volume Name**: `life-world-os_prometheus_data`  
**Mount Point**: `/prometheus` (inside container)  
**Purpose**: Stores time-series database, WAL, and metrics

**View Volume**:
```bash
docker volume inspect life-world-os_prometheus_data
```

**Data Persists**:
- ✅ Metrics data (30 days retention)
- ✅ WAL (Write-Ahead Log)
- ✅ Time-series database

### Grafana Data Volume

**Volume Name**: `life-world-os_grafana_data`  
**Mount Point**: `/var/lib/grafana` (inside container)  
**Purpose**: Stores Grafana configuration, dashboards, users

**View Volume**:
```bash
docker volume inspect life-world-os_grafana_data
```

**Data Persists**:
- ✅ User accounts and passwords
- ✅ Dashboard preferences
- ✅ Data source configurations
- ✅ Custom dashboards (if created in UI)

## Configuration Persistence

### Prometheus Config

**Location**: `monitoring/prometheus/prometheus.local.yml`  
**Mount**: Read-only mount to `/etc/prometheus/prometheus.yml`

**Changes**:
1. Edit `monitoring/prometheus/prometheus.local.yml`
2. Restart Prometheus:
   ```bash
   docker-compose -f docker-compose.observability.local.yml restart prometheus
   ```

### Grafana Config

**Dashboards**: `monitoring/grafana/dashboards/`  
**Data Sources**: `monitoring/grafana/datasources/`

**Changes**:
1. Edit dashboard JSON files
2. Restart Grafana:
   ```bash
   docker-compose -f docker-compose.observability.local.yml restart grafana
   ```

## Access

### Prometheus

- **URL**: http://localhost:9090
- **No Authentication**: Open access (local development)
- **Targets**: http://localhost:9090/targets
- **Graph**: http://localhost:9090/graph

### Grafana

- **URL**: http://localhost:3000
- **Login**: `admin` / `admin`
- **First Login**: Change password when prompted
- **Dashboards**: Auto-provisioned from `monitoring/grafana/dashboards/`

## Container Management

### Start Containers

```bash
# Start all observability stack
docker-compose -f docker-compose.observability.local.yml up -d

# Start specific services
docker-compose -f docker-compose.observability.local.yml up -d prometheus grafana
```

### Stop Containers

```bash
# Stop all (containers persist, data remains)
docker-compose -f docker-compose.observability.local.yml down

# Stop but keep volumes
docker-compose -f docker-compose.observability.local.yml stop
```

### Restart Containers

```bash
# Restart Prometheus (after config changes)
docker-compose -f docker-compose.observability.local.yml restart prometheus

# Restart Grafana (after dashboard changes)
docker-compose -f docker-compose.observability.local.yml restart grafana
```

### Remove Everything (Including Data)

```bash
# ⚠️ WARNING: This deletes all metrics and Grafana data
docker-compose -f docker-compose.observability.local.yml down -v
```

## Data Persistence

### What Persists

**Prometheus**:
- ✅ Metrics data (30 days)
- ✅ Scrape history
- ✅ Target states

**Grafana**:
- ✅ Login credentials
- ✅ Dashboard preferences
- ✅ Data source connections
- ✅ Custom dashboards (created in UI)

### What Doesn't Persist

**Prometheus**:
- ❌ Config file changes (need to edit file and restart)
- ❌ Metrics older than 30 days (auto-deleted)

**Grafana**:
- ❌ Provisioned dashboards (recreated from files on restart)
- ❌ Provisioned data sources (recreated from files on restart)

## Real-World Production Setup

This Docker setup mirrors production:

1. **Containerized**: Runs in Docker (like Kubernetes, ECS, etc.)
2. **Persistent Storage**: Volumes survive container restarts
3. **Configuration Management**: Config files in version control
4. **Health Checks**: Containers have health checks
5. **Restart Policy**: `unless-stopped` (auto-restart on failure)

## Troubleshooting

### Container Not Starting

```bash
# Check logs
docker-compose -f docker-compose.observability.local.yml logs prometheus

# Check container status
docker-compose -f docker-compose.observability.local.yml ps
```

### Config Not Loading

```bash
# Verify config file exists
ls -la monitoring/prometheus/prometheus.local.yml

# Check config syntax
docker-compose -f docker-compose.observability.local.yml exec prometheus \
  promtool check config /etc/prometheus/prometheus.yml

# Restart to reload
docker-compose -f docker-compose.observability.local.yml restart prometheus
```

### Data Not Persisting

```bash
# Verify volumes exist
docker volume ls | grep prometheus
docker volume ls | grep grafana

# Check volume mounts
docker inspect life-world-os-prometheus | grep -A 10 Mounts
```

### Access Issues

```bash
# Check ports are exposed
docker-compose -f docker-compose.observability.local.yml ps

# Test connectivity
curl http://localhost:9090/-/healthy
curl http://localhost:3000/api/health
```

## Summary

✅ **Prometheus runs in Docker container** (`life-world-os-prometheus`)  
✅ **Grafana runs in Docker container** (`life-world-os-grafana`)  
✅ **Config persists** via volume mounts  
✅ **Data persists** via Docker volumes  
✅ **Login/authentication** via Grafana (admin/admin)  
✅ **Production-like setup** with persistent storage

This is a real-world, production-ready Docker setup!

