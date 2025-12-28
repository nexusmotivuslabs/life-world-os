# Database Seed Dumps

This directory contains pre-seeded database dumps for fast database initialization.

## Overview

Instead of running compute-intensive seed scripts every time a database is initialized, we use pre-seeded database dumps. This approach:

- **Fast Startup**: 5-10 seconds instead of 1-2 minutes
- **Versioned**: Each dump includes schema version and metadata
- **Deterministic**: Same data every time
- **AWS-Compatible**: Matches RDS snapshot pattern

## Directory Structure

```
seeds/
├── dumps/                    # Pre-seeded database dumps
│   ├── dev-seeded-latest.dump       # Symlink to latest dev dump
│   ├── dev-seeded-v{version}-{date}.dump  # Versioned dev dump
│   ├── staging-seeded-latest.dump   # Symlink to latest staging dump
│   └── staging-seeded-v{version}-{date}.dump  # Versioned staging dump
│
├── scripts/
│   ├── generateDump.ts      # Generate dump from seeded database
│   ├── restoreDump.ts       # Restore database from dump
│   └── init-db.sh           # PostgreSQL init script (runs on first init)
│
└── README.md                 # This file
```

## Usage

### Generate a Dump

After seeding your database with all required data, generate a dump:

```bash
# For development
npm run generate-dump:dev

# For staging
npm run generate-dump:staging
```

This will:
1. Check database state and record counts
2. Create a versioned dump file
3. Generate metadata with checksums
4. Create symlink to latest dump

### Restore from Dump

Restore a database from a pre-seeded dump:

```bash
# For development
npm run restore-db:dev

# For staging
npm run restore-db:staging
```

**Note**: This will **drop and recreate** the database. Make sure you have backups if needed.

### Automatic Initialization

The `init-db.sh` script is automatically run by PostgreSQL on first database initialization (when data directory is empty). It will:

1. Check for a dump file
2. If found: Restore from dump (fast)
3. If not found: Log instructions (database will be empty)

This is configured in `docker-compose.dev.yml`:

```yaml
volumes:
  - ./seeds/scripts/init-db.sh:/docker-entrypoint-initdb.d/01-init-db.sh:ro
  - ./seeds/dumps:/docker-entrypoint-initdb.d/dumps:ro
```

## Workflow

### Initial Setup (First Time)

1. Start database: `docker-compose -f docker-compose.dev.yml up -d postgres-dev`
2. Run migrations: `cd apps/backend && npx prisma migrate deploy`
3. Seed database: `npm run seed:dev`
4. Generate dump: `npm run generate-dump:dev`

### Subsequent Setups (Fast)

1. Start database: `docker-compose -f docker-compose.dev.yml up -d postgres-dev`
   - Database automatically restores from dump on first initialization
2. Database is ready! (No seeding needed)

### After Schema Changes

1. Update dump after schema changes: `npm run generate-dump:dev`
2. Commit new dump to version control (optional)
3. Future initializations will use new dump

## Dump Format

Dumps use PostgreSQL's custom format (`-Fc`):
- Binary format (smaller, faster)
- Compressed
- Supports parallel restore
- Includes schema and data

## Metadata

Each dump includes a metadata file (`*.metadata.json`) with:

```json
{
  "version": "abc1234",           // Schema version (git commit hash)
  "timestamp": "2024-01-15T...",  // When dump was created
  "recordCounts": {               // Data integrity checks
    "realityNodes": 236,
    "agents": 12,
    "teams": 5
  },
  "checksum": "sha256...",        // File integrity checksum
  "environment": "dev"
}
```

## Best Practices

1. **Version Control**: Consider committing dumps to git for team consistency
2. **Update After Changes**: Regenerate dumps after schema or seed data changes
3. **Backup Production**: Never automatically restore dumps in production
4. **Test Restores**: Verify dump restores work before relying on them
5. **Document Changes**: Include changelog in metadata for significant updates

## Troubleshooting

### Dump Not Found

If `init-db.sh` can't find a dump:
- Database will start empty
- Run `npm run seed:dev` to populate manually
- Or generate a dump: `npm run generate-dump:dev`

### Dump Restore Fails

If restore fails:
- Check database connection string
- Verify dump file isn't corrupted (check checksum)
- Ensure PostgreSQL version compatibility
- Check logs: `docker logs life-db-dev`

### Outdated Dump

If dump is outdated:
- Regenerate: `npm run generate-dump:dev`
- Old versioned dumps are kept for history
- Latest symlink is updated automatically

## AWS RDS Integration

For AWS RDS environments, use RDS snapshots instead of dumps:

1. Create RDS instance and seed it
2. Create RDS snapshot: `aws rds create-db-snapshot ...`
3. Restore new instances from snapshot (no seeding needed)

This matches the same pattern as local dumps but uses AWS's native snapshot system.

