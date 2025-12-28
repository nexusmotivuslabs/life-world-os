# Tag and Label Explanation

**Purpose**: Clarify the relationship between tags/labels and GitFlow/Dev Environment

---

## Tags in Grafana Dashboard

### Current Tags
- `local-build` - Indicates this is a local build
- `dev` - Indicates this connects to the dev environment

### Purpose
These tags are **NOT part of GitFlow**. They are:
- **Grafana dashboard organization tags** - Used to filter and organize dashboards in Grafana UI
- **Environment identification** - Help identify which environment the dashboard monitors

### Connection to Dev Environment
✅ **Yes, these connect to dev environment**:
- The dashboard monitors services running in the **dev environment**
- Prometheus scrapes metrics from **dev environment services** (backend-dev, etc.)
- This is for **development and testing** purposes

---

## Labels in Prometheus

### Current Labels
- `environment: 'dev'` - Identifies dev environment
- `build_type: 'local'` - Identifies local build
- `cluster: 'local-build-dev'` - Identifies local build connecting to dev

### Purpose
These labels are **NOT part of GitFlow**. They are:
- **Prometheus metric labels** - Used to identify and filter metrics
- **Service identification** - Help identify which services/environments metrics come from

### Connection to Dev Environment
✅ **Yes, these connect to dev environment**:
- Prometheus scrapes from `backend-dev:3001` (dev environment service)
- All metrics are labeled with `environment: 'dev'` to identify dev environment
- This is for **development and testing** purposes

---

## Relationship to GitFlow

### GitFlow Structure
```
main (production)
  └── staging (staging)
      └── feature/* (features)
```

### Environment Mapping
- **Local Build** = Development work on your machine
- **Dev Environment** = Docker services running locally (dev profile)
- **Staging** = Staging branch + staging Docker services
- **Production** = Main branch + production Docker services

### Tag/Label Purpose
The tags and labels are used to:
1. **Identify environment** - Know which environment you're monitoring
2. **Filter metrics** - Query metrics by environment
3. **Organize dashboards** - Group dashboards by environment

They are **NOT**:
- Git branch names
- GitFlow workflow steps
- Deployment targets

---

## Connection Types

### Local/Local (local/local)
- **What**: Services running directly on your local machine (not in Docker)
- **Example**: Running `npm run dev:backend` on your machine
- **Prometheus Target**: `host.docker.internal:3001`
- **Job Name**: `backend-local`
- **Label**: `deployment: 'local'`

### Local/Dev (local/dev)
- **What**: Services running in Docker containers with dev profile
- **Example**: `backend-dev` container from `docker-compose.dev.yml`
- **Prometheus Target**: `backend-dev:3001`
- **Job Name**: `backend-dev`
- **Label**: `deployment: 'docker'`

### Both Connections
✅ **Yes, Prometheus connects to BOTH**:
- Monitors local services (local/local) via `host.docker.internal`
- Monitors dev Docker services (local/dev) via Docker network

---

## Summary

| Item | Purpose | GitFlow Related? | Connects to Local? | Connects to Dev? |
|------|---------|-----------------|-------------------|------------------|
| Grafana tags (`local-build`, `dev`) | Dashboard organization | ❌ No | ✅ Yes | ✅ Yes |
| Prometheus `backend-local` job | Local machine services | ❌ No | ✅ Yes (local/local) | ✅ Yes (dev env) |
| Prometheus `backend-dev` job | Docker dev services | ❌ No | ✅ Yes (local build) | ✅ Yes (dev containers) |
| Prometheus labels (`environment: dev`) | Metric identification | ❌ No | ✅ Yes | ✅ Yes |
| Prometheus labels (`build_type: local`) | Build type identification | ❌ No | ✅ Yes | ✅ Yes |
| GitFlow branches (`main`, `staging`) | Code versioning | ✅ Yes | ❌ No | ❌ No |

---

## Quick Reference

**Tags/Labels Purpose**: Organize and identify monitoring data  
**GitFlow Purpose**: Manage code versions and deployments  
**Connections**: 
- **local/local**: Monitors services running on local machine (not Docker)
- **local/dev**: Monitors dev environment Docker containers
- **Both**: Prometheus connects to both for complete visibility

---

## Related Documentation

- [Git Workflow](./GIT_WORKFLOW.md) - GitFlow strategy
- [Phase 0: Local Build with Dev - Foundation](./phase-0-foundation.md)
- [Phase 1: Local Build with Dev - Observability](./phase-1-local-infrastructure.md)

