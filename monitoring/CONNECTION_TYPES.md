# Monitoring Connection Types

**Purpose**: Explain the different connection types for local build monitoring

---

## Connection Types

### 1. Local/Local (local/local)

**What**: Services running directly on your local machine (not in Docker)

**Example**:
```bash
# Running backend directly on your machine
npm run dev:backend
# Backend runs on localhost:3001
```

**Prometheus Configuration**:
- **Job Name**: `backend-local`
- **Target**: `host.docker.internal:3001`
- **Labels**: 
  - `deployment: 'local'`
  - `instance: 'local'`
  - `environment: 'dev'`
  - `build_type: 'local'`

**Use Case**: 
- Active development with hot reload
- Fast iteration
- Direct debugging

---

### 2. Local/Dev (local/dev)

**What**: Services running in Docker containers with dev profile

**Example**:
```bash
# Running backend in Docker
docker-compose --profile backend -f docker-compose.dev.yml up -d
# Backend runs in container: backend-dev:3001
```

**Prometheus Configuration**:
- **Job Name**: `backend-dev`
- **Target**: `backend-dev:3001` (Docker service name)
- **Labels**:
  - `deployment: 'docker'`
  - `environment: 'dev'`
  - `build_type: 'local'`

**Use Case**:
- Testing Docker deployment
- Consistent environment
- Containerized development

---

## Both Connections Active

✅ **Prometheus monitors BOTH simultaneously**:

1. **Local Services** (local/local)
   - Scrapes `host.docker.internal:3001`
   - When you run services directly on your machine

2. **Dev Docker Services** (local/dev)
   - Scrapes `backend-dev:3001`
   - When you run services in Docker containers

**Why Both?**
- Flexibility: Monitor whichever deployment method you're using
- Complete visibility: See metrics from both if both are running
- Development patterns: Support different development workflows

---

## Grafana Dashboard

The dashboard queries both:
```promql
up{job="backend-dev"} or up{job="backend-local"}
```

This shows health from either:
- Docker dev services (backend-dev)
- Local machine services (backend-local)

---

## Quick Reference

| Type | Target | When Active | Use Case |
|------|--------|------------|----------|
| **local/local** | `host.docker.internal:3001` | Services on host machine | Active development |
| **local/dev** | `backend-dev:3001` | Services in Docker | Docker testing |

---

## Related Documentation

- [Prometheus Configuration](./prometheus/prometheus.local.yml)
- [Tag Explanation](../docs/architecture/TAG_EXPLANATION.md)
- [Phase 1 Setup Guide](../docs/architecture/phase-1-setup-guide.md)

