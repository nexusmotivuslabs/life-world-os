# Cloud Deployment - Quick Reference

**Release:** Release 1  
**Status:** ✅ Cloud-Ready

## Quick Start

### 1. Setup Environment

```bash
# Choose environment: dev, staging, or prod
ENVIRONMENT=staging

# Setup config
cp config/environments/${ENVIRONMENT}.env.example config/environments/${ENVIRONMENT}.env
nano config/environments/${ENVIRONMENT}.env
```

### 2. Deploy

```bash
# Docker (local/self-hosted)
./scripts/deploy-cloud.sh staging docker

# Cloud providers
./scripts/deploy-cloud.sh staging aws
./scripts/deploy-cloud.sh staging gcp
./scripts/deploy-cloud.sh staging azure
```

## Environments

| Environment | Purpose | Database | Backend | Frontend |
|-------------|---------|----------|---------|----------|
| **dev** | Local development | Docker/local | Local (3001) | Local (5173) |
| **staging** | Testing/QA | Managed/Container | Cloud service | CDN |
| **prod** | Production | Managed | Cloud + Auto-scale | CDN + Cache |

## Supported Providers

- ✅ **AWS** - S3, ECS, RDS
- ✅ **GCP** - Cloud Storage, Cloud Run, Cloud SQL
- ✅ **Azure** - Static Web Apps, App Service, Azure Database
- ✅ **DigitalOcean** - Spaces, App Platform, Managed DB
- ✅ **Railway** - All-in-one platform
- ✅ **Render** - All-in-one platform
- ✅ **Docker** - Self-hosted

## Commands

```bash
# Deploy
./scripts/deploy-cloud.sh <environment> <provider>

# Examples
./scripts/deploy-cloud.sh dev docker
./scripts/deploy-cloud.sh staging aws
./scripts/deploy-cloud.sh prod gcp
```

## Configuration Files

- `config/environments/dev.env.example` - Development config
- `config/environments/staging.env.example` - Staging config
- `config/environments/prod.env.example` - Production config
- `docker-compose.dev.yml` - Dev Docker Compose
- `docker-compose.staging.yml` - Staging Docker Compose
- `docker-compose.prod.yml` - Prod Docker Compose (reference)

## Best Practices

1. **Secrets:** Use cloud secrets manager
2. **Database:** Use managed databases
3. **Security:** HTTPS, CORS, rate limiting
4. **Monitoring:** Health checks, logging, alerts
5. **Cost:** Right-size resources, use CDN

## Documentation

- **Full Guide:** `CLOUD_DEPLOYMENT_GUIDE.md`
- **Staging Setup:** `RELEASE_1_STAGING_SETUP.md`
- **Environment Configs:** `config/environments/`

---

**Ready?** Run `./scripts/deploy-cloud.sh staging docker` to start!

