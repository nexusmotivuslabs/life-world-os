# Observability Quick Reference

## Overview

Life World OS includes comprehensive observability for tracking errors, monitoring health, and understanding system behavior.

## Endpoints

### Metrics Endpoints

**Prometheus Metrics**
```
GET /api/metrics
```
Returns Prometheus-formatted metrics for scraping.

**Error Statistics**
```
GET /api/metrics/errors?minutes=5
```
Returns 4xx/5xx error statistics for the last N minutes.

**Health Status**
```
GET /api/metrics/health
```
Returns health status for:
- Backend (uptime, memory)
- Database (connection, latency)
- Error rates
- Overall system health

## Error Tracking

### 4xx Errors (Client Errors)
- **400**: Bad Request - Invalid input
- **401**: Unauthorized - Missing/invalid token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **409**: Conflict - Resource already exists

### 5xx Errors (Server Errors)
- **500**: Internal Server Error
- **502**: Bad Gateway
- **503**: Service Unavailable

### Monitoring
- Tracked automatically by metrics middleware
- View in Grafana: "Error Tracking - 4xx/5xx Errors" dashboard
- API endpoint: `/api/metrics/errors`

## Health Monitoring

### Backend Health
- Uptime tracking
- Memory usage
- Response times
- Request rates

### Database Health
- Connection status
- Query latency
- Error rates

### Frontend Health
- Service availability
- Response times
- Error rates

### Viewing Health
- API: `GET /api/metrics/health`
- Grafana: "Health Monitoring - FE, BE, DB" dashboard

## Grafana Dashboards

### Access
- URL: http://localhost:3000
- Username: `admin`
- Password: `admin`

### Available Dashboards

1. **Error Tracking - 4xx/5xx Errors**
   - Error rate over time
   - 4xx errors by status
   - 5xx errors by status
   - Errors by route
   - Total error counts

2. **Health Monitoring - FE, BE, DB**
   - Backend health status
   - Database health status
   - Frontend health status
   - Response times
   - Request rates
   - Service status overview

3. **Local Development** (existing)
   - System overview
   - CPU/Memory usage

## Prometheus

### Access
- URL: http://localhost:9090
- Targets: http://localhost:9090/targets

### Scraping
- Backend (local): `host.docker.internal:5001/api/metrics`
- Scrape interval: 15 seconds

## Quick Start

### 1. Start Observability Stack
```bash
npm run observability:up
```

### 2. Start Backend (with metrics)
```bash
cd apps/backend
PORT=5001 npm run dev
```

### 3. View Metrics
```bash
# Prometheus metrics
curl http://localhost:5001/api/metrics

# Error statistics
curl http://localhost:5001/api/metrics/errors

# Health status
curl http://localhost:5001/api/metrics/health
```

### 4. View Dashboards
- Grafana: http://localhost:3000
- Prometheus: http://localhost:9090

## Metrics Collected

### HTTP Metrics
- `http_request_total` - Total requests by method, route, status
- `http_request_duration_ms` - Response time by method, route, status
- `http_4xx_errors` - 4xx errors by method, route, status
- `http_5xx_errors` - 5xx errors by method, route, status

### System Metrics
- Backend uptime
- Memory usage
- Database connection status
- Database query latency

## Alerts (Future)

Recommended alert thresholds:
- Error rate > 10% → Warning
- Error rate > 20% → Critical
- 5xx errors > 0 → Warning
- Database latency > 500ms → Warning
- Backend down → Critical

## Troubleshooting

### No Metrics Appearing
1. Check backend is running: `curl http://localhost:5001/api/health`
2. Check metrics endpoint: `curl http://localhost:5001/api/metrics`
3. Verify Prometheus is scraping: http://localhost:9090/targets
4. Check Prometheus config: `monitoring/prometheus/prometheus.local.yml`

### Grafana Shows No Data
1. Check Prometheus data source is configured
2. Verify Prometheus is running: http://localhost:9090
3. Check dashboard queries match metric names
4. Verify time range in Grafana

### High Error Rates
1. Check `/api/metrics/errors` for breakdown
2. Review application logs
3. Check database connection
4. Verify authentication is working

## Related Documents

- [Golden Paths](./GOLDEN_PATHS.md) - User workflows
- [Observability Dev Guide](./OBSERVABILITY_DEV.md) - Detailed setup
- [Monitoring README](../monitoring/README.md) - Monitoring overview

