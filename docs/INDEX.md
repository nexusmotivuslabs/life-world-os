# Documentation Index

**Last Updated**: 2025-01-15  
**Purpose**: Central index for all project documentation

---

## 🚀 Quick Links

### Getting Started
- [Quick Start - Docker](../QUICK_START_DOCKER.md) - 5-minute Docker setup ⭐
- [Prerequisites](../PREREQUISITES.md) - Required software and installation
- [Docker Environment Setup](../DOCKER_ENVIRONMENT_SETUP.md) - Comprehensive Docker guide
- [MVP Deployment Guide](./MVP_DEPLOYMENT_GUIDE.md) - Local deployment guide

### Release Management
- [V1 Release Guide](./V1_RELEASE.md) - Complete V1 release guide ⭐
- [Release Checklist](../RELEASE_CHECKLIST.md) - Release preparation checklist

### Development Workflows
- [Git Workflow](./GIT_WORKFLOW.md) - GitLab Flow and versioning ⭐
- [Deployment Guide](./DEPLOYMENT.md) - All deployment options ⭐
- [Testing Guide](./TESTING.md) - Testing strategies and procedures
- [Runbooks](./RUNBOOKS.md) - Operational procedures and troubleshooting

### Architecture & Design
- [Architecture Overview](./architecture/overview.md) - Complete architecture plan (4 phases) ⭐
- [Phase 0: Local Build with Dev - Foundation](./architecture/phase-0-foundation.md) - Foundation checklist ✅
- [Phase 0 Completion Report](./architecture/phase-0-completion-report.md) - Verification results ✅
- [Cost Analysis](./architecture/cost-analysis.md) - Infrastructure costs and scaling analysis ⭐
- [Phase 1: Local Build with Dev - Observability](./architecture/phase-1-local-infrastructure.md) - Local observability setup ✅
- [Phase 1 Setup Guide](./architecture/phase-1-setup-guide.md) - Setup instructions ✅
- [Phase 1 Complete](./architecture/PHASE_1_COMPLETE.md) - Implementation complete ✅
- [Tag & Label Explanation](./architecture/TAG_EXPLANATION.md) - Tags/labels vs GitFlow ⭐
- [Phase 2: AWS Staging](./architecture/phase-2-aws-staging.md) - AWS staging migration
- [Phase 3: AWS Production](./architecture/phase-3-aws-production.md) - AWS production migration
- [Tool & Environment Mapping](./architecture/tool-mapping.md) - Complete tool mapping table
- [Implementation Roadmap](./architecture/implementation-roadmap.md) - Step-by-step implementation guide
- [System Design](./SYSTEM_DESIGN.md) - Complete system design and philosophy
- [Life World Map](./LIFE_WORLD_MAP.md) - One-page visual reference map
- [Seasons Guide](./SEASONS_GUIDE.md) - Season rules and action mappings
- [XP System](./XP_SYSTEM.md) - XP earning formulas and progression
- [Operating Loops](./OPERATING_LOOPS.md) - Weekly and quarterly loops

### API & Technical
- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Test Users (Development)](./TEST_USERS.md) - Dev seed test users for Life World OS login
- [Loki Logs](./LOKI_LOGS.md) - View backend/frontend logs in Grafana (CloudWatch-like)
- [Naming Reference](./NAMING_REFERENCE.md) - All names and conventions used
- [Quick Reference](./QUICK_REFERENCE.md) - Quick reference guide

### Platform Engineering
- [Platform Engineering README](./confluence/domains/platform-engineering/README.md) - Domain overview
- [Platform Decision Framework](./confluence/domains/platform-engineering/PLATFORM_DECISION_FRAMEWORK.md) - How decisions are made
- [Stakeholder Identification](./confluence/domains/platform-engineering/STAKEHOLDER_IDENTIFICATION.md) - Who makes decisions
- [Deployment Strategy](./confluence/domains/platform-engineering/implementation/deployment-strategy.md) - MVP vs Release 3
- [GitLab Flow Guide](./confluence/domains/platform-engineering/implementation/gitlab-flow-guide.md) ⭐
- [GitLab Flow Best Practices](./confluence/domains/platform-engineering/implementation/gitlab-flow-best-practices.md) ⭐

### Security
- [Security Framework](../SECURITY_FRAMEWORK.md) - Product security framework
- [Security Domain](./confluence/domains/security/README.md) - Security domain documentation

### Navigation & Architecture
- [Navigation Assessment](../NAVIGATION_ASSESSMENT.md) - Navigation architecture review

---

## 📁 Documentation Structure

```
life-world-os/
├── README.md                          # Main project README
├── QUICK_START_DOCKER.md              # Quick start guide
├── PREREQUISITES.md                   # Prerequisites
├── RELEASE_CHECKLIST.md               # Release checklist
├── SECURITY_FRAMEWORK.md              # Security framework
├── NAVIGATION_ASSESSMENT.md           # Navigation assessment
│
├── docs/
│   ├── INDEX.md (this file) ⭐        # Documentation index
│   │
│   ├── V1_RELEASE.md                  # V1 release guide (consolidated)
│   ├── DEPLOYMENT.md                  # Deployment guide (consolidated)
│   ├── GIT_WORKFLOW.md                # Git workflow (consolidated)
│   ├── TESTING.md                     # Testing guide (consolidated)
│   ├── RUNBOOKS.md                    # Runbooks (consolidated)
│   │
│   ├── API_DOCUMENTATION.md           # API reference
│   ├── SYSTEM_DESIGN.md               # System design
│   ├── LIFE_WORLD_MAP.md              # Visual reference
│   ├── SEASONS_GUIDE.md               # Seasons guide
│   ├── XP_SYSTEM.md                   # XP system
│   ├── OPERATING_LOOPS.md             # Operating loops
│   ├── NAMING_REFERENCE.md            # Naming conventions
│   ├── QUICK_REFERENCE.md             # Quick reference
│   ├── MVP_DEPLOYMENT_GUIDE.md        # MVP deployment
│   │
│   ├── archive/                       # Historical documentation
│   │   └── README.md                  # Archive index
│   │
│   └── confluence/                    # Domain documentation
│       └── domains/
│           ├── platform-engineering/  # Platform engineering domain
│           └── security/              # Security domain
│
└── apps/dev-hub-app/                  # Deployable Dev Hub
    └── content/                       # Dev Hub content
```

---

## 🔍 Search by Topic

### Setup & Getting Started
- [Quick Start Docker](../QUICK_START_DOCKER.md) - 5-minute setup
- [Prerequisites](../PREREQUISITES.md) - Required software
- [Docker Environment Setup](../DOCKER_ENVIRONMENT_SETUP.md) - Docker guide
- [MVP Deployment Guide](./MVP_DEPLOYMENT_GUIDE.md) - Local deployment

### Release Management
- [V1 Release Guide](./V1_RELEASE.md) - Complete V1 guide
- [Release Checklist](../RELEASE_CHECKLIST.md) - Release preparation

### Git & Version Control
- [Git Workflow](./GIT_WORKFLOW.md) - GitLab Flow and versioning ⭐
- [GitLab Flow Guide](./confluence/domains/platform-engineering/implementation/gitlab-flow-guide.md) ⭐
- [GitLab Flow Best Practices](./confluence/domains/platform-engineering/implementation/gitlab-flow-best-practices.md) ⭐
- [GitOps vs Git Flow](../blog/systems/version-control/gitops-vs-gitflow.md) - Comparison

### Deployment
- [Deployment Guide](./DEPLOYMENT.md) - All deployment options ⭐
- [Deployment Strategy](./confluence/domains/platform-engineering/implementation/deployment-strategy.md) - MVP vs Release 3
- [Platform Engineering Domain](./confluence/domains/platform-engineering/README.md) - Infrastructure

### Testing & QA
- [Testing Guide](./TESTING.md) - Testing strategies
- [Runbooks](./RUNBOOKS.md) - Troubleshooting and operations

### Platform & Infrastructure
- [Platform Engineering README](./confluence/domains/platform-engineering/README.md)
- [Platform Decision Framework](./confluence/domains/platform-engineering/PLATFORM_DECISION_FRAMEWORK.md)
- [Stakeholder Identification](./confluence/domains/platform-engineering/STAKEHOLDER_IDENTIFICATION.md)
- [Outcome Documentation Format](./confluence/domains/platform-engineering/OUTCOME_DOCUMENTATION_FORMAT.md)

### Development
- [Backend Environment Setup](../apps/backend/ENV_SETUP.md) - Backend configuration
- [Ollama Setup](../apps/backend/README_OLLAMA.md) - Local AI setup
- [Travel System Setup](../apps/backend/TRAVEL_SYSTEM_SETUP.md) - Travel system

---

## 🎯 Common Tasks

### I want to...
- **Set up development environment**: [Quick Start Docker](../QUICK_START_DOCKER.md)
- **Understand git workflow**: [Git Workflow](./GIT_WORKFLOW.md) ⭐
- **Deploy to staging**: [Deployment Guide](./DEPLOYMENT.md)
- **Make a platform decision**: [Platform Decision Framework](./confluence/domains/platform-engineering/PLATFORM_DECISION_FRAMEWORK.md)
- **Troubleshoot issues**: [Runbooks](./RUNBOOKS.md)
- **Run tests**: [Testing Guide](./TESTING.md)
- **Review V1 release**: [V1 Release Guide](./V1_RELEASE.md)

---

## 📝 Document Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| Git Workflow | ✅ Complete | 2025-01-15 |
| V1 Release Guide | ✅ Complete | 2025-01-15 |
| Deployment Guide | ✅ Complete | 2025-01-15 |
| Testing Guide | ✅ Complete | 2025-01-15 |
| Runbooks | ✅ Complete | 2025-01-15 |
| Navigation Assessment | ✅ Complete | 2025-01-15 |
| Platform Decision Framework | ✅ Complete | 2025-01-15 |
| Docker Environment Setup | ✅ Complete | 2025-01-15 |

---

## 🔗 External Links

- [Platform Engineering Domain](./confluence/domains/platform-engineering/README.md)
- [Security Domain](./confluence/domains/security/README.md)
- [Dev Hub App](../apps/dev-hub-app/README.md) - Deployable developer hub

---

## 📚 Archive

Historical documentation has been moved to `docs/archive/`. See [Archive README](./archive/README.md) for details.

---

**Maintained By**: Development Team  
**How to Update**: Add new documents to appropriate section above
