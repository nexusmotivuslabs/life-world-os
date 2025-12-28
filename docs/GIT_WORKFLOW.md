# Git Workflow & Versioning

**Last Updated**: 2025-01-15  
**Maintained By**: Atlas (DevOps Engineer)  
**Status**: ✅ GitLab Flow Selected

---

## Git Flow Strategy

### ✅ Decision: GitLab Flow

**Selected**: GitLab Flow (Environment-Based)  
**Decision Date**: 2025-01-15  
**Rationale**: Balanced approach with clear environment separation, suitable for our deployment model

### Structure
```
main (production)
  └── staging (staging)
      └── feature/* (features)
      └── hotfix/* (hotfixes)
```

### Workflow

1. **Feature Development**
   - Create feature branch from `main`
   - Develop feature
   - Create merge request to `staging`
   - Review and merge to `staging`

2. **Staging Testing**
   - Test in staging environment
   - Fix issues if needed
   - Verify all checks pass

3. **Production Deployment**
   - Create merge request from `staging` to `main`
   - Review and merge to `main`
   - Production automatically deploys

4. **Hotfixes**
   - Create hotfix branch from `main`
   - Fix issue
   - Merge to `main` and `staging`
   - Deploy immediately

### Implementation Guides

- [GitLab Flow Guide](./confluence/domains/platform-engineering/implementation/gitlab-flow-guide.md) ⭐
- [GitLab Flow Best Practices](./confluence/domains/platform-engineering/implementation/gitlab-flow-best-practices.md) ⭐
- [Repository Configuration](./confluence/domains/platform-engineering/implementation/repository-configuration.md)
- [Git User Setup](./confluence/domains/platform-engineering/implementation/git-user-setup.md)

---

## Deployment Versioning

### Overview

All deployments are tagged with version information to track what's running in each environment.

### Version Format

#### Production
- **Format**: `main-<commit-hash>` or `<tag>` (if latest tag exists)
- **Example**: `main-a1b2c3d` or `v1.2.3`
- **Source**: Latest commit on `main` branch

#### Staging
- **Format**: `staging-<commit-hash>`
- **Example**: `staging-e4f5g6h`
- **Source**: Latest commit on `staging` branch

#### Development
- **Format**: `<branch>-<commit-hash>`
- **Example**: `feature-auth-x7y8z9a`
- **Source**: Current branch and commit

### Version Information

Each deployment includes:
- **Version**: Version tag (e.g., `staging-a1b2c3d`)
- **Commit**: Short commit hash (e.g., `a1b2c3d`)
- **Full Commit**: Full commit hash
- **Branch**: Git branch name
- **Tag**: Latest git tag (if any)
- **Commit Message**: First line of commit message
- **Commit Timestamp**: Unix timestamp of commit
- **Build Timestamp**: When the image was built

### Getting Version Information

```bash
# Get version for staging
npm run version:staging
# or
node scripts/get-version.js staging

# Get version for production
npm run version:prod
# or
node scripts/get-version.js prod

# Get version for current environment
npm run version:get
# or
node scripts/get-version.js
```

### Version in Health Endpoint

The `/health` endpoint returns version information:

```json
{
  "status": "healthy",
  "version": "staging-a1b2c3d",
  "commit": "a1b2c3d",
  "branch": "staging",
  "timestamp": 1705276800
}
```

### Docker Image Tagging

Docker images are automatically tagged with version:
- `life-world-os-backend:staging-a1b2c3d`
- `life-world-os-frontend:staging-a1b2c3d`

### Version Scripts

The `scripts/get-version.js` script:
1. Detects current git branch
2. Gets latest commit hash
3. Gets latest tag (if any)
4. Formats version string
5. Outputs JSON with all version info

### Deployment Integration

Deployment scripts automatically:
1. Get version information
2. Tag Docker images with version
3. Set environment variables in containers
4. Display version in deployment output

### Checking Deployed Version

```bash
# Staging
curl http://localhost:3002/health | jq .version

# Production
curl http://localhost:3000/health | jq .version
```

---

## Branch Protection

### Main Branch
- Requires merge request
- Requires code review
- Requires CI/CD to pass
- No direct pushes

### Staging Branch
- Requires merge request
- Requires CI/CD to pass
- Allows direct pushes for hotfixes

### Feature Branches
- No restrictions
- Can be force-pushed
- Deleted after merge

---

## Commit Message Guidelines

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(auth): add OAuth2 authentication

Implement OAuth2 flow with Google and GitHub providers.
Add token refresh mechanism.

Closes #123
```

```
fix(api): resolve database connection timeout

Increase connection pool size and add retry logic.

Fixes #456
```

---

## Related Documents

- [GitLab Flow Guide](./confluence/domains/platform-engineering/implementation/gitlab-flow-guide.md)
- [GitLab Flow Best Practices](./confluence/domains/platform-engineering/implementation/gitlab-flow-best-practices.md)
- [GitOps vs Git Flow](../blog/systems/version-control/gitops-vs-gitflow.md)

---

**Maintained By**: Atlas (DevOps Engineer)  
**Review Cycle**: Quarterly


