# Phase 2: AWS Staging Migration

**Priority**: 2  
**Environment**: Staging  
**Timeline**: After Phase 1  
**Status**: Planning

---

## Overview

Phase 2 introduces the cloud provider (AWS) for the staging environment. This phase migrates staging from Docker Compose to AWS services while maintaining observability with both AWS and open-source tools.

---

## Goals

1. Migrate staging environment to AWS
2. Introduce cloud provider services (ECR, ECS, RDS, ALB)
3. Set up observability (CloudWatch + Loki)
4. Implement secrets management (Secrets Manager or Vault)
5. Establish CI/CD pipeline

---

## Components

### 1. AWS Infrastructure

#### ECR (Elastic Container Registry)
**Purpose**: Container registry for Docker images  
**Replaces**: Docker Registry (if used locally)  
**Configuration**: Push versioned images from CI/CD

#### ECS Fargate (Elastic Container Service)
**Purpose**: Container orchestration  
**Replaces**: Docker Compose  
**Configuration**: 
- Task definitions with versioned images
- Services with auto-scaling
- Health checks

#### RDS PostgreSQL
**Purpose**: Managed database service  
**Replaces**: Docker PostgreSQL  
**Configuration**:
- Single-AZ for staging (cost optimization)
- Automated backups
- Security groups

#### ALB (Application Load Balancer)
**Purpose**: Load balancer with IP restriction  
**Replaces**: Nginx  
**Configuration**:
- IP-restricted access (your home IP)
- Health checks
- SSL/TLS termination (optional)

#### VPC + Security Groups
**Purpose**: Network isolation and security  
**Configuration**:
- Public subnet (ALB)
- Private subnet (ECS, RDS)
- Security groups for each service

---

### 2. Observability

#### CloudWatch
**Purpose**: AWS-native monitoring  
**Configuration**:
- Log groups for ECS tasks
- Metrics for ECS, RDS, ALB
- Dashboards
- Alarms (optional for staging)

#### Prometheus + Grafana (Optional)
**Purpose**: Additional monitoring alongside CloudWatch  
**Configuration**: Can run in ECS or separate instance

#### Loki + Promtail
**Purpose**: Log aggregation  
**Configuration**:
- Loki in ECS or EC2
- Promtail as sidecar or DaemonSet
- Grafana integration for log viewing

---

### 3. Secrets Management

#### Option A: AWS Secrets Manager (Recommended)
**Purpose**: AWS-native secrets management  
**Configuration**:
- Store JWT_SECRET, DB_PASSWORD, API_KEYS
- IAM roles for ECS tasks
- Automatic rotation (optional)

#### Option B: HashiCorp Vault
**Purpose**: Self-hosted secrets management  
**Configuration**:
- Vault in ECS or EC2
- Integration with ECS tasks
- More control, but more maintenance

---

### 4. CI/CD

#### GitHub Actions (Recommended)
**Purpose**: Automated builds and deployments  
**Configuration**:
- Build Docker images
- Push to ECR
- Update ECS services
- Run tests

#### AWS CodePipeline (Alternative)
**Purpose**: AWS-native CI/CD  
**Configuration**:
- Source: GitHub
- Build: CodeBuild
- Deploy: ECS

---

## Architecture Diagram

```
Internet (IP-Restricted)
    ↓
ALB (Application Load Balancer)
    ↓
ECS Fargate (Backend + Frontend)
    ├── CloudWatch Logs
    ├── Prometheus (optional)
    └── Promtail → Loki
    ↓
RDS PostgreSQL (Private Subnet)
    ↓
Secrets Manager / Vault
```

---

## Implementation Steps

### Step 1: Create AWS Infrastructure

```bash
# Create Terraform configuration
mkdir -p infrastructure/aws/terraform/staging

# Files to create:
# - main.tf (VPC, ECS, RDS, ALB)
# - variables.tf
# - outputs.tf
# - terraform.tfvars.example

# Initialize and apply
cd infrastructure/aws/terraform/staging
terraform init
terraform plan
terraform apply
```

### Step 2: Set Up ECR

```bash
# Create ECR repositories
aws ecr create-repository --repository-name life-world-os-backend
aws ecr create-repository --repository-name life-world-os-frontend

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.us-east-1.amazonaws.com
```

### Step 3: Create ECS Task Definitions

```bash
# Create task definitions
# Files: infrastructure/aws/ecs/task-definitions/backend-staging.json
# Files: infrastructure/aws/ecs/task-definitions/frontend-staging.json

# Register task definitions
aws ecs register-task-definition \
  --cli-input-json file://backend-staging.json
```

### Step 4: Create ECS Services

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name life-world-os-staging

# Create services
aws ecs create-service \
  --cluster life-world-os-staging \
  --service-name backend-staging \
  --task-definition life-world-os-backend-staging \
  --desired-count 1
```

### Step 5: Configure ALB

```bash
# Create ALB
# Configure target groups
# Set up security groups (IP restriction)
# Configure health checks
```

### Step 6: Set Up Observability

```bash
# CloudWatch: Automatic with ECS
# Loki + Promtail: Deploy via ECS or EC2
docker-compose -f docker-compose.observability.staging.yml up -d
```

### Step 7: Configure Secrets

```bash
# Option A: Secrets Manager
aws secretsmanager create-secret \
  --name life-world-os/staging/jwt-secret \
  --secret-string "your-secret"

# Option B: Vault
docker-compose -f docker-compose.vault.yml up -d
```

---

## Deliverables

### Infrastructure as Code

1. **Terraform Configuration:**
   - `infrastructure/aws/terraform/staging/main.tf`
   - `infrastructure/aws/terraform/staging/variables.tf`
   - `infrastructure/aws/terraform/staging/outputs.tf`
   - `infrastructure/aws/terraform/staging/terraform.tfvars.example`

2. **ECS Configuration:**
   - `infrastructure/aws/ecs/task-definitions/backend-staging.json`
   - `infrastructure/aws/ecs/task-definitions/frontend-staging.json`
   - `infrastructure/aws/ecs/services/backend-staging.json`
   - `infrastructure/aws/ecs/services/frontend-staging.json`

### Deployment Scripts

1. **Image Management:**
   - `scripts/push-to-ecr.sh` - Push images to ECR
   - `scripts/build-and-push.sh` - Build and push workflow

2. **Deployment:**
   - `scripts/deploy-aws.sh` - Main AWS deployment script
   - `scripts/create-ecs-service.sh` - Create/update ECS services
   - `scripts/update-alb.sh` - Update ALB configuration

### Observability

1. **Docker Compose:**
   - `docker-compose.observability.staging.yml` - Loki, Promtail

2. **Configuration:**
   - `monitoring/loki/loki-config.staging.yml`
   - `monitoring/promtail/promtail-config.staging.yml`

### CI/CD

1. **GitHub Actions:**
   - `.github/workflows/staging-deploy.yml`

2. **Documentation:**
   - CI/CD setup guide
   - Deployment process

---

## Migration Process

### Pre-Migration Checklist

- [ ] AWS account set up
- [ ] AWS CLI configured
- [ ] Terraform installed
- [ ] ECR repositories created
- [ ] VPC and networking configured
- [ ] Security groups configured
- [ ] Secrets stored in Secrets Manager or Vault

### Migration Steps

1. **Build and Push Images:**
   ```bash
   ./scripts/push-to-ecr.sh staging
   ```

2. **Create Infrastructure:**
   ```bash
   cd infrastructure/aws/terraform/staging
   terraform apply
   ```

3. **Deploy Services:**
   ```bash
   ./scripts/deploy-aws.sh staging
   ```

4. **Verify Deployment:**
   ```bash
   # Check ECS services
   aws ecs describe-services --cluster life-world-os-staging

   # Check ALB health
   curl http://staging-alb-url/api/health
   ```

5. **Set Up Observability:**
   ```bash
   docker-compose -f docker-compose.observability.staging.yml up -d
   ```

### Post-Migration

- [ ] Verify all services are running
- [ ] Test health endpoints
- [ ] Verify logs in CloudWatch
- [ ] Verify metrics in CloudWatch
- [ ] Test IP restriction on ALB
- [ ] Update documentation

---

## Cost Estimation

**Staging Environment (Monthly):**
- ECS Fargate: ~$20-40
- RDS PostgreSQL (t3.micro): ~$15-30
- ALB: ~$16
- ECR: ~$0.10/GB storage
- CloudWatch: ~$2-5
- Data Transfer: ~$5-10
- **Total: ~$60-110/month**

---

## Rollback Plan

If issues occur during migration:

1. **Keep Docker Compose Running:**
   - Don't stop Docker Compose services until AWS is verified
   - Use both in parallel during migration

2. **Rollback Steps:**
   ```bash
   # Revert to Docker Compose
   docker-compose -f docker-compose.staging.yml up -d
   
   # Or rollback ECS service
   aws ecs update-service \
     --cluster life-world-os-staging \
     --service backend-staging \
     --task-definition previous-version
   ```

---

## Next Steps

After Phase 2 is complete:

1. **Phase 3**: AWS Production Migration
   - Production-grade infrastructure
   - Multi-AZ deployment
   - Enhanced security
   - Route 53 DNS

---

## Related Documentation

- [Architecture Overview](./overview.md)
- [Phase 1: Local Infrastructure](./phase-1-local-infrastructure.md)
- [Phase 3: AWS Production](./phase-3-aws-production.md)
- [Tool Mapping](./tool-mapping.md)
- [Implementation Roadmap](./implementation-roadmap.md)

