# GitLab Flow Implementation Guide

**Status**: ✅ Implemented  
**Date**: 2025-01-15  
**Decision**: GitLab Flow (from GIT_FLOW_STRATEGY.md)  
**Repository**: motivus_labs/life-world-os  
**Maintained By**: Atlas (DevOps Engineer)

---

## Overview

GitLab Flow is our chosen branching strategy for Life World OS. It provides a simple, environment-focused approach that balances structure with flexibility.

---

## Branch Structure

```
main (production)
  └── staging (staging environment)
      └── feature/* (feature branches)
```

### Branch Definitions

- **`main`**: Production-ready code. Only merged from `staging` after testing.
- **`staging`**: Staging environment code. Feature branches merge here first.
- **`feature/*`**: Individual feature development branches.

---

## Workflow

### 1. Starting a New Feature

```bash
# Start from main (or staging if you need latest changes)
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Or from staging
git checkout staging
git pull origin staging
git checkout -b feature/your-feature-name
```

**Branch Naming**:
- `feature/navigation-refactor`
- `feature/add-blog-modal`
- `feature/fix-auth-bug`

### 2. Developing a Feature

```bash
# Make commits
git add .
git commit -m "feat: add blog dropdown component"

# Push to remote
git push origin feature/your-feature-name
```

**Commit Message Format**:
- `feat: add new feature`
- `fix: fix bug description`
- `docs: update documentation`
- `refactor: refactor code`
- `test: add tests`

### 3. Merging to Staging

```bash
# Ensure feature branch is up to date
git checkout feature/your-feature-name
git pull origin staging

# Merge to staging
git checkout staging
git pull origin staging
git merge feature/your-feature-name

# Push to staging
git push origin staging
```

**Or via Pull Request** (Recommended):
1. Create PR from `feature/*` → `staging`
2. Review and approve
3. Merge PR
4. Delete feature branch

### 4. Deploying to Staging

```bash
# Staging auto-deploys from staging branch
# Or manually:
npm run staging:deploy
```

### 5. Promoting to Production

```bash
# After testing in staging, merge to main
git checkout main
git pull origin main
git merge staging

# Tag the release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags

# Deploy to production
npm run prod:deploy
```

---

## Branch Protection Rules

### Main Branch

**Protection**:
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require linear history (no merge commits)
- ✅ Restrict who can push (admins only)

**Merge Requirements**:
- At least 1 approval
- All CI/CD checks must pass
- No merge conflicts

### Staging Branch

**Protection**:
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ⚠️ Allow force push (for hotfixes)

**Merge Requirements**:
- At least 1 approval (can be self-approval for small changes)
- CI/CD checks must pass

### Feature Branches

**Protection**:
- ❌ No restrictions
- ✅ Auto-delete after merge

---

## Version Tagging

### Tag Format

- **Production**: `v1.0.0`, `v1.0.1`, `v1.1.0`
- **Staging**: `staging-<commit-hash>`
- **Development**: `<branch>-<commit-hash>`

### Creating Tags

```bash
# Production release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags

# Staging (automatic via deployment script)
# Uses: staging-<commit-hash>
```

See [DEPLOYMENT_VERSIONING.md](../../../../DEPLOYMENT_VERSIONING.md) for details.

---

## Hotfixes

### Process

1. **Create hotfix branch from main**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-bug-fix
   ```

2. **Fix the issue**:
   ```bash
   git add .
   git commit -m "fix: critical bug description"
   ```

3. **Merge to main and staging**:
   ```bash
   # Merge to main
   git checkout main
   git merge hotfix/critical-bug-fix
   git tag -a v1.0.1 -m "Hotfix: critical bug fix"
   git push origin main --tags
   
   # Merge to staging
   git checkout staging
   git merge hotfix/critical-bug-fix
   git push origin staging
   ```

4. **Deploy**:
   ```bash
   npm run prod:deploy  # Deploy hotfix to production
   npm run staging:deploy  # Deploy hotfix to staging
   ```

---

## Best Practices

### 1. Keep Branches Small

- ✅ One feature per branch
- ✅ Small, focused commits
- ✅ Regular merges from staging/main

### 2. Regular Syncing

```bash
# Sync feature branch with staging regularly
git checkout feature/your-feature
git pull origin staging
git rebase staging  # Or merge
```

### 3. Clean Up

```bash
# Delete merged branches
git branch -d feature/merged-feature
git push origin --delete feature/merged-feature
```

### 4. Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

**Examples**:
```
feat(blog): add blog dropdown to header
fix(auth): resolve token expiration issue
docs(gitflow): add GitLab Flow guide
```

### 5. Pull Request Best Practices

- **Clear title**: Describe what the PR does
- **Description**: Explain why and how
- **Small PRs**: Easier to review
- **Link issues**: Reference related issues
- **Screenshots**: For UI changes
- **Test coverage**: Include tests

### 6. Code Review

- **Review checklist**:
  - [ ] Code follows project standards
  - [ ] Tests pass
  - [ ] Documentation updated
  - [ ] No breaking changes (or documented)
  - [ ] Performance considered

---

## CI/CD Integration

### Staging Deployment

- **Trigger**: Push to `staging` branch
- **Action**: Deploy to staging environment
- **Version**: Auto-tagged as `staging-<commit-hash>`

### Production Deployment

- **Trigger**: Push to `main` branch (or manual)
- **Action**: Deploy to production
- **Version**: Uses git tag (e.g., `v1.0.0`)

---

## Migration from Current State

### Current State
- No formal branching strategy
- Manual deployments
- Version tagging implemented

### Migration Steps

1. **Create staging branch**:
   ```bash
   git checkout -b staging
   git push origin staging
   ```

2. **Set up branch protection** (see Branch Protection Rules)

3. **Update deployment scripts** to use branches

4. **Document workflow** (this guide)

5. **Train team** on new workflow

---

## Troubleshooting

### Merge Conflicts

```bash
# Resolve conflicts
git checkout staging
git pull origin staging
git checkout feature/your-feature
git rebase staging  # Or merge staging

# Resolve conflicts in files
# Then:
git add .
git rebase --continue  # Or git commit
```

### Accidentally Committed to Main

```bash
# Create branch from current main
git checkout main
git checkout -b feature/move-commits

# Reset main to previous commit
git checkout main
git reset --hard origin/main

# Move commits to feature branch
git checkout feature/move-commits
# Commits are now in feature branch
```

### Need to Update Staging from Main

```bash
# Merge main into staging (for hotfixes)
git checkout staging
git merge main
git push origin staging
```

---

## References

- [Git User Setup](./git-user-setup.md) - **Setup git for motivus_labs account** ⭐
- [Repository Configuration](./repository-configuration.md) - Repository settings
- [GitLab Flow Documentation](https://docs.gitlab.com/ee/topics/gitlab_flow.html)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Life World OS Git Flow Strategy](../../../../GIT_FLOW_STRATEGY.md)
- [Deployment Versioning](../../../../DEPLOYMENT_VERSIONING.md)
- [Blog: GitOps vs Git Flow](../../../../blog/systems/version-control/gitops-vs-gitflow.md)

---

## Quick Reference

### Common Commands

```bash
# Start feature
git checkout main && git pull && git checkout -b feature/name

# Sync with staging
git checkout feature/name && git pull origin staging

# Merge to staging
git checkout staging && git merge feature/name && git push

# Deploy staging
npm run staging:deploy

# Merge to main
git checkout main && git merge staging && git tag v1.0.0 && git push --tags

# Deploy production
npm run prod:deploy
```

---

**Last Updated**: 2025-01-15  
**Next Review**: 2025-04-15

