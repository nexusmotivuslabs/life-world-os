# Scripts Directory

Organized scripts for Life World OS infrastructure management.

## Structure

```
scripts/
├── envs/           # Environment-specific scripts (one per environment)
├── utils/          # Utility scripts (versioning, testing, etc.)
├── setup/          # Setup scripts (one-time configuration)
└── README.md       # This file
```

## Environment Scripts (`envs/`)

**Single script per environment** - powers the entire infrastructure:

### `local.sh` - Local Development
Complete local development environment:
- Database (Docker)
- Backend (port 5001)
- Frontend (port 5173)
- Environment setup
- Prisma client generation
- Migrations

**Usage:**
```bash
./scripts/envs/local.sh
# or
npm run env:local
```

### `dev.sh` - Dev Environment
Complete dev environment (Docker-based):
- Database
- Backend
- Frontend
- Dev Hub
- Observability
- Migrations & seeding

**Usage:**
```bash
./scripts/envs/dev.sh
# or
npm run env:dev
```

### `staging.sh` - Staging Environment
Complete staging environment:
- Database
- Backend
- Frontend
- Migrations & seeding

**Usage:**
```bash
./scripts/envs/staging.sh
# or
npm run env:staging
```

## Utility Scripts (`utils/`)

Helper scripts for various tasks:

- `get-version.js` - Get version information
- `verify-prerequisites.js` - Verify system prerequisites
- `seed-dev.sh` - Seed dev database
- `seed-staging.sh` - Seed staging database
- `run-e2e-local.sh` - Run E2E tests locally
- `smoke-test.sh` - Run smoke tests
- `check-*.sh` - Various check scripts
- `clean-ship.sh` - Clean up Docker resources
- `generate-*.sh` - Code generation scripts
- `release-workflow.sh` - Release workflow automation

## Setup Scripts (`setup/`)

One-time setup and configuration scripts:

- `setup-local-db.sh` - Local database setup
- `setup-domains.sh` - Domain configuration
- `setup-dns.sh` - DNS setup
- `setup-network-access.sh` - Network access configuration
- `setup-git-user.sh` - Git user configuration
- `setup-github-remote.sh` - GitHub remote setup
- `setup-sonarqube.sh` - SonarQube setup
- `setup-phase1.sh` - Phase 1 infrastructure setup
- `setup-mvp.sh` - MVP setup

## Migration from Old Scripts

Old scripts have been organized into the new structure:

| Old Location | New Location |
|-------------|--------------|
| `dev-local.sh` | Consolidated into `envs/local.sh` |
| `start-dev.sh` | Consolidated into `envs/local.sh` |
| `deploy-dev.sh` | Consolidated into `envs/dev.sh` |
| `rebuild-dev.sh` | Consolidated into `envs/dev.sh` |
| `deploy-staging.sh` | Consolidated into `envs/staging.sh` |
| `setup-local-db.sh` | Moved to `setup/` |
| `seed-dev.sh` | Moved to `utils/` |
| `get-version.js` | Moved to `utils/` |

## Best Practices

1. **Use environment scripts** - Use `envs/*.sh` for infrastructure management
2. **One script per environment** - Each environment has a single entry point
3. **Utilities are helpers** - Utility scripts support the main environment scripts
4. **Setup is one-time** - Setup scripts are for initial configuration only

## Adding New Scripts

- **Environment scripts**: Add to `envs/` if it powers an entire environment
- **Utility scripts**: Add to `utils/` if it's a helper/utility function
- **Setup scripts**: Add to `setup/` if it's one-time configuration

## NPM Scripts

The `package.json` has been updated to use the new script locations:

```json
{
  "env:local": "./scripts/envs/local.sh",
  "env:dev": "./scripts/envs/dev.sh",
  "env:staging": "./scripts/envs/staging.sh"
}
```

