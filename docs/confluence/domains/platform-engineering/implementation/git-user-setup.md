# Git User Setup - motivus_labs

**Date**: 2025-01-15  
**Account**: motivus_labs  
**Purpose**: Configure git user for Life World OS development

---

## Overview

All development work for Life World OS should be done under the `motivus_labs` account. This ensures consistent attribution and proper access control.

---

## Initial Setup

### 1. Configure Git User (Global or Project-Specific)

**Option A: Project-Specific (Recommended)**
```bash
cd life-world-os
git config user.name "motivus_labs"
git config user.email "your-email@motivus-labs.com"  # Use your motivus_labs email
```

**Option B: Global Configuration**
```bash
git config --global user.name "motivus_labs"
git config --global user.email "your-email@motivus-labs.com"
```

### 2. Verify Configuration

```bash
git config user.name
git config user.email
```

Should show:
```
motivus_labs
your-email@motivus-labs.com
```

---

## Repository Setup

### Update Remote Repository

```bash
# Check current remote
git remote -v

# Update remote to motivus_labs repository
git remote set-url origin https://github.com/motivus_labs/life-world-os.git

# Or if using SSH
git remote set-url origin git@github.com:motivus_labs/life-world-os.git

# Verify
git remote -v
```

### Clone Repository (New Setup)

```bash
# HTTPS
git clone https://github.com/motivus_labs/life-world-os.git

# SSH (recommended)
git clone git@github.com:motivus_labs/life-world-os.git
```

---

## SSH Key Setup (Recommended)

### 1. Generate SSH Key for motivus_labs

```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "your-email@motivus-labs.com" -f ~/.ssh/motivus_labs_ed25519

# Start ssh-agent
eval "$(ssh-agent -s)"

# Add key to ssh-agent
ssh-add ~/.ssh/motivus_labs_ed25519
```

### 2. Add SSH Key to GitHub

1. Copy public key:
   ```bash
   cat ~/.ssh/motivus_labs_ed25519.pub
   ```

2. Go to GitHub: Settings → SSH and GPG keys → New SSH key
3. Paste key and save

### 3. Configure SSH Config

Add to `~/.ssh/config`:

```
Host github.com-motivus
    HostName github.com
    User git
    IdentityFile ~/.ssh/motivus_labs_ed25519
    IdentitiesOnly yes
```

Then update remote:
```bash
git remote set-url origin git@github.com-motivus:motivus_labs/life-world-os.git
```

---

## Authentication

### GitHub Personal Access Token (HTTPS)

If using HTTPS, you'll need a Personal Access Token:

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when pushing

### GitHub CLI (Alternative)

```bash
# Install GitHub CLI
brew install gh  # macOS
# or
# See: https://cli.github.com/

# Authenticate
gh auth login

# Select: GitHub.com
# Select: HTTPS
# Authenticate: Login with a web browser
```

---

## Verification

### Test Git Configuration

```bash
# Check user config
git config user.name
git config user.email

# Check remote
git remote -v

# Test connection (SSH)
ssh -T git@github.com

# Test push (create test commit)
git commit --allow-empty -m "test: verify git setup"
git push origin main  # or staging
```

---

## Multiple Accounts Setup

If you need to work with multiple GitHub accounts:

### SSH Config for Multiple Accounts

Add to `~/.ssh/config`:

```
# Personal account
Host github.com-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/personal_ed25519
    IdentitiesOnly yes

# motivus_labs account
Host github.com-motivus
    HostName github.com
    User git
    IdentityFile ~/.ssh/motivus_labs_ed25519
    IdentitiesOnly yes
```

### Project-Specific Configuration

For Life World OS, use motivus_labs:

```bash
cd life-world-os
git config user.name "motivus_labs"
git config user.email "your-email@motivus-labs.com"
git remote set-url origin git@github.com-motivus:motivus_labs/life-world-os.git
```

---

## Commit Attribution

### Verify Commits

```bash
# Check recent commits
git log --pretty=format:"%h - %an <%ae> - %s" -5

# Should show:
# abc123 - motivus_labs <your-email@motivus-labs.com> - commit message
```

### Fix Previous Commits

If you need to update author on recent commits:

```bash
# Update last commit
git commit --amend --author="motivus_labs <your-email@motivus-labs.com>" --no-edit

# Update multiple commits (interactive rebase)
git rebase -i HEAD~5
# Change "pick" to "edit" for commits to fix
# Then for each commit:
git commit --amend --author="motivus_labs <your-email@motivus-labs.com>" --no-edit
git rebase --continue
```

---

## Team Onboarding

### New Team Member Setup

1. **Get access to motivus_labs GitHub account**
   - Request access from repository owner
   - Get added to motivus_labs organization

2. **Configure git**:
   ```bash
   git config user.name "motivus_labs"
   git config user.email "your-email@motivus-labs.com"
   ```

3. **Set up SSH key** (see SSH Key Setup above)

4. **Clone repository**:
   ```bash
   git clone git@github.com:motivus_labs/life-world-os.git
   cd life-world-os
   ```

5. **Verify setup**:
   ```bash
   git config user.name
   git config user.email
   git remote -v
   ```

---

## Troubleshooting

### Authentication Issues

**Problem**: `Permission denied (publickey)`

**Solution**:
```bash
# Check SSH key is loaded
ssh-add -l

# Add key if not loaded
ssh-add ~/.ssh/motivus_labs_ed25519

# Test connection
ssh -T git@github.com
```

### Wrong User in Commits

**Problem**: Commits showing wrong user

**Solution**:
```bash
# Check current config
git config user.name
git config user.email

# Update if wrong
git config user.name "motivus_labs"
git config user.email "your-email@motivus-labs.com"
```

### Remote URL Issues

**Problem**: Can't push to repository

**Solution**:
```bash
# Check remote URL
git remote -v

# Update if needed
git remote set-url origin git@github.com:motivus_labs/life-world-os.git

# Or for SSH with config
git remote set-url origin git@github.com-motivus:motivus_labs/life-world-os.git
```

---

## Best Practices

1. **Always use motivus_labs account** for Life World OS
2. **Use project-specific config** to avoid conflicts
3. **Use SSH keys** for better security
4. **Verify before committing**:
   ```bash
   git config user.name
   git config user.email
   ```
5. **Keep SSH keys secure** - don't share private keys

---

## Quick Setup Script

Create `scripts/setup-git-user.sh`:

```bash
#!/bin/bash
# Setup git user for motivus_labs

echo "Setting up git user for motivus_labs..."

read -p "Enter your motivus_labs email: " email

git config user.name "motivus_labs"
git config user.email "$email"

echo "✅ Git user configured:"
git config user.name
git config user.email

echo ""
echo "📋 Next steps:"
echo "1. Set up SSH key (see git-user-setup.md)"
echo "2. Update remote URL if needed"
echo "3. Test with: git push origin main"
```

---

## References

- [GitHub SSH Setup](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitLab Flow Guide](./gitlab-flow-guide.md)

---

**Last Updated**: 2025-01-15  
**Maintained By**: Atlas (DevOps Engineer)


