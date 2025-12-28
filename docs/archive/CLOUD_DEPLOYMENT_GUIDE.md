# Cloud Deployment Guide - Multi-Provider Support

**Release:** Release 1  
**Purpose:** Deploy to any cloud provider (AWS, GCP, Azure, DigitalOcean, Railway, Render)

## Overview

This guide provides cloud-agnostic deployment configurations that work with any cloud provider. The setup follows best practices for:

- ✅ Environment separation (dev, staging, prod)
- ✅ Secrets management
- ✅ Scalability
- ✅ Security
- ✅ Cost optimization
- ✅ Infrastructure as code

## Architecture

### Environment Structure

```
dev/          → Development (local or cloud)
staging/       → Staging/testing (cloud)
prod/          → Production (cloud)
```

### Service Components

1. **Frontend** - Static site (React/Vite)
2. **Backend** - API server (Node.js/Express)
3. **Database** - PostgreSQL

## Quick Start

### 1. Setup Environment Configuration

```bash
# Choose environment
ENVIRONMENT=staging  # or dev, prod

# Copy example config
cp config/environments/${ENVIRONMENT}.env.example config/environments/${ENVIRONMENT}.env

# Edit with your values
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
./scripts/deploy-cloud.sh staging digitalocean
./scripts/deploy-cloud.sh staging railway
./scripts/deploy-cloud.sh staging render
```

## Cloud Provider Guides

### AWS (Amazon Web Services)

**Services:**
- Frontend: S3 + CloudFront
- Backend: ECS/Fargate or Elastic Beanstalk
- Database: RDS PostgreSQL

**Deployment:**
```bash
# Prerequisites: AWS CLI configured
aws configure

# Deploy
./scripts/deploy-cloud.sh staging aws
```

**Files:**
- `infrastructure/aws/` - Terraform/CloudFormation configs

### GCP (Google Cloud Platform)

**Services:**
- Frontend: Cloud Storage + Cloud CDN
- Backend: Cloud Run
- Database: Cloud SQL PostgreSQL

**Deployment:**
```bash
# Prerequisites: gcloud CLI configured
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Deploy
./scripts/deploy-cloud.sh staging gcp
```

**Files:**
- `infrastructure/gcp/` - Terraform configs

### Azure (Microsoft Azure)

**Services:**
- Frontend: Static Web Apps or Blob Storage + CDN
- Backend: App Service or Container Instances
- Database: Azure Database for PostgreSQL

**Deployment:**
```bash
# Prerequisites: Azure CLI configured
az login
az account set --subscription YOUR_SUBSCRIPTION

# Deploy
./scripts/deploy-cloud.sh staging azure
```

**Files:**
- `infrastructure/azure/` - ARM/Bicep templates

### DigitalOcean

**Services:**
- Frontend: Spaces + CDN
- Backend: App Platform or Droplets
- Database: Managed PostgreSQL

**Deployment:**
```bash
# Prerequisites: doctl configured
doctl auth init

# Deploy
./scripts/deploy-cloud.sh staging digitalocean
```

**Files:**
- `infrastructure/digitalocean/` - Terraform configs

### Railway

**Services:**
- All-in-one platform

**Deployment:**
```bash
# Prerequisites: Railway CLI
npm install -g @railway/cli
railway login

# Deploy
./scripts/deploy-cloud.sh staging railway
```

**Files:**
- `railway.json` - Railway configuration

### Render

**Services:**
- All-in-one platform

**Deployment:**
```bash
# Prerequisites: Render account
# Connect via GitHub or Render dashboard

# Deploy
./scripts/deploy-cloud.sh staging render
```

**Files:**
- `render.yaml` - Render configuration

## Environment Configuration

### Development (dev)

**Purpose:** Local development  
**Database:** Local PostgreSQL or Docker  
**Backend:** Local server (port 3001)  
**Frontend:** Local dev server (port 5173)

**Setup:**
```bash
# Use Docker Compose for database only
docker-compose -f docker-compose.dev.yml up -d postgres-dev

# Run backend/frontend locally
npm run dev
```

### Staging

**Purpose:** Testing and QA  
**Database:** Managed or containerized  
**Backend:** Cloud service  
**Frontend:** Cloud hosting + CDN

**Setup:**
```bash
# Deploy to staging
./scripts/deploy-cloud.sh staging docker
# or
./scripts/deploy-cloud.sh staging aws
```

### Production

**Purpose:** Live application  
**Database:** Managed database (RDS, Cloud SQL, etc.)  
**Backend:** Cloud service with auto-scaling  
**Frontend:** CDN with caching

**Setup:**
```bash
# Deploy to production
./scripts/deploy-cloud.sh prod aws
# or
./scripts/deploy-cloud.sh prod gcp
```

## Best Practices

### 1. Secrets Management

**✅ DO:**
- Use cloud secrets manager (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault)
- Never commit secrets to git
- Rotate secrets regularly
- Use different secrets per environment

**❌ DON'T:**
- Commit `.env` files
- Hardcode secrets
- Share secrets between environments

### 2. Database

**✅ DO:**
- Use managed databases (RDS, Cloud SQL, Azure Database)
- Enable automated backups
- Use connection pooling
- Monitor performance

**❌ DON'T:**
- Expose database publicly
- Use default passwords
- Skip backups

### 3. Security

**✅ DO:**
- Use HTTPS everywhere
- Enable CORS properly
- Use environment-specific CORS
- Implement rate limiting
- Use WAF (Web Application Firewall)

**❌ DON'T:**
- Expose admin endpoints
- Allow insecure connections
- Skip authentication

### 4. Monitoring

**✅ DO:**
- Set up health checks
- Monitor error rates
- Track performance metrics
- Set up alerts
- Use logging services

**❌ DON'T:**
- Ignore errors
- Skip monitoring
- Log sensitive data

### 5. Cost Optimization

**✅ DO:**
- Use appropriate instance sizes
- Enable auto-scaling
- Use CDN for static assets
- Monitor costs
- Use reserved instances (prod)

**❌ DON'T:**
- Over-provision resources
- Ignore unused resources
- Skip cost monitoring

## Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Secrets stored in secrets manager
- [ ] Database migrations tested
- [ ] Health checks configured
- [ ] Monitoring set up
- [ ] Backup strategy defined
- [ ] Rollback plan ready

### Deployment

- [ ] Build artifacts created
- [ ] Database migrations run
- [ ] Services deployed
- [ ] Health checks passing
- [ ] Smoke tests passed
- [ ] Monitoring active

### Post-Deployment

- [ ] Verify all services running
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Test critical paths
- [ ] Update documentation

## Troubleshooting

### Common Issues

**Database Connection:**
- Check connection string
- Verify network access
- Check firewall rules
- Verify credentials

**Backend Not Starting:**
- Check environment variables
- Verify database connection
- Check logs
- Verify health checks

**Frontend Not Loading:**
- Check API URL
- Verify CORS settings
- Check build output
- Verify CDN configuration

## Cost Estimates

### Staging (Monthly)

| Provider | Frontend | Backend | Database | Total (approx) |
|----------|----------|---------|----------|----------------|
| AWS | $1-5 | $10-30 | $15-50 | $26-85 |
| GCP | $1-5 | $10-25 | $15-50 | $26-80 |
| Azure | $1-5 | $10-30 | $15-50 | $26-85 |
| DigitalOcean | $5 | $12 | $15 | $32 |
| Railway | $5 | $20 | $20 | $45 |
| Render | $7 | $25 | $20 | $52 |

*Prices are approximate and vary by region/usage*

## Next Steps

1. Choose your cloud provider
2. Set up environment configuration
3. Deploy to staging
4. Test thoroughly
5. Deploy to production

## Documentation

- **AWS Guide:** `infrastructure/aws/README.md`
- **GCP Guide:** `infrastructure/gcp/README.md`
- **Azure Guide:** `infrastructure/azure/README.md`
- **Environment Config:** `config/environments/`

---

**Ready to deploy?** Choose your provider and run `./scripts/deploy-cloud.sh staging <provider>`!

