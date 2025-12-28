# Prometheus Engineer Guide

## Where Engineers Work on Prometheus

### Configuration Files Location

**Main Configuration:**
```
monitoring/prometheus/prometheus.local.yml
```

This is where engineers configure:
- What Prometheus scrapes (targets)
- Scrape intervals
- Labels and metadata
- Alert rules (optional)

### File Structure

```
life-world-os/
├── monitoring/
│   ├── prometheus/
│   │   └── prometheus.local.yml    ← ENGINEERS EDIT HERE
│   ├── grafana/
│   │   ├── datasources/
│   │   │   └── prometheus.yml      ← Data source config (rarely changed)
│   │   └── dashboards/
│   │       └── local/
│   │           ├── error-tracking.json      ← Dashboard configs
│   │           ├── health-monitoring.json
│   │           └── local-development.json
│   └── README.md
├── docker-compose.observability.local.yml   ← Service definitions
└── docs/
    └── PROMETHEUS_ENGINEER_GUIDE.md         ← This file
```

## Common Tasks for Engineers

### 1. Add a New Service to Monitor

**Edit**: `monitoring/prometheus/prometheus.local.yml`

Add to `scrape_configs` section:

```yaml
scrape_configs:
  # ... existing configs ...
  
  # New Service
  - job_name: 'new-service'
    static_configs:
      - targets: ['new-service:8080']
        labels:
          service: 'new-service'
          environment: 'dev'
    scrape_interval: 15s
    metrics_path: '/metrics'  # Adjust if different
```

**After editing:**
```bash
# Restart Prometheus to reload config
docker-compose -f docker-compose.observability.local.yml restart prometheus
```

### 2. Change Scrape Interval

**Edit**: `monitoring/prometheus/prometheus.local.yml`

```yaml
global:
  scrape_interval: 15s  # Change this value
```

Or per-job:
```yaml
- job_name: 'backend-local'
  scrape_interval: 30s  # Override global interval
```

### 3. Add Labels/Metadata

**Edit**: `monitoring/prometheus/prometheus.local.yml`

```yaml
- job_name: 'backend-local'
  static_configs:
    - targets: ['host.docker.internal:5001']
      labels:
        service: 'backend'
        environment: 'dev'
        team: 'platform'        # Add custom labels
        owner: 'backend-team'   # Add custom labels
```

### 4. Add Alert Rules (Optional)

**Create**: `monitoring/prometheus/alert_rules.yml`

```yaml
groups:
  - name: error_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_4xx_errors[5m]) + rate(http_5xx_errors[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
```

**Edit**: `monitoring/prometheus/prometheus.local.yml`

```yaml
rule_files:
  - "alert_rules.yml"  # Uncomment and add
```

### 5. Add Database Metrics (PostgreSQL Exporter)

**Step 1**: Add PostgreSQL Exporter to `docker-compose.observability.local.yml`

```yaml
services:
  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:latest
    container_name: life-world-os-postgres-exporter
    environment:
      DATA_SOURCE_NAME: "postgresql://lifeworld_dev:lifeworld_dev_local@postgres-dev:5432/lifeworld_dev?sslmode=disable"
    ports:
      - "9187:9187"
    networks:
      - observability-network
      - life-world-os-dev-network
```

**Step 2**: Edit `monitoring/prometheus/prometheus.local.yml`

```yaml
scrape_configs:
  # ... existing configs ...
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
        labels:
          service: 'postgres'
          environment: 'dev'
```

### 6. Add Frontend Metrics

**Step 1**: Frontend needs to expose metrics endpoint

**Step 2**: Edit `monitoring/prometheus/prometheus.local.yml`

```yaml
scrape_configs:
  - job_name: 'frontend-local'
    static_configs:
      - targets: ['host.docker.internal:5002']
        labels:
          service: 'frontend'
          environment: 'dev'
    scrape_interval: 15s
    metrics_path: '/metrics'
```

## Current Configuration

### Active Targets

1. **Prometheus itself**
   - Target: `localhost:9090`
   - Purpose: Self-monitoring

2. **Backend (Docker)**
   - Target: `backend-dev:3001`
   - Metrics: `/api/metrics`
   - Environment: Docker dev

3. **Backend (Local)**
   - Target: `host.docker.internal:5001`
   - Metrics: `/api/metrics`
   - Environment: Local development

4. **Node Exporter**
   - Target: `node-exporter:9100`
   - Purpose: System metrics (CPU, memory, disk)

### Configuration File

**Location**: `monitoring/prometheus/prometheus.local.yml`

**Key Sections**:
- `global` - Global settings (scrape interval, labels)
- `scrape_configs` - What to scrape (targets)
- `rule_files` - Alert rules (optional)
- `alerting` - Alertmanager config (optional)

## Testing Changes

### 1. Validate Configuration

```bash
# Check Prometheus config syntax
docker-compose -f docker-compose.observability.local.yml exec prometheus \
  promtool check config /etc/prometheus/prometheus.yml
```

### 2. Reload Configuration

```bash
# Restart Prometheus
docker-compose -f docker-compose.observability.local.yml restart prometheus

# Or reload without restart (if supported)
curl -X POST http://localhost:9090/-/reload
```

### 3. Verify Targets

Visit: http://localhost:9090/targets

Check:
- ✅ All targets are "UP"
- ✅ No scrape errors
- ✅ Metrics are being collected

### 4. Query Metrics

Visit: http://localhost:9090/graph

Test queries:
```promql
# Total requests
sum(rate(http_request_total[5m]))

# Error rate
sum(rate(http_4xx_errors[5m])) + sum(rate(http_5xx_errors[5m]))

# Backend health
up{job="backend-local"}
```

## Troubleshooting

### Target Shows "DOWN"

1. **Check service is running:**
   ```bash
   curl http://localhost:5001/api/metrics
   ```

2. **Check network connectivity:**
   ```bash
   docker-compose -f docker-compose.observability.local.yml exec prometheus \
     wget -O- http://host.docker.internal:5001/api/metrics
   ```

3. **Check Prometheus logs:**
   ```bash
   docker logs life-world-os-prometheus
   ```

### No Metrics Appearing

1. **Verify metrics endpoint exists:**
   ```bash
   curl http://localhost:5001/api/metrics
   ```

2. **Check Prometheus is scraping:**
   - Visit: http://localhost:9090/targets
   - Look for scrape errors

3. **Verify metric names match queries:**
   - Check what metrics are exposed: `curl http://localhost:5001/api/metrics`
   - Verify Grafana queries use correct metric names

### Configuration Not Reloading

1. **Restart Prometheus:**
   ```bash
   docker-compose -f docker-compose.observability.local.yml restart prometheus
   ```

2. **Check config file syntax:**
   ```bash
   docker-compose -f docker-compose.observability.local.yml exec prometheus \
     promtool check config /etc/prometheus/prometheus.yml
   ```

## Best Practices

### 1. Use Labels Consistently

```yaml
labels:
  service: 'backend'      # Service name
  environment: 'dev'      # Environment (dev/staging/prod)
  deployment: 'local'     # Deployment type (docker/local)
  team: 'platform'        # Team ownership (optional)
```

### 2. Set Appropriate Scrape Intervals

- **High-frequency services**: 5-10s
- **Standard services**: 15-30s
- **Low-priority services**: 60s+

### 3. Organize by Environment

Use different config files for different environments:
- `prometheus.local.yml` - Local development
- `prometheus.dev.yml` - Dev environment
- `prometheus.prod.yml` - Production

### 4. Document Custom Metrics

When adding new metrics, document:
- What it measures
- How it's calculated
- Expected values
- Alert thresholds

## Quick Reference

### File Locations

| File | Purpose | Who Edits |
|------|---------|-----------|
| `monitoring/prometheus/prometheus.local.yml` | Main config | **Engineers** |
| `docker-compose.observability.local.yml` | Service definitions | DevOps/Engineers |
| `monitoring/grafana/dashboards/local/*.json` | Dashboards | Engineers/Data Analysts |
| `apps/backend/src/middleware/metrics.ts` | Metrics collection | Backend Engineers |
| `apps/backend/src/routes/metrics.ts` | Metrics endpoint | Backend Engineers |

### Common Commands

```bash
# Start observability
npm run observability:up

# Restart Prometheus (after config changes)
docker-compose -f docker-compose.observability.local.yml restart prometheus

# View Prometheus targets
open http://localhost:9090/targets

# View Prometheus config
cat monitoring/prometheus/prometheus.local.yml

# Test metrics endpoint
curl http://localhost:5001/api/metrics
```

## Related Documentation

- [Monitoring README](../monitoring/README.md)
- [Prometheus Quick Start](../monitoring/QUICK_START.md)
- [Observability Quick Reference](./OBSERVABILITY_QUICK_REFERENCE.md)
- [Connection Types](../monitoring/CONNECTION_TYPES.md)

