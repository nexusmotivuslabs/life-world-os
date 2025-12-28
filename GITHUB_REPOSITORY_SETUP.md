# GitHub Repository Setup

**Status**: ⚠️ Repository not found on GitHub  
**Remote Configured**: `git@github.com:nexusmotivuslabs/life-world-os.git`  
**Action Required**: Create repository on GitHub

---

## Issue

The remote is configured, but the repository doesn't exist on GitHub yet:
```
ERROR: Repository not found.
fatal: Could not read from remote repository.
```

---

## Solution: Create Repository on GitHub

### Option 1: Create via GitHub Web Interface (Recommended)

1. **Go to GitHub**: https://github.com/new
2. **Repository Settings**:
   - **Owner**: `nexusmotivuslabs` (or your organization)
   - **Repository name**: `life-world-os`
   - **Description**: "Life World Operating System - A gamified life operating system"
   - **Visibility**: Private (recommended) or Public
   - **⚠️ IMPORTANT**: 
     - ❌ **Don't** initialize with README
     - ❌ **Don't** add .gitignore
     - ❌ **Don't** add license
     - (We already have these files)

3. **Click "Create repository"**

4. **After creation, push**:
   ```bash
   git push -u origin main
   git push -u origin staging
   git push origin --tags
   ```

### Option 2: Create via GitHub CLI

```bash
# Install GitHub CLI if not installed
brew install gh

# Authenticate
gh auth login

# Create repository
gh repo create nexusmotivuslabs/life-world-os \
  --private \
  --description "Life World Operating System - A gamified life operating system" \
  --clone=false

# Then push
git push -u origin main
git push -u origin staging
git push origin --tags
```

---

## Alternative: Use Different Repository Name

If you want to use a different repository name or organization:

### 1. Update Remote URL
```bash
# Check current remote
git remote -v

# Update to new repository
git remote set-url origin git@github.com:YOUR_ORG/YOUR_REPO.git

# Or use HTTPS
git remote set-url origin https://github.com/YOUR_ORG/YOUR_REPO.git
```

### 2. Create Repository on GitHub
Follow Option 1 above with your chosen name/organization.

### 3. Push
```bash
git push -u origin main
git push -u origin staging
git push origin --tags
```

---

## After Repository is Created

### Push All Branches and Tags

```bash
# Push main branch
git checkout main
git push -u origin main

# Push staging branch
git checkout staging
git push -u origin staging

# Push all tags
git push origin --tags

# Or push everything at once
npm run git:push:all
```

### Verify Push

```bash
# Check branches on remote
git ls-remote --heads origin

# Check tags on remote
git ls-remote --tags origin

# Or visit GitHub
# https://github.com/nexusmotivuslabs/life-world-os
```

---

## Current Status

### Local Repository
- ✅ All branches ready: `main`, `staging`
- ✅ All tags ready: `v1.1.0`, `v1.1.1`, `v1.1.2`
- ✅ Remote configured: `git@github.com:nexusmotivuslabs/life-world-os.git`

### GitHub Repository
- ⚠️ **Not created yet** - Needs to be created on GitHub

---

## Quick Commands After Repository Creation

```bash
# Push everything
npm run git:push:all

# Or manually:
git push -u origin main
git push -u origin staging
git push origin --tags
```

---

## Troubleshooting

### "Repository not found"
- **Cause**: Repository doesn't exist on GitHub
- **Solution**: Create repository on GitHub first (see above)

### "Permission denied"
- **Cause**: SSH key not authorized or wrong account
- **Solution**: 
  ```bash
  # Test SSH connection
  ssh -T git@github.com
  
  # Check SSH key is loaded
  ssh-add -l
  
  # Add key if needed
  ssh-add ~/.ssh/YOUR_KEY
  ```

### "Remote URL mismatch"
- **Cause**: Remote points to wrong repository
- **Solution**:
  ```bash
  # Check current remote
  git remote -v
  
  # Update if needed
  git remote set-url origin git@github.com:nexusmotivuslabs/life-world-os.git
  ```

---

## Next Steps

1. ✅ **Create repository on GitHub** (see Option 1 above)
2. ✅ **Push all branches**: `git push -u origin main && git push -u origin staging`
3. ✅ **Push all tags**: `git push origin --tags`
4. ✅ **Verify on GitHub**: Visit https://github.com/nexusmotivuslabs/life-world-os

---

**Action Required**: Create the repository on GitHub, then push!

