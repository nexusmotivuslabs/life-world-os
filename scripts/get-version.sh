#!/bin/bash
# Get version information for deployments
# Returns: commit hash, branch, tag, timestamp

set -e

ENVIRONMENT=${1:-dev}
BRANCH=${2:-}

# Get current branch if not provided
if [ -z "$BRANCH" ]; then
    BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
fi

# Get commit hash (short)
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Get full commit hash
FULL_COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "unknown")

# Get commit timestamp
COMMIT_TIMESTAMP=$(git log -1 --format=%ct 2>/dev/null || echo "$(date +%s)")

# Get commit message (first line, sanitized)
COMMIT_MESSAGE=$(git log -1 --pretty=format:"%s" 2>/dev/null | head -1 | sed 's/[^a-zA-Z0-9 ]//g' | cut -c1-50 || echo "unknown")

# Get latest tag (if any)
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

# Generate version tag based on environment
case "$ENVIRONMENT" in
    prod)
        # Prod: Use latest tag or commit hash from main
        if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
            if [ -n "$LATEST_TAG" ]; then
                VERSION_TAG="$LATEST_TAG"
            else
                VERSION_TAG="main-${COMMIT_HASH}"
            fi
        else
            VERSION_TAG="main-${COMMIT_HASH}"
        fi
        ;;
    staging)
        # Staging: Use staging branch commit hash
        if [ "$BRANCH" = "staging" ]; then
            VERSION_TAG="staging-${COMMIT_HASH}"
        else
            VERSION_TAG="staging-${COMMIT_HASH}"
        fi
        ;;
    dev)
        # Dev: Use branch and commit hash
        VERSION_TAG="${BRANCH}-${COMMIT_HASH}"
        ;;
    *)
        VERSION_TAG="${ENVIRONMENT}-${COMMIT_HASH}"
        ;;
esac

# Build timestamp
BUILD_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Output as JSON
cat <<EOF
{
  "version": "$VERSION_TAG",
  "commit": "$COMMIT_HASH",
  "fullCommit": "$FULL_COMMIT_HASH",
  "branch": "$BRANCH",
  "tag": "$LATEST_TAG",
  "commitMessage": "$COMMIT_MESSAGE",
  "commitTimestamp": $COMMIT_TIMESTAMP,
  "buildTimestamp": "$BUILD_TIMESTAMP",
  "environment": "$ENVIRONMENT"
}
EOF


