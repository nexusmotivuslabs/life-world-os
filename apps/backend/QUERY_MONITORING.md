# Query Monitoring Guide

**Version**: 1.0.0  
**Last Updated**: 2025-01-27

## Overview

This guide explains how to monitor Query (the AI chatbot) in Life World OS. Query monitoring includes metrics for usage, performance, errors, and user interactions.

## Quick Start

### 1. Start Observability Stack

```bash
# Start Prometheus + Grafana
npm run observability:up
# or
docker-compose -f docker-compose.observability.local.yml up -d
```

### 2. Access Monitoring Tools

- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Backend Metrics**: http://localhost:3001/api/metrics

### 3. View Query Metrics

```bash
# Query-specific metrics endpoint
curl http://localhost:3001/api/metrics/query

# All metrics (includes Query)
curl http://localhost:3001/api/metrics
```

## Metrics Collected

### Query-Specific Metrics

1. **`query_requests_total`**
   - Total number of Query requests
   - Labels: `persona`, `provider`, `status` (success/error)

2. **`query_response_time_ms`**
   - Response latency in milliseconds
   - Labels: `persona`, `provider`

3. **`query_tokens_used`**
   - Token usage (input + output)
   - Labels: `persona`, `provider`, `type` (input/output)

4. **`query_errors_total`**
   - Total errors
   - Labels: `persona`, `provider`, `error_type`

5. **`query_artifacts_detected`**
   - Number of artifacts detected in responses
   - Labels: `artifact_name`

6. **`query_prompt_version`**
   - Prompt version usage
   - Labels: `version`, `persona`

### HTTP Metrics (Automatic)

- `http_request_total{route="/api/chat"}`
- `http_request_duration_ms{route="/api/chat"}`
- `http_4xx_errors{route="/api/chat"}`
- `http_5xx_errors{route="/api/chat"}`

## Monitoring Methods

### Method 1: Backend Logs

Query logs all interactions to console:

```bash
# Watch backend logs
cd apps/backend
npm run dev

# Look for Query logs:
[Prompt] query@ollama v1.0.0 - 2025-01-27T...
[Query] Request: persona=query, provider=ollama, userId=...
[Query] Response: latency=1200ms, tokens=350
```

### Method 2: Metrics API

```bash
# Get Query metrics
curl http://localhost:3001/api/metrics/query

# Response:
query_requests_total{persona="query",provider="ollama",status="success"} 42
query_response_time_ms{persona="query",provider="ollama"} 1200
query_tokens_used{persona="query",provider="ollama",type="input"} 150
query_tokens_used{persona="query",provider="ollama",type="output"} 200
```

### Method 3: Prometheus Queries

Access Prometheus at http://localhost:9090 and run queries:

```promql
# Total Query requests
sum(query_requests_total)

# Average response time
avg(query_response_time_ms)

# Requests by persona
sum by (persona) (query_requests_total)

# Error rate
sum(query_errors_total) / sum(query_requests_total) * 100

# Token usage over time
sum by (type) (rate(query_tokens_used[5m]))
```

### Method 4: Grafana Dashboard

1. **Access Grafana**: http://localhost:3000
2. **Create Dashboard** (or use existing)
3. **Add Panels**:
   - Query Requests Over Time
   - Response Time (p50, p95, p99)
   - Error Rate
   - Token Usage
   - Requests by Persona/Provider

## Key Metrics to Monitor

### Performance

- **Response Time**: Should be < 2s for Ollama, < 1s for Groq
- **Error Rate**: Should be < 1%
- **Token Usage**: Track for cost optimization

### Usage

- **Requests per Hour**: Track usage patterns
- **Persona Distribution**: Which persona is used most?
- **Provider Distribution**: Ollama vs Groq usage

### Quality

- **Artifact Detection Rate**: How often are artifacts mentioned?
- **Error Types**: What errors occur most?

## Alerts (Recommended)

Set up alerts for:

1. **High Error Rate**: `query_errors_total / query_requests_total > 0.05`
2. **Slow Response**: `query_response_time_ms > 5000`
3. **Provider Down**: `query_errors_total{error_type="provider_unavailable"} > 0`

## Troubleshooting

### No Metrics Appearing

1. **Check Backend is Running**:
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Check Metrics Endpoint**:
   ```bash
   curl http://localhost:3001/api/metrics/query
   ```

3. **Check Prometheus Scraping**:
   - Visit http://localhost:9090/targets
   - Verify backend target is "UP"

4. **Check Logs**:
   ```bash
   # Backend logs should show Query metrics
   cd apps/backend && npm run dev
   ```

### Metrics Not Updating

1. **Restart Backend**: Metrics are in-memory
2. **Check Prometheus Config**: Verify scrape interval
3. **Verify Route**: Ensure `/api/chat` is being called

## Advanced: Custom Metrics

To add custom Query metrics:

```typescript
// In apps/backend/src/services/queryMetrics.ts
import { metricsCollector } from '../middleware/metrics.js';

export function trackQueryRequest(persona: string, provider: string) {
  metricsCollector.record('query_requests_total', 1, {
    persona,
    provider,
    status: 'success'
  });
}

export function trackQueryResponseTime(persona: string, provider: string, ms: number) {
  metricsCollector.record('query_response_time_ms', ms, {
    persona,
    provider
  });
}
```

## Future Enhancements

- [ ] Database-backed metrics (persistent storage)
- [ ] User-specific metrics (per-user analytics)
- [ ] A/B testing metrics (prompt variant performance)
- [ ] Cost tracking (per-request cost calculation)
- [ ] Quality metrics (user ratings, feedback)




