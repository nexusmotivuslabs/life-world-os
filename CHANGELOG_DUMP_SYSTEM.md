# Changelog: Database Dump System & Smoke Test

## Summary

Implemented a versioned database dump system for fast database initialization and an end-to-end smoke test script to validate the entire application stack.

## Changes Made

### 1. Database Dump System

#### Files Created
- `seeds/scripts/generateDump.ts` - Generates versioned database dumps
- `seeds/scripts/restoreDump.ts` - Restores database from dumps
- `seeds/scripts/init-db.sh` - PostgreSQL initialization script (runs on first init)
- `seeds/README.md` - Comprehensive documentation
- `seeds/dumps/.gitkeep` - Keeps dumps directory in git

#### Files Modified
- `docker-compose.dev.yml` - Added init script and dumps volume mounts
- `package.json` - Added npm scripts for dump operations
- `.gitignore` - Added dump files and test logs

### 2. E2E Smoke Test

#### Files Created
- `scripts/smoke-test.sh` - End-to-end smoke test script
- `docs/SMOKE_TEST.md` - Smoke test documentation

#### Features
- Tests entire stack: Database → Backend → Frontend
- Validates services start correctly
- Checks basic functionality
- Optional flags: `--skip-dump-restore`, `--skip-frontend`

## Usage

### Generate Database Dump

```bash
# After seeding database, generate dump
npm run generate-dump:dev

# For staging
npm run generate-dump:staging
```

### Restore Database from Dump

```bash
# Restore from dump (fast - 5-10 seconds)
npm run restore-db:dev

# For staging
npm run restore-db:staging
```

### Run Smoke Test

```bash
# Full smoke test (database + backend + frontend)
npm run smoke-test

# Skip dump restore
npm run smoke-test -- --skip-dump-restore

# Skip frontend
npm run smoke-test -- --skip-frontend
```

## Benefits

### Database Dump System
- **Fast Startup**: 5-10 seconds vs 1-2 minutes (seeding)
- **Versioned**: Each dump includes schema version and metadata
- **Deterministic**: Same data every time
- **AWS-Compatible**: Matches RDS snapshot pattern
- **Automatic**: Runs on first database initialization

### Smoke Test
- **Comprehensive**: Tests entire stack end-to-end
- **Fast**: Quick validation of application health
- **CI/CD Ready**: Can be integrated into pipelines
- **Informative**: Clear pass/fail output with detailed logs

## Architecture

### Dump System Flow

```
┌─────────────────────────────────────┐
│  Generate Dump (One Time)          │
│  1. Seed database                   │
│  2. Create pg_dump (-Fc format)    │
│  3. Generate metadata + checksum   │
│  4. Create symlink (latest)        │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Restore on Startup (Fast)         │
│  1. Check for dump file            │
│  2. Drop + recreate database       │
│  3. pg_restore (5-10 seconds)      │
│  4. Ready to use!                  │
└─────────────────────────────────────┘
```

### Smoke Test Flow

```
Start
  ├─ Phase 1: Environment Setup
  │   ├─ Docker check
  │   ├─ Node.js check
  │   └─ Files check
  │
  ├─ Phase 2: Database Setup
  │   ├─ Start container
  │   ├─ Wait for health
  │   ├─ Restore dump (if exists)
  │   ├─ Run migrations
  │   └─ Verify connection
  │
  ├─ Phase 3: Backend Setup
  │   ├─ Generate Prisma Client
  │   ├─ Start server
  │   ├─ Health check
  │   └─ API tests
  │
  ├─ Phase 4: Frontend Setup (optional)
  │   ├─ Start server
  │   └─ Accessibility check
  │
  └─ Phase 5: Data Validation
      ├─ Check reality nodes
      └─ Check other data
```

## Migration Guide

### For Existing Environments

1. **Generate Initial Dump**
   ```bash
   # Ensure database is seeded
   npm run seed:dev
   
   # Generate dump
   npm run generate-dump:dev
   ```

2. **Update docker-compose** (already done)
   - Dump system is integrated
   - Automatic restoration on first init

3. **Test**
   ```bash
   # Run smoke test to verify
   npm run smoke-test
   ```

### For New Environments

1. Start database (dumps automatically restored if available)
2. Run smoke test to verify everything works

## Notes

- Dump files are gitignored (not version controlled)
- Metadata files include checksums for integrity verification
- Dumps are environment-specific (dev, staging, prod)
- Old dumps are kept (versioned by date and commit hash)

