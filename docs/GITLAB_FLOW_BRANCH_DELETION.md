# GitLab Flow - Branch Deletion Policy

**Last Updated**: 2025-12-28  
**Strategy**: GitLab Flow (Environment-Based)  
**Status**: ✅ Documented

---

## Branch Deletion Policy

### ✅ Branches That Get Deleted

#### Feature Branches
- **When**: After merging to `staging`
- **Why**: Feature work is complete and integrated
- **Command**: `git branch -d feature/branch-name`
- **Example**:
  ```bash
  git checkout staging
  git merge --no-ff feature/new-feature
  git branch -d feature/new-feature  # Delete after merge
  ```

#### Hotfix Branches
- **When**: After merging to both `main` and `staging`
- **Why**: Hotfix is complete and deployed
- **Command**: `git branch -d hotfix/branch-name`
- **Example**:
  ```bash
  git checkout main
  git merge --no-ff hotfix/critical-fix
  git checkout staging
  git merge --no-ff hotfix/critical-fix
  git branch -d hotfix/critical-fix  # Delete after merge
  ```

#### Release Branches (if used)
- **When**: After merging to `main` and tagging
- **Why**: Release is complete
- **Command**: `git branch -d release/branch-name`

---

### ❌ Branches That Stay

#### Main Branch
- **Never deleted** - Production branch
- **Purpose**: Represents production code

#### Staging Branch
- **Never deleted** - Staging environment branch
- **Purpose**: Pre-production testing

#### Long-Lived Feature Branches
- **May keep** if actively being developed
- **Delete** once merged and no longer needed

---

## Branch Lifecycle

### Feature Branch Lifecycle
```
1. Create: git checkout -b feature/new-feature staging
2. Develop: Make commits
3. Merge: git merge --no-ff feature/new-feature (to staging)
4. Delete: git branch -d feature/new-feature ✅
```

### Hotfix Branch Lifecycle
```
1. Create: git checkout -b hotfix/critical-fix main
2. Fix: Make commits
3. Merge to main: git merge --no-ff hotfix/critical-fix
4. Merge to staging: git merge --no-ff hotfix/critical-fix
5. Delete: git branch -d hotfix/critical-fix ✅
```

---

## Automatic Deletion

### GitHub/GitLab Settings
- ✅ **Auto-delete merged branches**: Enable in repository settings
- ✅ **Protect main/staging**: Prevent deletion of protected branches

### Manual Deletion
```bash
# Delete merged branch (safe)
git branch -d branch-name

# Force delete (if not merged)
git branch -D branch-name

# Delete remote branch
git push origin --delete branch-name
```

---

## Current Branch Status

### Permanent Branches
- ✅ `main` - Production (never delete)
- ✅ `staging` - Staging (never delete)

### Active Branches
- ✅ `integrate-ci-cd` - CI/CD integration work

### Old Branches (Can Delete)
- ⚠️ `release/v1.1.0-pre-release` - Old release branch (can delete)

---

## Cleanup Commands

### Delete Old Release Branch
```bash
# Check if merged
git branch --merged main

# Delete if merged
git branch -d release/v1.1.0-pre-release

# Or force delete
git branch -D release/v1.1.0-pre-release
```

### Delete Remote Branches
```bash
# Delete remote branch
git push origin --delete branch-name

# Prune remote tracking branches
git remote prune origin
```

---

## Best Practices

1. ✅ **Delete feature branches** after merging to staging
2. ✅ **Delete hotfix branches** after merging to main and staging
3. ✅ **Keep main and staging** permanently
4. ✅ **Clean up old branches** periodically
5. ✅ **Use descriptive names** for branches
6. ✅ **Enable auto-delete** in repository settings

---

## Verification

### Check Merged Branches
```bash
# Branches merged into main
git branch --merged main

# Branches merged into staging
git branch --merged staging
```

### Check Unmerged Branches
```bash
# Branches not merged into main
git branch --no-merged main

# Branches not merged into staging
git branch --no-merged staging
```

---

## Summary

| Branch Type | Delete After Merge? | When |
|------------|---------------------|------|
| `main` | ❌ Never | Production branch |
| `staging` | ❌ Never | Staging branch |
| `feature/*` | ✅ Yes | After merge to staging |
| `hotfix/*` | ✅ Yes | After merge to main + staging |
| `release/*` | ✅ Yes | After merge to main + tag |

---

**Maintained By**: Platform Engineering

