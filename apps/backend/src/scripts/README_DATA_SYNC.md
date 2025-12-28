# Data Sync & Versioning System

This system ensures that Reality Node data (Laws, Principles, Frameworks) can be synced and versioned across environments.

## Overview

The system provides:
1. **Version Tracking** - Each node tracks its template version in metadata
2. **Smart Merging** - New fields are added without overwriting existing data
3. **Migration Scripts** - Update existing nodes to new template structures
4. **Sync Utilities** - Sync from source definitions to database

## Versioning

Each node stores version information in its `metadata` field:
```json
{
  "_version": "2.0.0",
  "_templateType": "law|principle|framework",
  "_lastSynced": "2025-01-27T12:00:00.000Z",
  "_lastMigrated": "2025-01-27T12:00:00.000Z"
}
```

## Usage

### 1. Sync from Seed Definitions

Sync all nodes from seed script definitions (uses upsert):

```bash
# Dry run (see what would happen)
npm run sync:nodes:dry

# Actually sync
npm run sync:nodes
```

This will:
- Update existing nodes with new template fields
- Create missing nodes
- Preserve existing custom metadata
- Update version tracking

### 2. Migrate Existing Nodes

Migrate existing nodes to new template structure:

```bash
# Dry run
npm run migrate:nodes:dry

# Actually migrate
npm run migrate:nodes
```

This will:
- Check each node's version
- Update nodes that need migration
- Skip nodes already at current version
- Preserve existing data

### 3. Check Version Consistency

Check if all nodes are at the current version:

```bash
npm run sync:nodes:check
```

## How It Works

### Smart Metadata Merging

When updating a node, the system:
1. Fetches existing metadata
2. Merges new template fields with existing data
3. Preserves custom fields not in the template
4. Updates version tracking fields

### Template Versions

Current template versions:
- **Laws**: `2.0.0`
- **Principles**: `2.0.0`
- **Frameworks**: `2.0.0`

When you update a template:
1. Increment the version in `seedRealityHierarchy.ts`
2. Update the version in `migrateRealityNodes.ts`
3. Run migration script to update existing nodes

### Adding New Fields

When adding new fields to templates:

1. **Update seed script** - Add new fields to data definitions
2. **Update migration script** - Add migration logic for new fields
3. **Run sync** - `npm run sync:nodes` will update all nodes

Example: Adding a new field `example` to laws:

```typescript
// In seedRealityHierarchy.ts
const FUNDAMENTAL_LAWS = [
  {
    title: 'LAW_OF_COMPOUNDING',
    // ... existing fields
    example: 'New example field', // Add here
  }
]

// In createNode call
metadata: {
  // ... existing fields
  example: law.example || '', // Add here
}
```

## Workflow

### Initial Setup
```bash
npm run seed  # Seed initial data
```

### Adding New Nodes
```bash
# 1. Add to seed script
# 2. Run sync
npm run sync:nodes
```

### Updating Template Structure
```bash
# 1. Update template version in seed script
# 2. Update migration script if needed
# 3. Run migration
npm run migrate:nodes
```

### Syncing Across Environments
```bash
# Dev
npm run sync:nodes

# Staging
npm run seed:staging

# Production
npm run seed:prod
```

## Best Practices

1. **Always use upsert** - Never use direct `create` or `update`
2. **Version your templates** - Increment version when structure changes
3. **Test migrations** - Always run `--dry-run` first
4. **Check consistency** - Run `sync:nodes:check` before deployments
5. **Preserve custom data** - Migration merges, doesn't replace

## Troubleshooting

### Nodes not updating?
- Check version: `npm run sync:nodes:check`
- Run migration: `npm run migrate:nodes`
- Check seed script has latest fields

### Lost custom metadata?
- Migration preserves existing fields
- Check `_lastSynced` timestamp in metadata
- Restore from backup if needed

### Version conflicts?
- Ensure all scripts use same version constants
- Update `TEMPLATE_VERSIONS` in both seed and migration scripts

