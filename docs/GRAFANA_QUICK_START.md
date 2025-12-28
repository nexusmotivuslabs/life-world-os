# Grafana Quick Start

**Quick Reference**: How to start and use Grafana for local monitoring

---

## Start Grafana

### Option 1: With Development Environment (Recommended for Dev)

Start Grafana with your development environment:

```bash
npm run dev:start       # Starts DB + Prometheus + Grafana
# or
npm run dev:observability  # Just Prometheus + Grafana
```

### Option 2: All Phase 1 Services

Start Prometheus, Grafana, and Portainer together:

```bash
npm run phase1:up
```

### Option 3: Observability Stack Only

Start just Prometheus, Grafana, and Node Exporter:

```bash
npm run observability:up
```

---

## Access Grafana

### Web UI

Open in browser: **http://localhost:3000**

### Default Credentials

- **Username**: `admin`
- **Password**: `admin`

**Note**: You'll be prompted to change the password on first login.

---

## First Time Setup

### 1. Login

1. Open http://localhost:3000
2. Login with `admin` / `admin`
3. Change password when prompted

### 2. Verify Data Source

Prometheus is already configured as a data source:

1. Go to **Configuration** → **Data Sources**
2. You should see **Prometheus** already configured
3. Click **Prometheus** to verify it's working
4. Click **Save & Test** - should show "Data source is working"

### 3. View Dashboards

1. Go to **Dashboards** → **Browse**
2. Look for **Local Build with Dev** folder
3. Open **Local Development** dashboard

---

## Key Features

### Dashboards

- **Local Development**: System and backend metrics

### Data Sources

- **Prometheus**: Pre-configured at `http://prometheus:9090`

### Queries

Use PromQL to query metrics:
```promql
up{job="backend-dev"}
```

---

## Useful Commands

```bash
# Start with dev environment
npm run dev:start

# Start just observability
npm run dev:observability

# Check status
npm run phase1:status

# View logs
npm run observability:logs

# Stop
npm run observability:down
```

---

## Troubleshooting

### Grafana Not Loading

1. Check if it's running: `docker ps | grep grafana`
2. Check logs: `docker logs life-world-os-grafana`
3. Verify port 3000 is available: `lsof -i :3000`

### Can't Connect to Prometheus

1. Verify Prometheus is running: `curl http://localhost:9090/-/healthy`
2. Check Grafana logs: `docker logs life-world-os-grafana`
3. Verify data source configuration: Configuration → Data Sources → Prometheus

### Dashboard Not Showing Data

1. Verify Prometheus has data: http://localhost:9090/targets
2. Check dashboard queries use correct labels
3. Verify time range in dashboard (top right)

---

## Related Documentation

- [Prometheus Quick Start](../monitoring/QUICK_START.md)
- [Phase 1 Setup Guide](./architecture/phase-1-setup-guide.md)
- [Connection Types](../monitoring/CONNECTION_TYPES.md)

