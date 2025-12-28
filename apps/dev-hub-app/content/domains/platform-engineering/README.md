# Platform Engineering Domain

**Lead**: Atlas (DevOps Engineer)  
**Focus**: Infrastructure, CI/CD, deployment, monitoring, cost optimization

## Overview

The Platform Engineering domain manages all infrastructure, deployment pipelines, and operational aspects of Life World OS. Atlas (DevOps Engineer) is responsible for AWS infrastructure, monitoring, and cost optimization.

## Quick Links

- [Architecture](./architecture/overview.md) - Infrastructure architecture
- [Deployment Strategy](./implementation/deployment-strategy.md) - MVP vs Release 3
- [AWS Tier 2 Setup](./implementation/aws-tier2-setup.md) - Tier 2 infrastructure (Release 3)
- [Cost Optimization](./implementation/cost-optimization.md) - Cost management
- [Monitoring](./implementation/monitoring.md) - Monitoring and alerts
- [Runbooks](./implementation/runbooks.md) - Troubleshooting guides

## Deployment Phases

### MVP: In-Home WiFi Access
- **Deployment**: Local (home network)
- **Infrastructure**: None (local machine)
- **Cost**: $0/month
- **Caching**: PostgreSQL cache only
- **Guide**: [MVP Deployment Guide](../../../docs/MVP_DEPLOYMENT_GUIDE.md)

### Release 3: AWS Public Link
- **Deployment**: AWS Cloud
- **Infrastructure**: Tier 2 services
- **Cost**: $7-26/month (depending on phase)
- **Caching**: PostgreSQL (Phase 1) → ElastiCache (Phase 2)
- **Guide**: [Deployment Strategy](./implementation/deployment-strategy.md)

## Key Features

- AWS Tier 2 infrastructure (VPC, ECS, RDS, optional ElastiCache)
- Infrastructure as Code (Terraform)
- Cost-optimized for startup phase
- Automated monitoring and alerts
- Multi-system support (shared account)

## Architecture

### Tier 2 Services

1. **VPC** - Network isolation (FREE)
2. **ECS Fargate** - Container hosting (~$5-10/month per service)
3. **RDS PostgreSQL** - Database ($0-15/month, free tier eligible)
4. **ElastiCache Redis** - Caching (~$13/month, optional)
5. **Route 53** - DNS management (~$0.50/month, optional)

### Account Structure

- Single AWS account for all systems
- Shared VPC, CloudWatch, Secrets Manager
- Separate resources per system
- Cost tracking per system

## Getting Started

### MVP Setup

```bash
# Quick setup for local deployment
./scripts/setup-mvp.sh

# Or see detailed guide
docs/MVP_DEPLOYMENT_GUIDE.md
```

### Release 3 Setup

1. **Review Architecture** - [Architecture Overview](./architecture/overview.md)
2. **Setup AWS Infrastructure** - [AWS Tier 2 Setup](./implementation/aws-tier2-setup.md)
3. **Configure Monitoring** - [Monitoring Guide](./implementation/monitoring.md)
4. **Review Costs** - [Cost Optimization](./implementation/cost-optimization.md)

## Atlas (DevOps Engineer)

Atlas manages:
- AWS infrastructure provisioning
- Infrastructure as Code (Terraform)
- Cost optimization and tracking
- Monitoring and alerting
- Deployment pipelines
- Documentation (this domain)

**Expertise**: AWS, Terraform, ECS Fargate, ElastiCache, CloudWatch, cost optimization, Infrastructure as Code

## Cost Targets

### MVP (Local)
- **Cost**: $0/month
- **Infrastructure**: None

### Release 3 Phase 1 (Startup)
- **Cost**: $7-13/month
- **Infrastructure**: VPC, ECS, RDS, CloudWatch
- **Caching**: PostgreSQL only

### Release 3 Phase 2 (Scale)
- **Cost**: $20-26/month
- **Infrastructure**: All Phase 1 + ElastiCache
- **Caching**: Hybrid (Redis + PostgreSQL)

## ElastiCache Decision

**When is ElastiCache required?**

- ❌ **MVP**: Not needed (local deployment)
- ❌ **Release 3 Phase 1**: Not needed (< 100 users)
- ⚠️ **Release 3 Phase 2**: Add when > 50 users or performance issues
- ✅ **Release 3 Scale**: Required (> 200 users, > 1,000 queries/day)

See [Deployment Strategy](./implementation/deployment-strategy.md) for detailed analysis.

## Related Domains

- [Security Domain](../security/README.md) - Security infrastructure
- [Money Domain](../money/README.md) - Backend services
- [Travel Domain](../travel/README.md) - Travel system infrastructure

---

**Last Updated**: [Current Date]  
**Maintained By**: Atlas (DevOps Engineer)

