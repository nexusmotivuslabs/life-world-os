# Monitoring Configuration

**Phase**: 1 - Local Infrastructure  
**Purpose**: Local development monitoring and observability

---

## Directory Structure

```
monitoring/
├── prometheus/
│   └── prometheus.local.yml    # Prometheus configuration
├── grafana/
│   ├── datasources/
│   │   └── prometheus.yml      # Grafana data source config
│   └── dashboards/
│       ├── dashboard.yml       # Dashboard provider config
│       └── local/
│           └── local-development.json  # Local dev dashboard
└── README.md                   # This file
```

---

## Configuration Files

### Prometheus

**File**: `prometheus/prometheus.local.yml`

**Purpose**: Configure what Prometheus scrapes

**Current Targets**:
- Prometheus itself (localhost:9090)
- Backend service - **BOTH**:
  - `backend-dev:3001` (Docker dev services - local/dev)
  - `host.docker.internal:3001` (Local machine services - local/local)
- Node Exporter (node-exporter:9100)

**See**: [Connection Types](./CONNECTION_TYPES.md) for details on local/local vs local/dev

**To Add More Targets**: Edit `scrape_configs` section

---

### Grafana

**Data Source**: `grafana/datasources/prometheus.yml`
- Automatically configured
- Points to Prometheus service

**Dashboards**: `grafana/dashboards/local/`
- Add JSON dashboard files here
- They'll be automatically loaded

---

## Usage

### Start Monitoring

```bash
npm run phase1:up
# or
docker-compose -f docker-compose.observability.local.yml up -d
```

### Access

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)
- **Node Exporter**: http://localhost:9100/metrics

---

## Adding Custom Dashboards

1. Create dashboard JSON file in `grafana/dashboards/local/`
2. Restart Grafana: `docker-compose -f docker-compose.observability.local.yml restart grafana`
3. Dashboard will appear in Grafana UI

---

## Adding Metrics to Backend

To expose metrics for Prometheus:

1. Create `/api/metrics` endpoint in backend
2. Return Prometheus-formatted metrics
3. Prometheus will automatically scrape (already configured)

---

## Related Documentation

- [Phase 1 Setup Guide](../docs/architecture/phase-1-setup-guide.md)
- [Phase 1: Local Infrastructure](../docs/architecture/phase-1-local-infrastructure.md)

