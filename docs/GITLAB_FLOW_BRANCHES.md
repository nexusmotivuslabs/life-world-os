# GitLab Flow Branch Structure

**Last Updated**: 2025-01-15  
**Strategy**: GitLab Flow (Environment-Based)  
**Status**: ✅ Configured

---

## Branch Structure

```
main (production)
  └── staging (staging environment)
      └── feature/* (feature branches)
      └── hotfix/* (hotfix branches)
```

---

## Branch Definitions

### **main** (Production)
- **Purpose**: Production-ready code
- **Protection**: Should be protected, only merged from `staging`
- **Tags**: Production releases tagged here (e.g., `v1.1.0`)
- **Status**: ✅ Exists

### **staging** (Staging Environment)
- **Purpose**: Staging environment code for testing
- **Source**: Created from `main`
- **Merges**: Feature branches merge here first
- **Deployment**: Deploys to staging environment
- **Status**: ✅ Created

### **feature/** (Features)
- **Purpose**: New features and enhancements
- **Naming**: `feature/feature-name` (e.g., `feature/user-authentication`)
- **Source**: Created from `main` or `staging`
- **Merge**: Merged to `staging` when complete
- **Status**: Created as needed

### **hotfix/** (Hotfixes)
- **Purpose**: Urgent production fixes
- **Naming**: `hotfix/issue-description` (e.g., `hotfix/security-patch`)
- **Source**: Created from `main`
- **Merge**: Merged to both `main` and `staging`
- **Tags**: Hotfix tag created on `main` after merge
- **Status**: Created as needed

---

## Workflow

### Feature Development
```
main/staging → feature/new-feature → staging → main
```

### Release Process
```
staging → main (with tag)
```

### Hotfix
```
main → hotfix/critical-bug → main + staging
```

---

## Current Branch Status

### Existing Branches
- ✅ `main` - Production branch
- ✅ `staging` - Staging branch (just created)
- ✅ `release/v1.1.0-pre-release` - Current release branch

---

## Branch Creation Commands

### Create Feature Branch
```bash
git checkout staging
git pull origin staging
git checkout -b feature/feature-name
```

### Create Hotfix Branch
```bash
git checkout main
git pull origin main
git checkout -b hotfix/issue-description
```

---

## Merge Workflows

### Feature → Staging
```bash
git checkout staging
git merge --no-ff feature/feature-name
git branch -d feature/feature-name
git push origin staging
```

### Staging → Main (Release)
```bash
git checkout main
git merge --no-ff staging
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin main --tags
```

### Hotfix → Main + Staging
```bash
# Merge to main
git checkout main
git merge --no-ff hotfix/issue-description
git tag -a v1.1.1 -m "Hotfix: issue-description"
git push origin main --tags

# Merge to staging
git checkout staging
git merge --no-ff hotfix/issue-description
git push origin staging
```

---

## Integration with SonarQube

### Code Quality Checks
- Run SonarQube analysis before merging to `staging`
- Fix quality issues before production release
- Monitor code quality trends

### Quality Gates
- Enforce quality gates on `staging` merges
- Require passing quality gate for `main` releases

---

**Maintained By**: Platform Engineering

