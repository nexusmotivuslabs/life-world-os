# GitLab Flow Best Practices

**Status**: ✅ Active  
**Date**: 2025-01-15  
**Applies To**: All developers  
**Maintained By**: Atlas (DevOps Engineer)

---

## Core Principles

1. **Environment-Focused**: Branches map to environments
2. **Simple Structure**: Minimal branches, maximum clarity
3. **Continuous Integration**: Regular merges and deployments
4. **Version Control**: All changes tracked in Git

---

## Branch Management

### Branch Naming Conventions

**Feature Branches**:
```
feature/<description>
feature/navigation-refactor
feature/add-blog-modal
feature/fix-auth-bug
```

**Hotfix Branches**:
```
hotfix/<description>
hotfix/critical-security-patch
hotfix/fix-payment-bug
```

**Guidelines**:
- ✅ Use kebab-case (lowercase with hyphens)
- ✅ Be descriptive but concise
- ✅ Include issue number if applicable: `feature/123-add-blog`
- ❌ Avoid generic names: `feature/update`, `feature/fix`

### Branch Lifecycle

1. **Create**: From `main` or `staging`
2. **Develop**: Make commits, push regularly
3. **Sync**: Regularly pull from `staging`/`main`
4. **Merge**: Via Pull Request to `staging`
5. **Test**: In staging environment
6. **Promote**: Merge `staging` → `main`
7. **Delete**: After merge (automatic or manual)

---

## Commit Messages

### Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(blog): add blog dropdown` |
| `fix` | Bug fix | `fix(auth): resolve token expiration` |
| `docs` | Documentation | `docs(gitflow): add GitLab Flow guide` |
| `style` | Formatting | `style: format code with prettier` |
| `refactor` | Code refactoring | `refactor(nav): simplify navigation logic` |
| `test` | Tests | `test(api): add health endpoint tests` |
| `chore` | Maintenance | `chore: update dependencies` |
| `perf` | Performance | `perf(db): optimize query performance` |
| `ci` | CI/CD | `ci: add staging deployment workflow` |

### Scope (Optional)

- Component: `feat(blog): add modal`
- Domain: `fix(money): resolve calculation error`
- System: `refactor(auth): simplify token handling`

### Subject

- ✅ Imperative mood: "add", "fix", "update"
- ✅ 50 characters or less
- ✅ No period at end
- ❌ Avoid: "added", "fixes", "updates"

### Body (Optional)

- Explain **what** and **why** (not **how**)
- Wrap at 72 characters
- Use present tense

### Footer (Optional)

- Reference issues: `Closes #123`
- Breaking changes: `BREAKING CHANGE: description`

### Examples

**Good**:
```
feat(blog): add blog dropdown to header

Adds a dropdown menu in the header that lists all blog posts.
Clicking a post opens it in a modal with markdown rendering.

Closes #456
```

```
fix(auth): resolve token expiration issue

Tokens were expiring prematurely due to incorrect timezone handling.
Now uses UTC consistently for all token operations.

Fixes #789
```

**Bad**:
```
update blog
```
```
Fixed the bug
```
```
feat: added blog dropdown (it was requested by the team and we needed it for the v1 release)
```

---

## Pull Request Best Practices

### PR Title

- ✅ Clear and descriptive
- ✅ Include type and scope: `feat(blog): Add blog dropdown`
- ✅ Reference issue: `fix(auth): Resolve token expiration (#789)`

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Changes
- Change 1
- Change 2
- Change 3

## Related Issues
Closes #123
Related to #456

## Testing
- [ ] Tested locally
- [ ] Tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### PR Size

- ✅ **Small PRs**: 1-3 files, focused changes
- ⚠️ **Medium PRs**: 4-10 files, related changes
- ❌ **Large PRs**: 10+ files, split into multiple PRs

**Guidelines**:
- One feature per PR
- One bug fix per PR
- Related changes can be grouped

### Review Process

**For Author**:
1. Self-review before requesting review
2. Ensure tests pass
3. Update documentation
4. Request review from team

**For Reviewer**:
1. Review within 24 hours
2. Be constructive and specific
3. Approve or request changes
4. Explain reasoning

**Review Checklist**:
- [ ] Code follows project standards
- [ ] Logic is correct
- [ ] Tests are adequate
- [ ] Documentation is updated
- [ ] No security issues
- [ ] Performance considered
- [ ] No breaking changes

---

## Merging Strategy

### Merge to Staging

1. **Create PR**: `feature/*` → `staging`
2. **Review**: At least 1 approval
3. **Merge**: Use "Squash and merge" or "Merge commit"
4. **Delete branch**: Automatic or manual
5. **Deploy**: Auto-deploy to staging

### Merge to Main

1. **Test in staging**: Ensure everything works
2. **Create PR**: `staging` → `main` (optional, can merge directly)
3. **Tag release**: `git tag -a v1.0.0 -m "Release v1.0.0"`
4. **Merge**: Use "Merge commit" to preserve history
5. **Deploy**: Deploy to production

---

## Syncing Branches

### Keep Feature Branch Updated

```bash
# Option 1: Rebase (cleaner history)
git checkout feature/your-feature
git fetch origin
git rebase origin/staging

# Option 2: Merge (preserves history)
git checkout feature/your-feature
git pull origin staging
```

**When to Sync**:
- Before creating PR
- When staging has important updates
- At least once per day during active development

### Resolving Conflicts

```bash
# Rebase approach
git checkout feature/your-feature
git rebase origin/staging

# Resolve conflicts in files
git add .
git rebase --continue

# Or abort
git rebase --abort
```

---

## Code Review Guidelines

### What to Review

1. **Functionality**: Does it work as intended?
2. **Code Quality**: Is it clean and maintainable?
3. **Tests**: Are there adequate tests?
4. **Documentation**: Is it documented?
5. **Performance**: Any performance concerns?
6. **Security**: Any security issues?
7. **Standards**: Follows project conventions?

### Review Comments

**Good Comments**:
- "Consider extracting this into a separate function"
- "This could be simplified using Array.map()"
- "Add error handling for this edge case"

**Bad Comments**:
- "This is wrong"
- "Fix this"
- "I don't like this"

### Approval Criteria

- ✅ Code is correct and functional
- ✅ Follows project standards
- ✅ Tests are adequate
- ✅ Documentation is updated
- ✅ No obvious issues

---

## Hotfix Process

### When to Use Hotfix

- Critical production bug
- Security vulnerability
- Data loss issue
- Service outage

### Hotfix Workflow

1. **Create branch from main**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-bug
   ```

2. **Fix the issue**:
   ```bash
   # Make fix
   git add .
   git commit -m "fix: critical bug description"
   ```

3. **Merge to main**:
   ```bash
   git checkout main
   git merge hotfix/critical-bug
   git tag -a v1.0.1 -m "Hotfix: critical bug"
   git push origin main --tags
   ```

4. **Merge to staging**:
   ```bash
   git checkout staging
   git merge hotfix/critical-bug
   git push origin staging
   ```

5. **Deploy**:
   ```bash
   npm run prod:deploy
   npm run staging:deploy
   ```

6. **Clean up**:
   ```bash
   git branch -d hotfix/critical-bug
   git push origin --delete hotfix/critical-bug
   ```

---

## Version Tagging

### Tag Format

- **Production**: `v1.0.0` (semantic versioning)
- **Staging**: `staging-<commit-hash>` (automatic)
- **Development**: `<branch>-<commit-hash>` (automatic)

### Semantic Versioning

- **MAJOR** (`v1.0.0`): Breaking changes
- **MINOR** (`v1.1.0`): New features, backward compatible
- **PATCH** (`v1.0.1`): Bug fixes, backward compatible

### Creating Tags

```bash
# Production release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags

# Hotfix
git tag -a v1.0.1 -m "Hotfix: critical bug fix"
git push origin main --tags
```

See [DEPLOYMENT_VERSIONING.md](../../../../DEPLOYMENT_VERSIONING.md) for details.

---

## Common Mistakes to Avoid

### ❌ Don't Commit Directly to Main

**Bad**:
```bash
git checkout main
git commit -m "fix: bug"
```

**Good**:
```bash
git checkout -b feature/fix-bug
git commit -m "fix: bug"
git push origin feature/fix-bug
# Create PR
```

### ❌ Don't Merge Main into Feature Branch

**Bad**:
```bash
git checkout feature/your-feature
git merge main  # Creates unnecessary merge commits
```

**Good**:
```bash
git checkout feature/your-feature
git rebase origin/staging  # Clean history
```

### ❌ Don't Force Push to Protected Branches

**Bad**:
```bash
git push origin main --force  # Will fail (protected)
```

**Good**:
```bash
# Use proper merge process
git checkout main
git merge staging
git push origin main
```

### ❌ Don't Leave Branches Unmerged

**Bad**:
- Feature branches that are never merged
- Abandoned branches

**Good**:
- Delete branches after merge
- Clean up regularly

---

## Tools & Resources

### Git Commands Cheat Sheet

```bash
# Branch management
git branch                    # List branches
git branch -d <branch>       # Delete local branch
git push origin --delete <branch>  # Delete remote branch

# Syncing
git fetch origin             # Fetch latest
git pull origin staging      # Pull and merge
git rebase origin/staging    # Rebase on staging

# Tags
git tag                      # List tags
git tag -a v1.0.0 -m "msg"  # Create annotated tag
git push origin --tags       # Push tags

# History
git log --oneline            # Compact log
git log --graph --oneline    # Visual log
```

### Useful Git Aliases

Add to `~/.gitconfig`:

```ini
[alias]
  co = checkout
  br = branch
  ci = commit
  st = status
  unstage = reset HEAD --
  last = log -1 HEAD
  visual = !gitk
  lg = log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
```

---

## References

### External Resources

- [GitLab Flow Documentation](https://docs.gitlab.com/ee/topics/gitlab_flow.html)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Git Best Practices](https://www.git-scm.com/book/en/v2)

### Internal Documentation

- [GitLab Flow Implementation Guide](./gitlab-flow-guide.md)
- [Git Flow Strategy](../../../../GIT_FLOW_STRATEGY.md)
- [Deployment Versioning](../../../../DEPLOYMENT_VERSIONING.md)
- [Blog: GitOps vs Git Flow](../../../../blog/systems/version-control/gitops-vs-gitflow.md)

---

## Quick Reference Card

### Daily Workflow

```bash
# Morning: Start new feature
git checkout main && git pull && git checkout -b feature/name

# During day: Make commits
git add . && git commit -m "feat: description"

# Sync with staging
git pull origin staging

# End of day: Push work
git push origin feature/name
```

### Weekly Workflow

```bash
# Merge feature to staging
git checkout staging && git merge feature/name && git push

# Deploy to staging
npm run staging:deploy

# After testing: Promote to main
git checkout main && git merge staging && git tag v1.0.0 && git push --tags

# Deploy to production
npm run prod:deploy
```

---

**Last Updated**: 2025-01-15  
**Next Review**: 2025-04-15  
**Maintained By**: Atlas (DevOps Engineer)


