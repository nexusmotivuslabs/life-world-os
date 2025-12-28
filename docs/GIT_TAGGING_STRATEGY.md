# Git Tagging Strategy for GitLab Flow

**Last Updated**: 2025-01-15  
**Workflow**: GitLab Flow (Environment-Based)  
**Version Format**: Semantic Versioning (v1.1.0)

---

## Overview

This document defines the tagging strategy for Life World OS using GitLab Flow. Tags are the source of truth for production deployments.

---

## Tag Format

### Semantic Versioning

All release tags follow semantic versioning:
- **Format**: `v<major>.<minor>.<patch>`
- **Examples**: `v1.0.0`, `v1.1.0`, `v1.2.3`, `v2.0.0`

### Version Components

- **Major** (v1.0.0 → v2.0.0): Breaking changes, major features
- **Minor** (v1.0.0 → v1.1.0): New features, backward compatible
- **Patch** (v1.0.0 → v1.0.1): Bug fixes, backward compatible

---

## Tagging Workflow

### 1. Development → Staging

**No tags created** - Staging uses commit hashes:
- Format: `staging-<commit-hash>`
- Example: `staging-a1b2c3d`
- Source: Latest commit on `staging` branch

### 2. Staging → Production

**Tags created on main** after merging staging:

```bash
# 1. Merge staging to main
git checkout main
git pull origin main
git merge staging

# 2. Create release tag
git tag -a v1.1.0 -m "Release v1.1.0: Description of changes"

# 3. Push main and tags
git push origin main
git push origin v1.1.0
```

### 3. Hotfixes

**Tags created immediately** on main:

```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-bug

# 2. Fix and commit
git commit -m "fix: critical bug description"

# 3. Merge to main and staging
git checkout main
git merge hotfix/critical-bug
git checkout staging
git merge hotfix/critical-bug

# 4. Tag on main (patch version bump)
git checkout main
git tag -a v1.1.1 -m "Hotfix v1.1.1: critical bug fix"

# 5. Push
git push origin main
git push origin staging
git push origin v1.1.1
```

---

## Tag Types

### Release Tags (Production)

- **Format**: `v<major>.<minor>.<patch>`
- **Location**: `main` branch only
- **When**: After merging `staging` → `main`
- **Purpose**: Production deployments

**Examples**:
- `v1.0.0` - Initial release
- `v1.1.0` - Phase 1 observability release
- `v1.2.0` - New features
- `v2.0.0` - Major version with breaking changes

### Pre-Release Tags (Optional)

- **Format**: `v<major>.<minor>.<patch>-rc.<number>`
- **Location**: `staging` branch
- **When**: Before production release
- **Purpose**: Release candidates for testing

**Examples**:
- `v1.1.0-rc.1` - Release candidate 1
- `v1.1.0-rc.2` - Release candidate 2

### Development Tags (Not Recommended)

- **Format**: `dev-<description>-<date>`
- **Location**: Feature branches
- **When**: For internal milestones
- **Purpose**: Development tracking only

**Note**: Development tags are not used for deployments.

---

## Tagging Commands

### Create Release Tag

```bash
# Annotated tag (recommended)
git tag -a v1.1.0 -m "Release v1.1.0: Description"

# Lightweight tag (not recommended for releases)
git tag v1.1.0
```

### List Tags

```bash
# All tags
git tag -l

# Sorted by version
git tag -l | sort -V

# Filter by pattern
git tag -l "v1.*"
```

### View Tag

```bash
# Show tag details
git show v1.1.0

# Show tag message only
git tag -l -n9 v1.1.0
```

### Push Tags

```bash
# Push specific tag
git push origin v1.1.0

# Push all tags
git push origin --tags

# Push annotated tags only
git push origin --follow-tags
```

### Delete Tag

```bash
# Delete local tag
git tag -d v1.1.0

# Delete remote tag
git push origin --delete v1.1.0
```

---

## Version Resolution

### Production

1. **Check for git tag** on current commit
2. **If tag exists**: Use tag (e.g., `v1.1.0`)
3. **If no tag**: Use `main-<commit-hash>`

### Staging

1. **Check for git tag** on current commit
2. **If tag exists**: Use tag (e.g., `v1.1.0`)
3. **If no tag**: Use `staging-<commit-hash>`

### Development

1. **Check for git tag** on current commit
2. **If tag exists**: Use tag
3. **If no tag**: Use `<branch>-<commit-hash>`

---

## Tag Message Guidelines

### Format

```
Release v<version>: <short description>

<detailed description>

- Feature 1
- Feature 2
- Bug fix 1
```

### Examples

```bash
git tag -a v1.1.0 -m "Release v1.1.0: Phase 1 Observability

Complete Phase 1 implementation:
- Prometheus + Grafana monitoring
- Portainer container management
- Local build with dev environment support
- Development environment improvements"
```

```bash
git tag -a v1.0.1 -m "Hotfix v1.0.1: Critical security patch

- Fix authentication bypass vulnerability
- Update dependencies with security patches"
```

---

## Release Process

### Standard Release

1. **Develop on feature branches**
   ```bash
   git checkout -b feature/new-feature
   # ... develop ...
   git push origin feature/new-feature
   ```

2. **Merge to staging**
   ```bash
   # Create PR: feature/new-feature → staging
   # After merge, staging auto-deploys
   ```

3. **Test in staging**
   - Verify functionality
   - Check version: `curl http://staging-url/health | jq .version`

4. **Merge to main**
   ```bash
   # Create PR: staging → main
   # After merge, create tag
   ```

5. **Tag release**
   ```bash
   git checkout main
   git pull origin main
   git tag -a v1.1.0 -m "Release v1.1.0: Description"
   git push origin main
   git push origin v1.1.0
   ```

6. **Deploy to production**
   ```bash
   npm run prod:deploy
   ```

### Hotfix Release

1. **Create hotfix branch from main**
   ```bash
   git checkout main
   git checkout -b hotfix/critical-bug
   ```

2. **Fix and commit**
   ```bash
   # ... fix ...
   git commit -m "fix: critical bug description"
   ```

3. **Merge to main and staging**
   ```bash
   git checkout main
   git merge hotfix/critical-bug
   git checkout staging
   git merge hotfix/critical-bug
   ```

4. **Tag patch version**
   ```bash
   git checkout main
   git tag -a v1.1.1 -m "Hotfix v1.1.1: critical bug fix"
   git push origin main
   git push origin staging
   git push origin v1.1.1
   ```

5. **Deploy immediately**
   ```bash
   npm run prod:deploy
   ```

---

## Version Bumping Rules

### When to Bump Major (v1.0.0 → v2.0.0)

- Breaking API changes
- Major architecture changes
- Incompatible database migrations
- Significant feature removals

### When to Bump Minor (v1.0.0 → v1.1.0)

- New features (backward compatible)
- New API endpoints
- New infrastructure components
- Significant improvements

### When to Bump Patch (v1.0.0 → v1.0.1)

- Bug fixes
- Security patches
- Performance improvements
- Documentation updates
- Dependency updates

---

## Best Practices

### ✅ Do

- Use semantic versioning
- Create annotated tags (with `-a`)
- Write descriptive tag messages
- Tag on `main` branch only
- Push tags immediately after creation
- Use tags for production deployments
- Document breaking changes in tag message

### ❌ Don't

- Tag on feature branches
- Use lightweight tags for releases
- Delete tags that have been deployed
- Tag without testing in staging
- Skip version numbers
- Use non-semantic versioning

---

## Current Tags

```bash
# List all tags
git tag -l | sort -V

# Show latest tag
git describe --tags --abbrev=0

# Show commits since last tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

---

## Related Documentation

- [Git Workflow](./GIT_WORKFLOW.md)
- [GitLab Flow Guide](./confluence/domains/platform-engineering/implementation/gitlab-flow-guide.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Version Scripts](../scripts/get-version.js)

---

**Maintained By**: Atlas (DevOps Engineer)  
**Review Cycle**: Quarterly

