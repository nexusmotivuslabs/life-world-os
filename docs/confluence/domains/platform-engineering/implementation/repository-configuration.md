# Repository Configuration

**Date**: 2025-01-15  
**Repository**: motivus_labs/life-world-os  
**Maintained By**: Atlas (DevOps Engineer)

---

## Repository Information

- **Organization**: motivus_labs
- **Repository**: life-world-os
- **URL**: `https://github.com/motivus_labs/life-world-os`
- **SSH**: `git@github.com:motivus_labs/life-world-os.git`

---

## Access Control

### Repository Access

All development work should be done under the `motivus_labs` GitHub account.

### User Setup

See [Git User Setup Guide](./git-user-setup.md) for:
- Configuring git user
- SSH key setup
- Authentication
- Team onboarding

---

## Branch Protection Rules

### Main Branch

- ✅ Require pull request reviews (1 approval minimum)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Restrict who can push (motivus_labs admins only)
- ✅ Require linear history

### Staging Branch

- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ⚠️ Allow force push (for hotfixes, admin only)

### Feature Branches

- ❌ No restrictions
- ✅ Auto-delete after merge

---

## CI/CD Integration

### GitHub Actions (Planned)

Workflows will be configured to:
- Run on push to `staging` and `main`
- Deploy to staging on `staging` branch
- Deploy to production on `main` branch (with approval)
- Run tests before deployment

---

## Repository Settings

### General

- **Visibility**: Private (or Public based on decision)
- **Default Branch**: `main`
- **Description**: Life World Operating System - A gamified life operating system

### Features

- ✅ Issues
- ✅ Projects
- ✅ Wiki (optional)
- ✅ Discussions (optional)

---

## Team Members

### Required Access

- **Atlas (DevOps Engineer)**: Admin access
- **Development Team**: Write access
- **Reviewers**: Read access (if applicable)

### Adding Team Members

1. Go to repository Settings → Collaborators
2. Add user by username or email
3. Assign appropriate role:
   - **Admin**: Full access
   - **Write**: Can push, create branches
   - **Read**: View only

---

## Quick Setup

### For New Team Members

```bash
# 1. Clone repository
git clone git@github.com:motivus_labs/life-world-os.git
cd life-world-os

# 2. Setup git user
npm run git:setup
# or
./scripts/setup-git-user.sh

# 3. Verify
git config user.name
git config user.email
git remote -v
```

---

## References

- [Git User Setup](./git-user-setup.md)
- [GitLab Flow Guide](./gitlab-flow-guide.md)
- [GitLab Flow Best Practices](./gitlab-flow-best-practices.md)

---

**Last Updated**: 2025-01-15


