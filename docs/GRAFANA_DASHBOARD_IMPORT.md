# Grafana Dashboard Import Guide

## Quick Import

Since auto-provisioning has issues, import dashboards manually:

### Step 1: Access Grafana
- URL: http://localhost:3000
- Login: `admin` / `admin`

### Step 2: Import Dashboard
1. Click **"Dashboards"** in left menu
2. Click **"Import"** button
3. Click **"Upload JSON file"**
4. Select one of these files:
   - `monitoring/grafana/dashboards/local/backend-metrics.json`
   - `monitoring/grafana/dashboards/local/frontend-metrics.json`
   - `monitoring/grafana/dashboards/local/database-metrics.json`
5. Click **"Load"**
6. Click **"Import"**

### Step 3: Repeat for Each Dashboard
Import all three dashboards using the same process.

## Dashboard Details

### Backend Metrics
**File**: `backend-metrics.json`

**Tracks**:
- Backend status (up/down)
- Request rate (requests/sec)
- Error rate (4xx + 5xx)
- Response time (p50, p95, p99)
- Status code distribution
- Top routes by traffic

### Frontend Metrics
**File**: `frontend-metrics.json`

**Tracks**:
- Frontend status (up/down)
- Uptime (seconds)
- Request rate
- Error breakdown (4xx vs 5xx)
- Error trends over time

### Database Metrics
**File**: `database-metrics.json`

**Tracks**:
- Database connection status
- Backend-DB connection health
- Query latency (p50, p95, p99)
- Database request rate
- Database error rates

## Alternative: Copy-Paste Import

If file upload doesn't work:

1. Open Grafana → Dashboards → Import
2. Click **"Import via panel json"**
3. Copy entire JSON content from dashboard file
4. Paste into text area
5. Click **"Load"** then **"Import"**

## Verify Import

After importing, you should see:
- ✅ Backend Metrics dashboard
- ✅ Frontend Metrics dashboard
- ✅ Database Metrics dashboard

All in the "Dashboards" list.

## Troubleshooting

**"Invalid JSON" error**:
- Verify file is valid JSON: `python3 -m json.tool < file.json`
- Check for syntax errors

**"Data source not found"**:
- Ensure Prometheus data source is configured
- Check: Configuration → Data Sources → Prometheus

**No data showing**:
- Verify Prometheus is scraping targets
- Check: http://localhost:9090/targets
- Ensure services are generating metrics

## File Locations

All dashboard files are in:
```
monitoring/grafana/dashboards/local/
```

- `backend-metrics.json`
- `frontend-metrics.json`
- `database-metrics.json`

