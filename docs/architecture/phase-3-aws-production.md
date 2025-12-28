# Phase 3: AWS Production Migration

**Priority**: 3  
**Environment**: Production  
**Timeline**: After Phase 2  
**Status**: Planning

---

## Overview

Phase 3 migrates the production environment to AWS with production-grade infrastructure, enhanced security, and high availability.

---

## Goals

1. Migrate production to AWS with production-grade services
2. Implement high availability (Multi-AZ)
3. Enhance security (VPN/IP-restricted access)
4. Set up comprehensive monitoring and alerting
5. Implement automated backups and disaster recovery

---

## Components

### 1. AWS Infrastructure (Production-Grade)

#### ECS Fargate (Multi-AZ, Auto-Scaling)
**Purpose**: Container orchestration with high availability  
**Configuration**:
- Multi-AZ deployment
- Auto-scaling (min: 2, max: 10)
- Health checks with grace period
- Service discovery

#### RDS PostgreSQL (Multi-AZ)
**Purpose**: Managed database with high availability  
**Configuration**:
- Multi-AZ deployment
- Automated backups (7-day retention)
- Point-in-time recovery
- Read replicas (optional)
- Enhanced monitoring

#### ALB (IP-Restricted or VPN)
**Purpose**: Load balancer with secure access  
**Configuration**:
- IP-restricted access (your IP range)
- Or AWS Client VPN for internal-only access
- SSL/TLS termination (ACM)
- WAF (optional, for DDoS protection)

#### VPC (Enhanced Security)
**Purpose**: Network isolation with security hardening  
**Configuration**:
- Public subnet (ALB only)
- Private subnet (ECS, RDS)
- Isolated subnet (RDS)
- NAT Gateway for outbound traffic
- VPC Flow Logs

#### Route 53
**Purpose**: DNS management  
**Configuration**:
- Domain management
- Health checks
- Failover routing (optional)

---

### 2. Observability (Production-Grade)

#### CloudWatch (Full Observability)
**Purpose**: Comprehensive monitoring and alerting  
**Configuration**:
- Log groups with retention policies
- Metrics dashboards
- CloudWatch Alarms (critical metrics)
- SNS topics for alerts
- CloudWatch Insights for log analysis

#### X-Ray (Optional)
**Purpose**: Distributed tracing  
**Configuration**:
- Trace requests across services
- Performance analysis
- Error tracking

#### Enhanced Dashboards
**Purpose**: Real-time visibility  
**Configuration**:
- Custom CloudWatch dashboards
- Grafana integration (optional)
- Key metrics: CPU, memory, request rate, error rate

---

### 3. Secrets Management

#### AWS Secrets Manager
**Purpose**: Production secrets with rotation  
**Configuration**:
- Store all secrets (JWT, DB passwords, API keys)
- Automatic rotation (for supported secrets)
- IAM roles for ECS tasks
- Audit logging

---

### 4. Security

#### IAM Roles and Policies
**Purpose**: Least privilege access  
**Configuration**:
- ECS task execution role
- ECS task role (application permissions)
- ALB service role
- RDS access policies

#### Security Groups
**Purpose**: Network-level security  
**Configuration**:
- ALB: Allow only your IP or VPN
- ECS: Allow only from ALB
- RDS: Allow only from ECS
- No public access

#### SSL/TLS Certificates
**Purpose**: Encrypted communication  
**Configuration**:
- ACM certificates
- ALB SSL termination
- HTTPS only

#### WAF (Optional)
**Purpose**: DDoS and attack protection  
**Configuration**:
- Rate limiting
- IP filtering
- SQL injection protection

---

### 5. Backup and Disaster Recovery

#### RDS Backups
**Purpose**: Data protection  
**Configuration**:
- Automated daily backups
- 7-day retention
- Point-in-time recovery
- Cross-region backups (optional)

#### ECS Image Backups
**Purpose**: Container image versioning  
**Configuration**:
- ECR image versioning
- Keep last N versions
- Image scanning for vulnerabilities

---

## Architecture Diagram

```
Internet (IP-Restricted or VPN)
    ↓
Route 53 (DNS)
    ↓
ALB (Application Load Balancer)
    ├── SSL/TLS (ACM)
    └── WAF (Optional)
    ↓
ECS Fargate (Multi-AZ, Auto-Scaling)
    ├── Backend (2-10 tasks)
    ├── Frontend (2-10 tasks)
    ├── CloudWatch Logs
    └── X-Ray (Optional)
    ↓
RDS PostgreSQL (Multi-AZ)
    ├── Primary (AZ-1)
    ├── Standby (AZ-2)
    └── Automated Backups
    ↓
Secrets Manager
    └── Automatic Rotation
```

---

## Implementation Steps

### Step 1: Create Production Infrastructure

```bash
# Create Terraform configuration
mkdir -p infrastructure/aws/terraform/production

# Files to create:
# - main.tf (VPC, ECS, RDS Multi-AZ, ALB, Route 53)
# - variables.tf
# - outputs.tf
# - terraform.tfvars.example

# Initialize and apply
cd infrastructure/aws/terraform/production
terraform init
terraform plan
terraform apply
```

### Step 2: Set Up ECR (Production)

```bash
# Use same ECR repositories, tag with prod versions
./scripts/push-to-ecr.sh prod
```

### Step 3: Create ECS Task Definitions (Production)

```bash
# Create production task definitions with:
# - Higher resource limits
# - Enhanced logging
# - X-Ray integration (optional)

aws ecs register-task-definition \
  --cli-input-json file://backend-prod.json
```

### Step 4: Create ECS Services (Multi-AZ)

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name life-world-os-production

# Create services with:
# - Multi-AZ deployment
# - Auto-scaling
# - Health checks

aws ecs create-service \
  --cluster life-world-os-production \
  --service-name backend-prod \
  --task-definition life-world-os-backend-prod \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-1,subnet-2],securityGroups=[sg-xxx],assignPublicIp=DISABLED}"
```

### Step 5: Configure RDS (Multi-AZ)

```bash
# Create RDS instance with:
# - Multi-AZ deployment
# - Automated backups
# - Enhanced monitoring
# - Production instance class

aws rds create-db-instance \
  --db-instance-identifier life-world-os-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --multi-az \
  --backup-retention-period 7
```

### Step 6: Configure ALB (Secure Access)

```bash
# Option A: IP-Restricted
# Configure security group to allow only your IP range

# Option B: VPN Access
# Set up AWS Client VPN
# Configure ALB for internal access only
```

### Step 7: Set Up Route 53

```bash
# Create hosted zone
aws route53 create-hosted-zone --name lifeworld.com

# Create A record pointing to ALB
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456789 \
  --change-batch file://route53-changes.json
```

### Step 8: Configure CloudWatch Alarms

```bash
# Create alarms for:
# - High CPU usage
# - High memory usage
# - Error rate
# - Database connections
# - Request latency

aws cloudwatch put-metric-alarm \
  --alarm-name backend-high-cpu \
  --alarm-description "Alert when CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### Step 9: Set Up Secrets Manager

```bash
# Store production secrets
aws secretsmanager create-secret \
  --name life-world-os/production/jwt-secret \
  --secret-string "production-secret"

# Configure automatic rotation (if supported)
aws secretsmanager rotate-secret \
  --secret-id life-world-os/production/jwt-secret
```

---

## Deliverables

### Infrastructure as Code

1. **Terraform Configuration:**
   - `infrastructure/aws/terraform/production/main.tf`
   - `infrastructure/aws/terraform/production/variables.tf`
   - `infrastructure/aws/terraform/production/outputs.tf`
   - `infrastructure/aws/terraform/production/terraform.tfvars.example`

2. **ECS Configuration:**
   - `infrastructure/aws/ecs/task-definitions/backend-prod.json`
   - `infrastructure/aws/ecs/task-definitions/frontend-prod.json`
   - `infrastructure/aws/ecs/services/backend-prod.json`
   - `infrastructure/aws/ecs/services/frontend-prod.json`

3. **Auto-Scaling:**
   - `infrastructure/aws/ecs/autoscaling/backend-prod.json`
   - `infrastructure/aws/ecs/autoscaling/frontend-prod.json`

### Deployment Scripts

1. **Production Deployment:**
   - `scripts/deploy-prod-aws.sh` - Production deployment script
   - `scripts/rollback-prod.sh` - Rollback script

2. **Monitoring:**
   - `scripts/setup-cloudwatch-alarms.sh` - Create CloudWatch alarms
   - `scripts/setup-dashboards.sh` - Create CloudWatch dashboards

### Security

1. **IAM Policies:**
   - `infrastructure/aws/iam/ecs-task-execution-role.json`
   - `infrastructure/aws/iam/ecs-task-role.json`

2. **Security Groups:**
   - `infrastructure/aws/security-groups/alb-prod.json`
   - `infrastructure/aws/security-groups/ecs-prod.json`
   - `infrastructure/aws/security-groups/rds-prod.json`

### Documentation

1. **Runbooks:**
   - Production deployment process
   - Rollback procedures
   - Incident response

2. **Monitoring:**
   - CloudWatch dashboard guide
   - Alert response procedures

---

## Migration Process

### Pre-Migration Checklist

- [ ] Staging environment fully tested on AWS
- [ ] Production data backup strategy defined
- [ ] Rollback plan documented
- [ ] Monitoring and alerting configured
- [ ] Security groups and IAM roles reviewed
- [ ] SSL/TLS certificates obtained
- [ ] Route 53 DNS configured
- [ ] Secrets stored in Secrets Manager

### Migration Steps

1. **Backup Current Production:**
   ```bash
   # Backup database
   pg_dump -h current-prod-db > backup.sql
   
   # Backup Docker images
   docker save life-world-os-backend-prod:latest > backend-prod.tar
   ```

2. **Create AWS Infrastructure:**
   ```bash
   cd infrastructure/aws/terraform/production
   terraform apply
   ```

3. **Migrate Database:**
   ```bash
   # Restore to RDS
   psql -h rds-endpoint -U admin -d lifeworld_prod < backup.sql
   ```

4. **Deploy Services:**
   ```bash
   ./scripts/deploy-prod-aws.sh
   ```

5. **Verify Deployment:**
   ```bash
   # Health checks
   curl https://prod.lifeworld.com/api/health
   
   # Check CloudWatch metrics
   aws cloudwatch get-metric-statistics ...
   ```

6. **Update DNS:**
   ```bash
   # Point domain to ALB
   aws route53 change-resource-record-sets ...
   ```

7. **Monitor and Validate:**
   - Monitor CloudWatch dashboards
   - Verify all services are healthy
   - Test critical user flows
   - Monitor error rates

### Post-Migration

- [ ] All services running and healthy
- [ ] DNS propagated
- [ ] Monitoring active
- [ ] Alerts configured
- [ ] Documentation updated
- [ ] Team trained on new infrastructure

---

## Cost Estimation

**Production Environment (Monthly):**
- ECS Fargate (2-10 tasks): ~$40-200
- RDS PostgreSQL (t3.medium, Multi-AZ): ~$60-120
- ALB: ~$16
- NAT Gateway: ~$32
- Route 53: ~$0.50
- CloudWatch: ~$10-20
- Secrets Manager: ~$0.40
- Data Transfer: ~$10-30
- **Total: ~$170-420/month**

---

## High Availability

### Multi-AZ Deployment

- **ECS**: Tasks distributed across multiple AZs
- **RDS**: Primary in AZ-1, Standby in AZ-2
- **ALB**: Spans multiple AZs automatically

### Auto-Scaling

- **ECS Services**: Scale based on CPU/memory metrics
- **Min Tasks**: 2 (for high availability)
- **Max Tasks**: 10 (for peak load)

### Health Checks

- **ECS**: Container health checks
- **ALB**: Application health checks
- **RDS**: Automated failover (Multi-AZ)

---

## Security Hardening

### Network Security

- VPC with private subnets
- Security groups with least privilege
- No public IPs on ECS tasks
- NAT Gateway for outbound traffic only

### Access Control

- IP-restricted ALB or VPN access
- IAM roles with least privilege
- Secrets Manager for credentials
- Audit logging enabled

### Data Protection

- Encryption at rest (RDS, EBS)
- Encryption in transit (SSL/TLS)
- Automated backups
- Point-in-time recovery

---

## Monitoring and Alerting

### Key Metrics

- **ECS**: CPU, memory, task count
- **RDS**: CPU, connections, storage
- **ALB**: Request count, error rate, latency
- **Application**: Custom metrics via CloudWatch

### Alarms

- High CPU usage (>80%)
- High memory usage (>80%)
- Error rate (>1%)
- Database connections (>80%)
- Request latency (>1s)

### Dashboards

- Real-time service health
- Resource utilization
- Error rates and trends
- Request patterns

---

## Disaster Recovery

### Backup Strategy

- **RDS**: Daily automated backups, 7-day retention
- **ECS Images**: Versioned in ECR
- **Configuration**: Stored in Terraform state

### Recovery Procedures

1. **Database Recovery**: Point-in-time recovery from RDS backups
2. **Service Recovery**: Rollback to previous ECS task definition
3. **Infrastructure Recovery**: Recreate from Terraform

---

## Related Documentation

- [Architecture Overview](./overview.md)
- [Phase 1: Local Infrastructure](./phase-1-local-infrastructure.md)
- [Phase 2: AWS Staging](./phase-2-aws-staging.md)
- [Tool Mapping](./tool-mapping.md)
- [Implementation Roadmap](./implementation-roadmap.md)

