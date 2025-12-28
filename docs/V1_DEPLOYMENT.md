# V1 Deployment Guide

**Version**: 1.0.0 (V1)  
**Status**: Complete and Tagged  
**Last Updated**: 2025-01-25

## Overview

This guide documents the V1.0.0 deployment process. V1 represents the initial production release of Life World OS.

## V1 Features

- Finance System (Live)
- Energy System (Live)
- Health System (Live)
- Artifacts System (Live)
- Reality Hierarchy
- Plane System (Systems, Artifacts)
- Complete backend and frontend infrastructure
- Docker deployment support
- Version tagging system

## Deployment Environments

V1 supports deployment to:
- Local development
- Dev environment
- Staging environment
- Production environment

## Quick Start

### Local Development

```bash
# Start database
docker-compose -f docker-compose.dev.yml --profile db up -d

# Setup backend
cd apps/backend
cp .env.example .env
npm run generate
npm run migrate
npm run seed

# Start development
cd ../..
npm run dev
```

### Dev Environment

```bash
# Deploy to dev
./scripts/deploy-cloud.sh dev docker
```

### Staging Environment

```bash
# Deploy to staging
./scripts/deploy-staging.sh
```

### Production Environment

```bash
# Deploy to production
./scripts/deploy-prod.sh
```

## Version Information

V1.0.0 is tagged in git:
```bash
git tag -a v1.0.0 -m "V1 Complete: Initial production release"
```

## Migration to V2

For migration to V2 (1.1.0), see [V1_TO_V2_MIGRATION.md](./V1_TO_V2_MIGRATION.md).

## Related Documentation

- [V1_COMPLETE.md](../V1_COMPLETE.md) - V1 completion documentation
- [CHANGELOG.md](../CHANGELOG.md) - Version changelog
- [V1_TO_V2_MIGRATION.md](./V1_TO_V2_MIGRATION.md) - Migration guide
- [DEPLOYMENT_V2.md](./DEPLOYMENT_V2.md) - V2 deployment guide

