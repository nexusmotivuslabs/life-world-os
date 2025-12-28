# Quick Start: Prometheus

**Quick Reference**: How to start and use Prometheus for local monitoring

---

## Start Prometheus

### Option 1: With Development Environment (Recommended for Dev)

Start Prometheus and Grafana with your development environment:

```bash
npm run dev:start           # Starts DB + Prometheus + Grafana
# or
npm run dev:observability   # Just Prometheus + Grafana
```

### Option 2: All Phase 1 Services

Start Prometheus, Grafana, and Portainer together:

```bash
npm run phase1:up
```

**Includes**:
- ✅ Prometheus (port 9090)
- ✅ Grafana (port 3000)
- ✅ Portainer (port 9000)
- ✅ Node Exporter (port 9100)

---

### Option 2: Observability Stack Only

Start just Prometheus, Grafana, and Node Exporter:

```bash
npm run observability:up
```

**Includes**:
- ✅ Prometheus (port 9090)
- ✅ Grafana (port 3000)
- ✅ Node Exporter (port 9100)

---

### Option 3: Direct Docker Compose

Start directly with Docker Compose:

```bash
docker-compose -f docker-compose.observability.local.yml up -d prometheus
```

### Option 4: Homebrew Services (Alternative)

If you prefer to use Homebrew Prometheus instead of Docker:

```bash
brew services start prometheus
```

**Note**: This requires installing Prometheus via Homebrew and configuring it separately. The Docker-based approach is recommended as it's already configured and integrated.

---

## Verify Prometheus is Running

### Check Status

```bash
npm run phase1:status
```

Or manually:
```bash
docker ps | grep prometheus
```

### Check Health

```bash
curl http://localhost:9090/-/healthy
```

Should return: `Prometheus Server is Healthy.`

---

## Access Prometheus

### Web UI

Open in browser: **http://localhost:9090**

### Key URLs

- **Main UI**: http://localhost:9090
- **Targets** (what Prometheus is scraping): http://localhost:9090/targets
- **Graph** (query metrics): http://localhost:9090/graph
- **Status**: http://localhost:9090/-/healthy

---

## View Logs

```bash
# All Phase 1 logs
npm run phase1:logs

# Just observability logs (Prometheus, Grafana)
npm run observability:logs

# Just Prometheus logs
docker logs -f life-world-os-prometheus
```

---

## Stop Prometheus

```bash
# Stop all Phase 1 services
npm run phase1:down

# Stop just observability stack
npm run observability:down

# Or direct
docker-compose -f docker-compose.observability.local.yml down
```

---

## What Prometheus Monitors

Prometheus automatically scrapes:

1. **Prometheus itself** (`localhost:9090`)
2. **Backend - Docker** (`backend-dev:3001`) - if running in Docker
3. **Backend - Local** (`host.docker.internal:3001`) - if running on your machine
4. **Node Exporter** (`node-exporter:9100`) - system metrics

**See**: [Connection Types](./CONNECTION_TYPES.md) for details on local/local vs local/dev

---

## Quick Reference

| Command | Action |
|---------|--------|
| `npm run dev:start` | Start DB + Prometheus + Grafana (recommended for dev) |
| `npm run dev:observability` | Start Prometheus + Grafana only |
| `npm run phase1:up` | Start all (Prometheus, Grafana, Portainer) |
| `npm run observability:up` | Start observability stack only |
| `npm run phase1:down` | Stop all |
| `npm run phase1:status` | Check status |
| `npm run phase1:logs` | View logs |
| `brew services start prometheus` | Start Prometheus via Homebrew (alternative) |
| Open http://localhost:9090 | Access Prometheus UI |
| Open http://localhost:3000 | Access Grafana UI (admin/admin) |

---

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 9090
lsof -i :9090

# Or stop existing Prometheus
docker stop life-world-os-prometheus
```

### Prometheus Not Scraping

1. Check targets: http://localhost:9090/targets
2. Verify backend is running
3. Check network connectivity
4. View logs: `docker logs life-world-os-prometheus`

### Configuration Not Loading

```bash
# Restart Prometheus to reload config
docker-compose -f docker-compose.observability.local.yml restart prometheus
```

---

## Related Documentation

- [Phase 1 Setup Guide](../docs/architecture/phase-1-setup-guide.md)
- [Connection Types](./CONNECTION_TYPES.md)
- [Monitoring README](./README.md)

