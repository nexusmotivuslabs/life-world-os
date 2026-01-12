# GitHub Push Guide

**Status**: Repository not yet pushed to GitHub  
**Action Required**: Configure remote and push

---

## Quick Setup

### Option 1: Interactive Script (Recommended)
```bash
npm run git:push
```

This script will:
1. Check for existing remote
2. Prompt for GitHub repository URL
3. Push all branches (main, staging)
4. Push all tags (v1.1.0, v1.1.1, v1.1.2)

### Option 2: Manual Setup

#### 1. Add Remote
```bash
# If repository doesn't exist on GitHub, create it first
# Then add remote:
git remote add origin git@github.com:username/life-world-os.git

# Or using HTTPS:
git remote add origin https://github.com/username/life-world-os.git
```

#### 2. Push All Branches
```bash
# Push main branch
git checkout main
git push -u origin main

# Push staging branch
git checkout staging
git push -u origin staging

# Push all branches at once
git push origin --all
```

#### 3. Push All Tags
```bash
git push origin --tags
```

#### 4. Push Everything
```bash
npm run git:push:all
```

---

## Repository Setup

### If Repository Doesn't Exist

1. **Create on GitHub**:
   - Go to https://github.com/new
   - Repository name: `life-world-os`
   - Description: "Life World Operating System - A gamified life operating system"
   - Choose: Private or Public
   - **Don't** initialize with README, .gitignore, or license (we already have these)

2. **Add Remote**:
   ```bash
   git remote add origin git@github.com:YOUR_USERNAME/life-world-os.git
   ```

3. **Push**:
   ```bash
   npm run git:push
   ```

---

## Current Branches to Push

- ✅ `main` - Production branch (with release tags)
- ✅ `staging` - Staging branch
- ⚠️ `release/v1.1.0-pre-release` - Old release branch (optional)

---

## Current Tags to Push

- `v1.1.0` - Initial release
- `v1.1.1` - Bug fixes release
- `v1.1.2` - Observability integration release

---

## SSH vs HTTPS

### SSH (Recommended)
```bash
git remote add origin git@github.com:username/life-world-os.git
```

**Requires**: SSH key configured in GitHub

### HTTPS
```bash
git remote add origin https://github.com/username/life-world-os.git
```

**Requires**: Personal Access Token (not password)

---

## Verify Push

After pushing, verify on GitHub:

1. Check branches: https://github.com/username/life-world-os/branches
2. Check tags: https://github.com/username/life-world-os/tags
3. Check commits: https://github.com/username/life-world-os/commits/main

---

## Troubleshooting

### "Repository not found"
- Verify repository exists on GitHub
- Check repository name and username
- Verify SSH key or token has access

### "Permission denied"
- Check SSH key: `ssh -T git@github.com`
- Verify GitHub account has access
- Use HTTPS with Personal Access Token if SSH fails

### "Updates were rejected"
- Pull first: `git pull origin main --rebase`
- Or force push (if you're sure): `git push -f origin main` (⚠️ dangerous)

---

## Next Steps After Push

1. ✅ Set up branch protection rules on GitHub
2. ✅ Configure GitHub Actions (if using CI/CD)
3. ✅ Add repository description and topics
4. ✅ Set up GitHub Pages (if needed)
5. ✅ Invite collaborators

---

**Run**: `npm run git:push` to get started!

