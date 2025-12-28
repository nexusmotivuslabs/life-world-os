# Tool & Environment Mapping

**Last Updated**: 2025-01-15  
**Purpose**: Complete mapping of tools and services across all environments

---

## Infrastructure & Orchestration

| Tool/Service | Type | Local | Staging | Prod | Notes |
|--------------|------|-------|---------|------|-------|
| **Container Orchestration** |
| Docker Compose | Docker | ✅ | ✅ | ✅ | Local deployment |
| ECS Fargate | AWS | ❌ | ⚠️ Phase 2 | ⚠️ Phase 3 | Migration target |
| Kubernetes | Open-source | ❌ | ⚠️ Optional | ⚠️ Optional | Alternative to ECS |
| **Load Balancing** |
| Nginx | Docker | ✅ | ✅ | ✅ | Reverse proxy (domains) |
| ALB | AWS | ❌ | ⚠️ Phase 2 | ⚠️ Phase 3 | IP-restricted ALB |
| Traefik | Docker | ❌ | ⚠️ Optional | ⚠️ Optional | Alternative to Nginx |
| **Container Registry** |
| Docker Hub | Cloud | ❌ | ⚠️ Optional | ⚠️ Optional | Public registry |
| Docker Registry | Docker | ❌ | ⚠️ Optional | ⚠️ Optional | Self-hosted |
| ECR | AWS | ❌ | ⚠️ Phase 2 | ⚠️ Phase 3 | AWS registry |

---

## Database

| Tool/Service | Type | Local | Staging | Prod | Notes |
|--------------|------|-------|---------|------|-------|
| PostgreSQL (Docker) | Docker | ✅ | ✅ | ⚠️ Not recommended | Local/Staging only |
| RDS PostgreSQL | AWS | ❌ | ⚠️ Phase 2 | ⚠️ Phase 3 | Managed database |
| PostgreSQL (Local) | Local | ✅ | ❌ | ❌ | Direct install (dev) |

---

## Monitoring & Observability

| Tool/Service | Type | Local | Staging | Prod | Notes |
|--------------|------|-------|---------|------|-------|
| **Metrics** |
| Prometheus | Docker | ⚠️ Phase 1 | ⚠️ Phase 2 (Optional) | ⚠️ Phase 3 (Optional) | Metrics collection |
| Grafana | Docker | ⚠️ Phase 1 | ⚠️ Phase 2 (Optional) | ⚠️ Phase 3 (Optional) | Dashboards |
| Node Exporter | Docker | ⚠️ Phase 1 (Optional) | ⚠️ Phase 2 (Optional) | ⚠️ Phase 3 (Optional) | System metrics |
| CloudWatch | AWS | ❌ | ⚠️ Phase 2 | ⚠️ Phase 3 | AWS monitoring |
| **Logging** |
| Console Logging | Built-in | ✅ | ✅ | ✅ | Basic logging |
| Loki | Docker | ❌ | ⚠️ Phase 2 | ⚠️ Phase 3 | Log aggregation |
| Promtail | Docker | ❌ | ⚠️ Phase 2 | ⚠️ Phase 3 | Log collector |
| CloudWatch Logs | AWS | ❌ | ⚠️ Phase 2 | ⚠️ Phase 3 | AWS logging |
| **Tracing** |
| Jaeger | Docker | ❌ | ⚠️ Optional | ⚠️ Optional | Distributed tracing |
| OpenTelemetry | Open-source | ❌ | ⚠️ Optional | ⚠️ Optional | Vendor-agnostic |
| X-Ray | AWS | ❌ | ⚠️ Optional | ⚠️ Phase 3 | AWS tracing |

---

## Container Management

| Tool/Service | Type | Local | Staging | Prod | Notes |
|--------------|------|-------|---------|------|-------|
| Portainer | Docker | ⚠️ Phase 1 | ⚠️ Optional | ⚠️ Optional | Container management UI |
| Watchtower | Docker | ❌ | ⚠️ Optional | ⚠️ Optional | Auto-update containers |
| Docker CLI | Local | ✅ | ✅ | ✅ | Manual management |

---

## Secrets Management

| Tool/Service | Type | Local | Staging | Prod | Notes |
|--------------|------|-------|---------|------|-------|
| .env files | Local | ✅ | ✅ | ⚠️ Not secure | Development only |
| HashiCorp Vault | Docker | ❌ | ⚠️ Phase 2 (Optional) | ⚠️ Phase 3 (Optional) | Self-hosted secrets |
| AWS Secrets Manager | AWS | ❌ | ⚠️ Phase 2 | ⚠️ Phase 3 | AWS secrets |

---

## CI/CD

| Tool/Service | Type | Local | Staging | Prod | Notes |
|--------------|------|-------|---------|------|-------|
| Manual Deployment | Scripts | ✅ | ✅ | ✅ | Current approach |
| GitHub Actions | Cloud | ❌ | ⚠️ Phase 2 | ⚠️ Phase 3 | CI/CD pipeline |
| Jenkins | Docker | ❌ | ⚠️ Optional | ⚠️ Optional | Self-hosted CI/CD |
| GitLab Runner | Docker | ❌ | ⚠️ Optional | ⚠️ Optional | Self-hosted CI/CD |
| AWS CodePipeline | AWS | ❌ | ⚠️ Optional | ⚠️ Optional | AWS CI/CD |

---

## Networking & DNS

| Tool/Service | Type | Local | Staging | Prod | Notes |
|--------------|------|-------|---------|------|-------|
| Docker Networks | Docker | ✅ | ✅ | ✅ | Bridge networks |
| /etc/hosts | Local | ✅ | ✅ | ❌ | Domain resolution (local) |
| Router DNS | Router | ⚠️ Optional | ⚠️ Optional | ❌ | Home network DNS |
| dnsmasq | Docker | ❌ | ⚠️ Optional | ❌ | Local DNS server |
| Route 53 | AWS | ❌ | ⚠️ Optional | ⚠️ Phase 3 | AWS DNS |
| VPC | AWS | ❌ | ⚠️ Phase 2 | ⚠️ Phase 3 | AWS networking |

---

## Caching

| Tool/Service | Type | Local | Staging | Prod | Notes |
|--------------|------|-------|---------|------|-------|
| In-Memory Cache | Built-in | ✅ | ✅ | ✅ | Frontend caching |
| PostgreSQL Cache | Database | ✅ | ✅ | ✅ | Database-level cache |
| Redis (Docker) | Docker | ❌ | ⚠️ Optional | ⚠️ Optional | Self-hosted cache |
| ElastiCache | AWS | ❌ | ⚠️ Optional | ⚠️ Optional | AWS managed cache |

---

## Storage

| Tool/Service | Type | Local | Staging | Prod | Notes |
|--------------|------|-------|---------|------|-------|
| Docker Volumes | Docker | ✅ | ✅ | ✅ | Local storage |
| S3 | AWS | ❌ | ⚠️ Optional | ⚠️ Optional | Object storage |
| EBS | AWS | ❌ | ⚠️ Phase 2 | ⚠️ Phase 3 | Block storage |

---

## Security

| Tool/Service | Type | Local | Staging | Prod | Notes |
|--------------|------|-------|---------|------|-------|
| JWT Authentication | Built-in | ✅ | ✅ | ✅ | Auth system |
| Security Groups | AWS | ❌ | ⚠️ Phase 2 | ⚠️ Phase 3 | Network security |
| IAM Roles | AWS | ❌ | ⚠️ Phase 2 | ⚠️ Phase 3 | Access control |
| SSL/TLS (Let's Encrypt) | Open-source | ❌ | ⚠️ Optional | ⚠️ Phase 3 | HTTPS certificates |
| SSL/TLS (ACM) | AWS | ❌ | ⚠️ Phase 2 | ⚠️ Phase 3 | AWS certificates |

---

## Legend

- ✅ **Currently Implemented**: Tool is in use
- ⚠️ **Planned/Recommended**: Tool is planned for implementation
- ❌ **Not Implemented**: Tool is not in use
- **Phase 1**: Local infrastructure only
- **Phase 2**: AWS Staging migration
- **Phase 3**: AWS Production migration

---

## Environment Summary

### Local Development
**Current:**
- ✅ Docker Compose
- ✅ PostgreSQL (Docker)
- ✅ Nginx (domains)
- ✅ Console logging
- ✅ .env files

**Phase 1 Adds:**
- ⚠️ Prometheus (metrics)
- ⚠️ Grafana (dashboards)
- ⚠️ Portainer (management UI)

---

### Staging
**Current:**
- ✅ Docker Compose
- ✅ PostgreSQL (Docker)
- ✅ Nginx (domains)
- ✅ Version tagging
- ✅ Health checks

**Phase 2 Adds:**
- ⚠️ ECR (container registry)
- ⚠️ ECS Fargate (orchestration)
- ⚠️ RDS PostgreSQL (database)
- ⚠️ ALB (load balancer)
- ⚠️ CloudWatch (monitoring)
- ⚠️ Loki + Promtail (logging)
- ⚠️ Secrets Manager or Vault (secrets)

---

### Production (Current Docker)
**Current:**
- ✅ Docker Compose
- ✅ PostgreSQL (Docker) - not recommended
- ✅ Nginx (domains)
- ✅ Version tagging
- ✅ Health checks

**Phase 3 Adds:**
- ⚠️ ECS Fargate (multi-AZ, auto-scaling)
- ⚠️ RDS PostgreSQL (Multi-AZ)
- ⚠️ ALB (IP-restricted or VPN)
- ⚠️ CloudWatch (full observability)
- ⚠️ Route 53 (DNS)
- ⚠️ Secrets Manager (with rotation)
- ⚠️ Enhanced security (IAM, Security Groups)

---

## Migration Path

### Local → Staging → Production

1. **Local**: Docker Compose + Phase 1 tools
2. **Staging**: Migrate to AWS (Phase 2)
3. **Production**: Enhanced AWS (Phase 3)

Each phase builds on the previous, maintaining compatibility and enabling gradual migration.

---

## Related Documentation

- [Architecture Overview](./overview.md)
- [Phase 1: Local Infrastructure](./phase-1-local-infrastructure.md)
- [Phase 2: AWS Staging](./phase-2-aws-staging.md)
- [Phase 3: AWS Production](./phase-3-aws-production.md)
- [Implementation Roadmap](./implementation-roadmap.md)

