# Implementation Roadmap

**Last Updated**: 2025-01-15  
**Status**: Planning  
**Timeline**: Phased approach

---

## Overview

This roadmap outlines the step-by-step implementation plan for all three phases of the architecture migration.

---

## Phase 1: Local Infrastructure

**Priority**: 1  
**Timeline**: Current  
**Environment**: Local Development Only

### Step 1.1: Create Observability Stack

**Files to Create:**
```
docker-compose.observability.local.yml
monitoring/prometheus/prometheus.local.yml
monitoring/grafana/datasources/prometheus.yml
monitoring/grafana/dashboards/local/
```

**Commands:**
```bash
# Create directories
mkdir -p monitoring/prometheus
mkdir -p monitoring/grafana/dashboards/local
mkdir -p monitoring/grafana/datasources

# Create docker-compose file
# (See phase-1-local-infrastructure.md for content)

# Start services
docker-compose -f docker-compose.observability.local.yml up -d

# Verify
curl http://localhost:9090/api/v1/status/config  # Prometheus
curl http://localhost:3000/api/health            # Grafana
```

**Deliverables:**
- ✅ Prometheus running on port 9090
- ✅ Grafana running on port 3000
- ✅ Prometheus scraping local services
- ✅ Grafana dashboards configured

---

### Step 1.2: Create Portainer

**Files to Create:**
```
docker-compose.portainer.yml
```

**Commands:**
```bash
# Create docker-compose file
# (See phase-1-local-infrastructure.md for content)

# Start service
docker-compose -f docker-compose.portainer.yml up -d

# Verify
curl http://localhost:9000/api/status
```

**Deliverables:**
- ✅ Portainer running on port 9000
- ✅ Accessible via web UI

---

### Step 1.3: Documentation

**Files to Create:**
```
docs/architecture/phase-1-local-infrastructure.md (✅ Created)
docs/architecture/setup-local-observability.md
```

**Content:**
- Setup instructions
- Usage guide
- Troubleshooting

**Deliverables:**
- ✅ Complete documentation
- ✅ Quick start guide

---

### Phase 1 Completion Criteria

- [ ] Prometheus collecting metrics from local services
- [ ] Grafana dashboards showing local metrics
- [ ] Portainer accessible and managing containers
- [ ] Documentation complete
- [ ] All services healthy and accessible

---

## Phase 2: AWS Staging Migration

**Priority**: 2  
**Timeline**: After Phase 1  
**Environment**: Staging

### Step 2.1: AWS Account Setup

**Tasks:**
- [ ] Create AWS account (if not exists)
- [ ] Configure AWS CLI
- [ ] Set up billing alerts
- [ ] Create IAM user for deployments
- [ ] Configure credentials

**Commands:**
```bash
# Install AWS CLI
brew install awscli  # macOS
# or
apt-get install awscli  # Linux

# Configure
aws configure

# Verify
aws sts get-caller-identity
```

**Deliverables:**
- ✅ AWS CLI configured
- ✅ IAM user created
- ✅ Credentials stored securely

---

### Step 2.2: Create ECR Repositories

**Files to Create:**
```
scripts/create-ecr-repos.sh
```

**Commands:**
```bash
# Create repositories
aws ecr create-repository --repository-name life-world-os-backend
aws ecr create-repository --repository-name life-world-os-frontend

# Get login command
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.us-east-1.amazonaws.com
```

**Deliverables:**
- ✅ ECR repositories created
- ✅ Login configured
- ✅ Script for repository creation

---

### Step 2.3: Create Terraform Infrastructure

**Files to Create:**
```
infrastructure/aws/terraform/staging/main.tf
infrastructure/aws/terraform/staging/variables.tf
infrastructure/aws/terraform/staging/outputs.tf
infrastructure/aws/terraform/staging/terraform.tfvars.example
```

**Components:**
- VPC with public/private subnets
- ECS cluster
- RDS PostgreSQL
- ALB with target groups
- Security groups
- IAM roles

**Commands:**
```bash
cd infrastructure/aws/terraform/staging
terraform init
terraform plan
terraform apply
```

**Deliverables:**
- ✅ VPC created
- ✅ ECS cluster created
- ✅ RDS instance created
- ✅ ALB created
- ✅ Security groups configured

---

### Step 2.4: Create ECS Task Definitions

**Files to Create:**
```
infrastructure/aws/ecs/task-definitions/backend-staging.json
infrastructure/aws/ecs/task-definitions/frontend-staging.json
```

**Commands:**
```bash
# Register task definitions
aws ecs register-task-definition \
  --cli-input-json file://backend-staging.json

aws ecs register-task-definition \
  --cli-input-json file://frontend-staging.json
```

**Deliverables:**
- ✅ Backend task definition registered
- ✅ Frontend task definition registered
- ✅ Task definitions reference ECR images

---

### Step 2.5: Create ECS Services

**Files to Create:**
```
infrastructure/aws/ecs/services/backend-staging.json
infrastructure/aws/ecs/services/frontend-staging.json
```

**Commands:**
```bash
# Create services
aws ecs create-service \
  --cli-input-json file://backend-staging.json

aws ecs create-service \
  --cli-input-json file://frontend-staging.json
```

**Deliverables:**
- ✅ Backend service running
- ✅ Frontend service running
- ✅ Services connected to ALB

---

### Step 2.6: Create Deployment Scripts

**Files to Create:**
```
scripts/push-to-ecr.sh
scripts/deploy-aws.sh
scripts/create-ecs-service.sh
scripts/update-alb.sh
```

**Commands:**
```bash
# Build and push images
./scripts/push-to-ecr.sh staging

# Deploy to ECS
./scripts/deploy-aws.sh staging
```

**Deliverables:**
- ✅ Images pushed to ECR
- ✅ ECS services updated
- ✅ Deployment automated

---

### Step 2.7: Set Up Observability

**Files to Create:**
```
docker-compose.observability.staging.yml
monitoring/loki/loki-config.staging.yml
monitoring/promtail/promtail-config.staging.yml
```

**Commands:**
```bash
# Deploy Loki + Promtail
docker-compose -f docker-compose.observability.staging.yml up -d

# Configure CloudWatch
# (Automatic with ECS, configure dashboards and alarms)
```

**Deliverables:**
- ✅ Loki collecting logs
- ✅ Promtail forwarding logs
- ✅ CloudWatch dashboards created
- ✅ CloudWatch alarms configured

---

### Step 2.8: Configure Secrets

**Option A: AWS Secrets Manager**

**Commands:**
```bash
# Store secrets
aws secretsmanager create-secret \
  --name life-world-os/staging/jwt-secret \
  --secret-string "your-secret"

aws secretsmanager create-secret \
  --name life-world-os/staging/db-password \
  --secret-string "your-password"
```

**Option B: HashiCorp Vault**

**Files to Create:**
```
docker-compose.vault.yml
vault/config/vault.hcl
```

**Commands:**
```bash
docker-compose -f docker-compose.vault.yml up -d
```

**Deliverables:**
- ✅ Secrets stored securely
- ✅ ECS tasks accessing secrets
- ✅ No secrets in code or config files

---

### Step 2.9: Set Up CI/CD

**Files to Create:**
```
.github/workflows/staging-deploy.yml
```

**Configuration:**
- Build Docker images
- Push to ECR
- Update ECS services
- Run tests

**Deliverables:**
- ✅ GitHub Actions workflow
- ✅ Automated deployments on push
- ✅ Tests run before deployment

---

### Phase 2 Completion Criteria

- [ ] Staging environment running on AWS
- [ ] All services healthy
- [ ] Images in ECR
- [ ] ALB accessible (IP-restricted)
- [ ] CloudWatch monitoring active
- [ ] Logs aggregated in Loki
- [ ] Secrets managed securely
- [ ] CI/CD pipeline working
- [ ] Documentation complete

---

## Phase 3: AWS Production Migration

**Priority**: 3  
**Timeline**: After Phase 2  
**Environment**: Production

### Step 3.1: Create Production Infrastructure

**Files to Create:**
```
infrastructure/aws/terraform/production/main.tf
infrastructure/aws/terraform/production/variables.tf
infrastructure/aws/terraform/production/outputs.tf
infrastructure/aws/terraform/production/terraform.tfvars.example
```

**Components:**
- VPC with enhanced security
- ECS cluster (multi-AZ)
- RDS PostgreSQL (Multi-AZ)
- ALB (IP-restricted or VPN)
- Route 53
- Enhanced security groups

**Commands:**
```bash
cd infrastructure/aws/terraform/production
terraform init
terraform plan
terraform apply
```

**Deliverables:**
- ✅ Production VPC created
- ✅ Multi-AZ ECS cluster
- ✅ Multi-AZ RDS instance
- ✅ ALB configured
- ✅ Route 53 configured

---

### Step 3.2: Create Production ECS Configuration

**Files to Create:**
```
infrastructure/aws/ecs/task-definitions/backend-prod.json
infrastructure/aws/ecs/task-definitions/frontend-prod.json
infrastructure/aws/ecs/services/backend-prod.json
infrastructure/aws/ecs/services/frontend-prod.json
infrastructure/aws/ecs/autoscaling/backend-prod.json
infrastructure/aws/ecs/autoscaling/frontend-prod.json
```

**Configuration:**
- Higher resource limits
- Multi-AZ deployment
- Auto-scaling (min: 2, max: 10)
- Enhanced logging
- X-Ray integration (optional)

**Commands:**
```bash
# Register task definitions
aws ecs register-task-definition \
  --cli-input-json file://backend-prod.json

# Create services with auto-scaling
aws ecs create-service \
  --cli-input-json file://backend-prod.json

# Configure auto-scaling
aws application-autoscaling register-scalable-target \
  --cli-input-json file://backend-prod-autoscaling.json
```

**Deliverables:**
- ✅ Production task definitions
- ✅ Production services running
- ✅ Auto-scaling configured

---

### Step 3.3: Configure RDS Multi-AZ

**Commands:**
```bash
# Create Multi-AZ RDS instance
aws rds create-db-instance \
  --db-instance-identifier life-world-os-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --multi-az \
  --backup-retention-period 7 \
  --storage-encrypted
```

**Deliverables:**
- ✅ Multi-AZ RDS instance
- ✅ Automated backups configured
- ✅ Encryption enabled

---

### Step 3.4: Configure ALB Security

**Option A: IP-Restricted**

**Commands:**
```bash
# Update security group to allow only your IP
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxx \
  --protocol tcp \
  --port 443 \
  --cidr YOUR_IP/32
```

**Option B: VPN Access**

**Commands:**
```bash
# Create AWS Client VPN
aws ec2 create-client-vpn-endpoint \
  --client-cidr-block 10.0.0.0/16 \
  --server-certificate-arn arn:aws:acm:...
```

**Deliverables:**
- ✅ ALB secured (IP-restricted or VPN)
- ✅ SSL/TLS certificates configured
- ✅ HTTPS only

---

### Step 3.5: Set Up Route 53

**Commands:**
```bash
# Create hosted zone
aws route53 create-hosted-zone --name lifeworld.com

# Create A record pointing to ALB
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456789 \
  --change-batch file://route53-changes.json
```

**Deliverables:**
- ✅ Route 53 hosted zone created
- ✅ DNS records configured
- ✅ Health checks configured

---

### Step 3.6: Configure CloudWatch Alarms

**Files to Create:**
```
scripts/setup-cloudwatch-alarms.sh
infrastructure/aws/cloudwatch/alarms/production/
```

**Commands:**
```bash
# Create alarms
./scripts/setup-cloudwatch-alarms.sh

# Or manually
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

**Deliverables:**
- ✅ CloudWatch alarms configured
- ✅ SNS topics for alerts
- ✅ Email/SMS notifications

---

### Step 3.7: Configure Secrets Manager

**Commands:**
```bash
# Store production secrets
aws secretsmanager create-secret \
  --name life-world-os/production/jwt-secret \
  --secret-string "production-secret"

# Configure rotation (if supported)
aws secretsmanager rotate-secret \
  --secret-id life-world-os/production/jwt-secret
```

**Deliverables:**
- ✅ All secrets in Secrets Manager
- ✅ Automatic rotation configured (where supported)
- ✅ IAM roles configured for access

---

### Step 3.8: Create Production Deployment Scripts

**Files to Create:**
```
scripts/deploy-prod-aws.sh
scripts/rollback-prod.sh
scripts/backup-prod.sh
```

**Commands:**
```bash
# Deploy to production
./scripts/deploy-prod-aws.sh

# Rollback if needed
./scripts/rollback-prod.sh
```

**Deliverables:**
- ✅ Production deployment script
- ✅ Rollback script
- ✅ Backup script

---

### Step 3.9: Set Up CI/CD for Production

**Files to Create:**
```
.github/workflows/production-deploy.yml
```

**Configuration:**
- Manual approval required
- Run tests
- Build and push images
- Deploy to production
- Verify deployment

**Deliverables:**
- ✅ Production CI/CD pipeline
- ✅ Manual approval gate
- ✅ Automated verification

---

### Phase 3 Completion Criteria

- [ ] Production environment running on AWS
- [ ] Multi-AZ deployment active
- [ ] Auto-scaling configured
- [ ] ALB secured (IP-restricted or VPN)
- [ ] Route 53 DNS configured
- [ ] CloudWatch alarms active
- [ ] Secrets in Secrets Manager
- [ ] Backups configured
- [ ] CI/CD pipeline working
- [ ] Documentation complete
- [ ] Team trained

---

## Timeline Estimate

### Phase 1: Local Infrastructure
**Duration**: 1-2 weeks  
**Effort**: 2-3 days

### Phase 2: AWS Staging
**Duration**: 2-4 weeks  
**Effort**: 1-2 weeks

### Phase 3: AWS Production
**Duration**: 2-3 weeks  
**Effort**: 1-2 weeks

**Total Timeline**: 5-9 weeks

---

## Dependencies

### Phase 1 Dependencies
- ✅ Docker installed
- ✅ Docker Compose installed
- ✅ Local development environment running

### Phase 2 Dependencies
- ✅ Phase 1 complete
- ✅ AWS account created
- ✅ AWS CLI configured
- ✅ Terraform installed

### Phase 3 Dependencies
- ✅ Phase 2 complete
- ✅ Staging environment stable
- ✅ Production data backup strategy
- ✅ Rollback plan documented

---

## Risk Mitigation

### Phase 1 Risks
- **Risk**: Local services conflict with existing setup
- **Mitigation**: Use separate ports, test in isolation

### Phase 2 Risks
- **Risk**: AWS costs exceed budget
- **Mitigation**: Set up billing alerts, use cost calculator
- **Risk**: Migration downtime
- **Mitigation**: Run Docker Compose and AWS in parallel during migration

### Phase 3 Risks
- **Risk**: Production downtime
- **Mitigation**: Blue-green deployment, rollback plan
- **Risk**: Data loss
- **Mitigation**: Complete backups before migration, test restore

---

## Related Documentation

- [Architecture Overview](./overview.md)
- [Phase 1: Local Infrastructure](./phase-1-local-infrastructure.md)
- [Phase 2: AWS Staging](./phase-2-aws-staging.md)
- [Phase 3: AWS Production](./phase-3-aws-production.md)
- [Tool Mapping](./tool-mapping.md)

