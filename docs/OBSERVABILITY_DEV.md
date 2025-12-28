# Observability for Development Environment

This guide explains how to set up observability (logging and monitoring) for the development environment.

## Quick Start

### Start Observability Stack

```bash
npm run observability:up
```

This starts:
- **Prometheus** - Metrics collection (http://localhost:9090)
- **Grafana** - Dashboards and visualization (http://localhost:3000)
- **Node Exporter** - System metrics (http://localhost:9100)

### View Logs

**View all development logs:**
```bash
npm run dev:full:logs
```

**View specific service logs:**
```bash
# Backend logs
docker logs -f life-world-os-backend-dev

# Frontend logs  
docker logs -f life-world-os-frontend-dev

# Database logs
docker logs -f life-db-dev
```

**View observability logs:**
```bash
npm run observability:logs
```

## Connecting Observability to Dev Environment

The observability stack (`docker-compose.observability.local.yml`) is configured to connect to the dev environment network. This allows:

1. **Prometheus** to scrape metrics from your dev services
2. **Grafana** to query Prometheus for visualization
3. **Log aggregation** (when configured)

### Network Configuration

The observability stack connects to:
- `life-world-os-dev-network` - Development services network
- `life-world-os-staging-network` - Staging services network (optional)

### Verify Connection

1. **Check networks are connected:**
   ```bash
   docker network inspect life-world-os-dev-network | grep -A 10 "Containers"
   ```

2. **Check Prometheus targets:**
   - Open http://localhost:9090
   - Go to Status > Targets
   - Verify dev services are listed and "UP"

3. **Check Grafana data sources:**
   - Open http://localhost:3000
   - Login: admin/admin
   - Go to Configuration > Data Sources
   - Verify Prometheus is configured

## Viewing Application Logs

### Using Docker Logs (Recommended for Dev)

**Real-time logs:**
```bash
# All dev services
docker-compose -f docker-compose.dev.yml logs -f

# Backend only
docker-compose -f docker-compose.dev.yml logs -f backend-dev

# Last 100 lines
docker-compose -f docker-compose.dev.yml logs --tail=100 backend-dev

# With timestamps
docker-compose -f docker-compose.dev.yml logs -f --timestamps backend-dev
```

**Using container names:**
```bash
# Backend
docker logs -f life-world-os-backend-dev

# Frontend
docker logs -f life-world-os-frontend-dev

# Database
docker logs -f life-db-dev
```

### Using Grafana (When Configured)

If you configure log aggregation (e.g., Loki), you can view logs in Grafana:

1. Start observability stack: `npm run observability:up`
2. Configure Loki data source in Grafana
3. View logs in Grafana dashboards

### Filtering Logs

**Error logs only:**
```bash
docker logs life-world-os-backend-dev 2>&1 | grep -i error
```

**Search for specific text:**
```bash
docker logs life-world-os-backend-dev 2>&1 | grep -i "seed\|validation\|database"
```

**Last 50 lines with errors:**
```bash
docker logs --tail=50 life-world-os-backend-dev 2>&1 | grep -i error
```

## Monitoring Endpoints

### Health Checks

```bash
# Backend health
curl http://localhost:3001/api/health | jq .

# Staging backend health
curl http://localhost:3002/api/health | jq .
```

### Prometheus Metrics

If your backend exposes Prometheus metrics:

```bash
# Backend metrics (if configured)
curl http://localhost:3001/metrics
```

## Common Use Cases

### Debugging "Data Connection Issue"

1. **Check backend logs:**
   ```bash
   docker logs --tail=100 life-world-os-backend-dev | grep -i "validation\|seed\|database\|error"
   ```

2. **Check if database is seeded:**
   ```bash
   docker exec life-world-os-backend-dev npm run seed
   ```

3. **Check health endpoint:**
   ```bash
   curl http://localhost:3001/api/health | jq .
   ```

4. **Check database connection:**
   ```bash
   docker exec life-db-dev pg_isready -U lifeworld_dev
   ```

### Monitoring Application Startup

```bash
# Watch backend startup logs
docker logs -f life-world-os-backend-dev

# Look for:
# - ✅ Startup validation messages
# - ❌ Validation failures
# - Database connection status
# - Seed data status
```

### Tracking API Requests

```bash
# View all backend logs (includes API requests)
docker logs -f life-world-os-backend-dev

# Filter for specific endpoints
docker logs life-world-os-backend-dev 2>&1 | grep "GET\|POST\|PUT\|DELETE"
```

## Stopping Observability

```bash
npm run observability:down
```

## Configuration

### Prometheus Configuration

Prometheus configuration is in:
- `monitoring/prometheus/prometheus.local.yml`

To add new targets, edit this file and restart Prometheus:
```bash
docker-compose -f docker-compose.observability.local.yml restart prometheus
```

### Grafana Configuration

Grafana configuration is in:
- `monitoring/grafana/datasources/` - Data source configurations
- `monitoring/grafana/dashboards/` - Dashboard definitions

Default credentials:
- Username: `admin`
- Password: `admin` (change on first login)

## Troubleshooting

### Observability Stack Won't Start

1. **Check ports are available:**
   ```bash
   lsof -i :9090  # Prometheus
   lsof -i :3000  # Grafana (conflicts with backend if running on same port)
   ```

2. **Check Docker networks:**
   ```bash
   docker network ls | grep observability
   docker network ls | grep life-world-os-dev-network
   ```

3. **Check logs:**
   ```bash
   docker-compose -f docker-compose.observability.local.yml logs
   ```

### Can't See Dev Services in Prometheus

1. **Verify network connection:**
   ```bash
   docker network inspect life-world-os-dev-network
   ```

2. **Check Prometheus configuration:**
   ```bash
   cat monitoring/prometheus/prometheus.local.yml
   ```

3. **Restart Prometheus:**
   ```bash
   docker-compose -f docker-compose.observability.local.yml restart prometheus
   ```

### Grafana Can't Query Prometheus

1. **Check Prometheus is running:**
   ```bash
   curl http://localhost:9090/-/healthy
   ```

2. **Verify data source in Grafana:**
   - Login to Grafana (http://localhost:3000)
   - Go to Configuration > Data Sources
   - Test Prometheus connection

3. **Check network connectivity:**
   ```bash
   docker exec life-world-os-prometheus wget -qO- http://localhost:9090/api/v1/status/config
   ```

## Next Steps

- [Monitoring Setup Guide](../monitoring/README.md)
- [Database Seeding Guide](./DATABASE_SEEDING.md)
- [Troubleshooting Guide](../TROUBLESHOOTING.md)

