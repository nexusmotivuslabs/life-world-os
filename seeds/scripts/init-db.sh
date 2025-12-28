#!/bin/bash
# Database Initialization Script
# Runs ONLY on first database initialization (when data directory is empty)
# Mounted to /docker-entrypoint-initdb.d/ in docker-compose

set -e

echo "🔧 Initializing database..."

DB_NAME="${POSTGRES_DB:-lifeworld_dev}"
DB_USER="${POSTGRES_USER:-lifeworld_dev}"
DUMP_DIR="/docker-entrypoint-initdb.d/dumps"
ENV="${ENVIRONMENT:-dev}"

echo "   Environment: $ENV"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"

# Find latest dump for this environment
LATEST_DUMP="${DUMP_DIR}/${ENV}-seeded-latest.dump"

if [ -f "$LATEST_DUMP" ]; then
  echo "📦 Found dump file: $LATEST_DUMP"
  echo "   → Restoring from dump (FAST)..."
  
  # Restore from dump
  pg_restore -U "$DB_USER" -d "$DB_NAME" -c "$LATEST_DUMP" || {
    echo "⚠️  Failed to restore from dump"
    echo "   Continuing without dump restoration..."
  }
  
  echo "✅ Database restored from dump"
else
  echo "⚠️  No dump file found: $LATEST_DUMP"
  echo "💡 Database will be empty."
  echo "💡 To populate with data:"
  echo "   1. Generate dump: npm run generate-dump:$ENV"
  echo "   2. Or run seed: npm run seed:$ENV"
fi

echo "✅ Database initialization complete"

