# Infrastructure Cost Analysis

**Last Updated**: 2025-01-15  
**Purpose**: Detailed cost breakdown and scaling analysis for all phases

---

## Overview

This document provides detailed cost analysis for each phase of the architecture, including base costs, scaling costs, and cost optimization strategies.

---

## Phase 1: Local Infrastructure

**Environment**: Local Development Only  
**Cost Type**: One-time + Optional Hosting

### Base Costs

| Component | Cost | Notes |
|-----------|------|-------|
| **Prometheus** | $0 | Docker container (local) |
| **Grafana** | $0 | Docker container (local) |
| **Portainer** | $0 | Docker container (local) |
| **Docker** | $0 | Free (local development) |
| **Electricity** | ~$5-10/month | Power consumption for local machine |
| **Total** | **$5-10/month** | Local development only |

### Scaling Costs

**Phase 1 does not scale** - it's local development only.

### Cost Breakdown

- **One-time Setup**: $0 (all open-source tools)
- **Monthly Operating**: $5-10 (electricity only)
- **No AWS Costs**: Phase 1 is 100% local

---

## Phase 2: AWS Staging

**Environment**: Staging  
**Cost Type**: Pay-as-you-go AWS services

### Base Costs (Low Usage)

| Service | Instance/Type | Monthly Cost | Notes |
|---------|---------------|--------------|-------|
| **ECS Fargate** | 0.25 vCPU, 0.5 GB | $5-10 | Backend + Frontend (minimal usage) |
| **RDS PostgreSQL** | db.t3.micro | $15-20 | Single-AZ, 20 GB storage |
| **ALB** | Application Load Balancer | $16.20 | Fixed cost |
| **ECR** | Image storage | $0.10/GB | ~1-2 GB = $0.20 |
| **CloudWatch** | Logs + Metrics | $2-5 | Basic monitoring |
| **VPC** | Virtual Private Cloud | $0 | Free |
| **NAT Gateway** | NAT Gateway | $32.40 | For private subnet access |
| **Data Transfer** | Outbound | $5-10 | Minimal staging traffic |
| **Secrets Manager** | Secrets storage | $0.40 | 2-3 secrets |
| **Loki + Promtail** | Optional (ECS) | $5-10 | If running in ECS |
| **Total** | | **$80-120/month** | Staging environment |

### Scaling Costs (Medium Usage)

| Service | Scaling Factor | Additional Cost | Notes |
|---------|----------------|------------------|-------|
| **ECS Fargate** | 2x tasks | +$10-20 | Scale to 2 backend + 2 frontend |
| **RDS PostgreSQL** | db.t3.small | +$10-15 | Upgrade for more capacity |
| **Data Transfer** | 10x traffic | +$20-30 | Increased staging usage |
| **CloudWatch** | More logs | +$3-5 | Additional log volume |
| **Total Additional** | | **+$43-70/month** | **Total: $123-190/month** |

### Scaling Costs (High Usage)

| Service | Scaling Factor | Additional Cost | Notes |
|---------|----------------|------------------|-------|
| **ECS Fargate** | 4x tasks | +$30-40 | Scale to 4 backend + 4 frontend |
| **RDS PostgreSQL** | db.t3.medium | +$20-30 | Upgrade for production-like load |
| **Data Transfer** | 50x traffic | +$50-100 | Heavy staging testing |
| **CloudWatch** | High log volume | +$10-15 | Extensive logging |
| **Total Additional** | | **+$110-185/month** | **Total: $190-305/month** |

### Cost Scaling Rate

**Base**: $80-120/month  
**Low Scale** (2x): +$43-70/month = **$123-190/month**  
**Medium Scale** (4x): +$110-185/month = **$190-305/month**  
**High Scale** (8x): +$200-350/month = **$280-470/month**

**Scaling Rate**: ~$40-50/month per 2x increase in capacity

---

## Phase 3: AWS Production

**Environment**: Production  
**Cost Type**: Production-grade AWS services

### Base Costs (Production Minimum)

| Service | Instance/Type | Monthly Cost | Notes |
|---------|---------------|--------------|-------|
| **ECS Fargate** | 0.5 vCPU, 1 GB (2 tasks) | $20-40 | Multi-AZ, min 2 tasks |
| **RDS PostgreSQL** | db.t3.medium, Multi-AZ | $60-120 | Multi-AZ, automated backups |
| **ALB** | Application Load Balancer | $16.20 | Fixed cost |
| **ECR** | Image storage | $0.20-0.50 | ~2-5 GB |
| **CloudWatch** | Logs + Metrics + Alarms | $10-20 | Full observability |
| **VPC** | Virtual Private Cloud | $0 | Free |
| **NAT Gateway** | NAT Gateway | $32.40 | For private subnet access |
| **Route 53** | DNS hosting | $0.50 | Hosted zone |
| **Data Transfer** | Outbound | $10-20 | Production traffic |
| **Secrets Manager** | Secrets + Rotation | $0.40-1.00 | Multiple secrets |
| **X-Ray** | Distributed tracing | $5-10 | Optional |
| **Total** | | **$155-270/month** | Production minimum |

### Scaling Costs (Production Growth)

#### Scale 1: 50-100 Users

| Service | Scaling Factor | Additional Cost | Notes |
|---------|----------------|------------------|-------|
| **ECS Fargate** | 4 tasks (auto-scaling) | +$20-40 | Scale to 4 backend + 4 frontend |
| **RDS PostgreSQL** | db.t3.large | +$40-60 | More capacity |
| **Data Transfer** | 5x traffic | +$40-60 | Increased users |
| **CloudWatch** | More metrics | +$5-10 | Additional monitoring |
| **Total Additional** | | **+$105-170/month** | **Total: $260-440/month** |

#### Scale 2: 100-200 Users

| Service | Scaling Factor | Additional Cost | Notes |
|---------|----------------|------------------|-------|
| **ECS Fargate** | 8 tasks (auto-scaling) | +$40-80 | Scale to 8 backend + 8 frontend |
| **RDS PostgreSQL** | db.t3.xlarge | +$80-120 | Higher capacity |
| **ElastiCache Redis** | cache.t3.micro | +$13 | Add caching layer |
| **Data Transfer** | 10x traffic | +$80-120 | More users |
| **CloudWatch** | High volume | +$10-20 | Extensive monitoring |
| **Total Additional** | | **+$223-353/month** | **Total: $378-623/month** |

#### Scale 3: 200-500 Users

| Service | Scaling Factor | Additional Cost | Notes |
|---------|----------------|------------------|-------|
| **ECS Fargate** | 16 tasks (auto-scaling) | +$80-160 | Scale to 16 backend + 16 frontend |
| **RDS PostgreSQL** | db.t3.2xlarge | +$160-240 | High capacity |
| **ElastiCache Redis** | cache.t3.small | +$26 | Larger cache |
| **Data Transfer** | 20x traffic | +$160-240 | Heavy traffic |
| **CloudWatch** | Very high volume | +$20-40 | Full observability |
| **Total Additional** | | **+$446-706/month** | **Total: $601-976/month** |

### Cost Scaling Rate

**Base**: $155-270/month  
**Scale 1** (50-100 users): +$105-170/month = **$260-440/month**  
**Scale 2** (100-200 users): +$223-353/month = **$378-623/month**  
**Scale 3** (200-500 users): +$446-706/month = **$601-976/month**  
**Scale 4** (500-1000 users): +$800-1200/month = **$955-1470/month**

**Scaling Rate**: ~$200-300/month per 100-user increase

---

## Cost Comparison Summary

| Phase | Base Cost | Low Scale | Medium Scale | High Scale |
|-------|-----------|-----------|--------------|------------|
| **Phase 1** (Local) | $5-10 | N/A | N/A | N/A |
| **Phase 2** (Staging) | $80-120 | $123-190 | $190-305 | $280-470 |
| **Phase 3** (Production) | $155-270 | $260-440 | $378-623 | $601-976 |

---

## Cost Optimization Strategies

### Phase 2 (Staging) Optimization

1. **Use Reserved Instances** (if long-term):
   - RDS: 30-40% savings with 1-year commitment
   - **Savings**: ~$5-8/month

2. **Schedule Scaling**:
   - Scale down staging during off-hours
   - **Savings**: ~$20-30/month

3. **Use Spot Instances** (for non-critical):
   - ECS Fargate Spot: 70% savings
   - **Savings**: ~$10-15/month

4. **Optimize Log Retention**:
   - Reduce CloudWatch log retention
   - **Savings**: ~$2-5/month

**Total Potential Savings**: ~$37-58/month (30-50% reduction)

---

### Phase 3 (Production) Optimization

1. **Reserved Instances**:
   - RDS Reserved: 30-40% savings
   - **Savings**: ~$20-50/month

2. **Auto-Scaling**:
   - Scale down during low-traffic hours
   - **Savings**: ~$30-50/month

3. **ElastiCache** (when needed):
   - Add Redis to reduce RDS load
   - **Savings**: ~$20-40/month (reduced RDS costs)

4. **CloudFront** (for frontend):
   - CDN reduces ALB data transfer
   - **Savings**: ~$10-20/month

5. **Optimize Database**:
   - Connection pooling
   - Query optimization
   - **Savings**: ~$10-20/month

**Total Potential Savings**: ~$90-180/month (20-30% reduction)

---

## Cost Scaling Factors

### What Drives Costs Up

1. **User Growth**:
   - More users = more ECS tasks
   - More users = more database load
   - More users = more data transfer
   - **Impact**: ~$200-300/month per 100 users

2. **Traffic Volume**:
   - More requests = more ECS tasks
   - More requests = more ALB data transfer
   - **Impact**: ~$50-100/month per 10x traffic

3. **Data Storage**:
   - More data = larger RDS instance
   - More data = more ECR storage
   - **Impact**: ~$20-40/month per 100 GB

4. **Monitoring**:
   - More logs = more CloudWatch costs
   - More metrics = more CloudWatch costs
   - **Impact**: ~$5-10/month per 10x log volume

### What Keeps Costs Down

1. **Auto-Scaling**:
   - Scale down during low usage
   - **Savings**: 20-30%

2. **Caching**:
   - ElastiCache reduces database load
   - **Savings**: 10-20% on RDS costs

3. **Optimization**:
   - Efficient queries
   - Connection pooling
   - **Savings**: 10-15% on RDS costs

4. **Reserved Instances**:
   - 1-year commitment
   - **Savings**: 30-40% on RDS

---

## Cost Projections by User Count

### Phase 2 (Staging)

| Users | Monthly Cost | Notes |
|-------|--------------|-------|
| 1-10 | $80-120 | Base staging |
| 10-50 | $123-190 | Low scale |
| 50-100 | $190-305 | Medium scale |
| 100+ | $280-470 | High scale |

### Phase 3 (Production)

| Users | Monthly Cost | Notes |
|-------|--------------|-------|
| 1-50 | $155-270 | Base production |
| 50-100 | $260-440 | Scale 1 |
| 100-200 | $378-623 | Scale 2 |
| 200-500 | $601-976 | Scale 3 |
| 500-1000 | $955-1470 | Scale 4 |
| 1000+ | $1500-2500 | Enterprise scale |

---

## Cost Breakdown by Service

### Phase 2 (Staging) - Base Cost

```
ECS Fargate:        $5-10    (6%)
RDS PostgreSQL:     $15-20   (19%)
ALB:                $16.20   (20%)
NAT Gateway:        $32.40   (40%)
CloudWatch:         $2-5     (3%)
Data Transfer:      $5-10    (6%)
ECR:                $0.20    (<1%)
Secrets Manager:    $0.40    (<1%)
Other:              $4-26    (5%)
─────────────────────────────────
Total:              $80-120
```

### Phase 3 (Production) - Base Cost

```
ECS Fargate:        $20-40   (13%)
RDS PostgreSQL:     $60-120  (44%)
ALB:                $16.20   (6%)
NAT Gateway:        $32.40   (12%)
CloudWatch:         $10-20   (7%)
Data Transfer:      $10-20   (7%)
Route 53:           $0.50    (<1%)
ECR:                $0.50    (<1%)
Secrets Manager:    $1.00    (<1%)
X-Ray:              $5-10    (4%)
Other:              $0-7     (3%)
─────────────────────────────────
Total:              $155-270
```

---

## Cost Alerts and Budgets

### Recommended AWS Budgets

**Phase 2 (Staging)**:
- Budget: $150/month
- Alert at: $100 (67%), $130 (87%), $150 (100%)

**Phase 3 (Production)**:
- Budget: $400/month (base)
- Alert at: $300 (75%), $350 (87%), $400 (100%)
- Scale budgets with user growth

### Cost Monitoring

1. **AWS Cost Explorer**: Track spending trends
2. **CloudWatch Billing Alarms**: Alert on budget thresholds
3. **Cost Allocation Tags**: Track costs by environment/service
4. **Monthly Reviews**: Review costs and optimize

---

## Cost Savings Tips

### Immediate Savings

1. **Stop Unused Resources**: Review and stop idle resources
2. **Right-Size Instances**: Match instance size to actual usage
3. **Use Spot Instances**: For non-critical workloads
4. **Optimize Log Retention**: Reduce CloudWatch log retention

### Long-Term Savings

1. **Reserved Instances**: Commit to 1-3 year terms
2. **Auto-Scaling**: Scale down during off-hours
3. **Caching**: Add ElastiCache to reduce database load
4. **CDN**: Use CloudFront for static content

---

## Cost vs. Value Analysis

### Phase 1 (Local)
- **Cost**: $5-10/month
- **Value**: Full local development environment
- **ROI**: Excellent (enables development)

### Phase 2 (Staging)
- **Cost**: $80-120/month
- **Value**: Production-like testing environment
- **ROI**: Good (catches issues before production)

### Phase 3 (Production)
- **Cost**: $155-270/month (base)
- **Value**: Production-grade infrastructure
- **ROI**: Excellent (enables business operations)

---

## Related Documentation

- [Architecture Overview](./overview.md)
- [Phase 2: AWS Staging](./phase-2-aws-staging.md)
- [Phase 3: AWS Production](./phase-3-aws-production.md)
- [Implementation Roadmap](./implementation-roadmap.md)

