# Git Tagging Guide

**Versioning Strategy**: Git tags are the **only source of truth** for versioning.

## Overview

All version information is derived from git tags. The version scripts automatically detect git tags and use them for versioning. No need to maintain version numbers in package.json files.

## Tag Format

Tags follow semantic versioning:
- `v1.0.0` - Major.Minor.Patch
- `v1.1.0` - Minor version bump
- `v2.0.0` - Major version bump

## Creating Tags

### Annotated Tags (Recommended)

```bash
# Create annotated tag with message
git tag -a v1.0.0 -m "V1 Complete: Initial production release"

# Push tag to remote
git push origin v1.0.0
```

### Lightweight Tags

```bash
# Create lightweight tag (not recommended for releases)
git tag v1.0.0

# Push tag to remote
git push origin v1.0.0
```

## Version Detection

The version script (`scripts/get-version.js`) automatically:

1. **Detects latest git tag** using `git describe --tags --abbrev=0`
2. **Extracts version** from tag format (e.g., `v1.0.0` → `1.0.0`)
3. **Determines V1/V2** based on tag:
   - `v1.0.0` = V1
   - `v1.1.0+` = V2
4. **Uses tag for versioning** in all environments

## Tagging Workflow

### For V1 Release

```bash
# Ensure you're on the commit you want to tag
git checkout main  # or the release branch

# Create and push tag
git tag -a v1.0.0 -m "V1 Complete: Initial production release"
git push origin v1.0.0
```

### For V2 Release

```bash
# Ensure you're on the commit you want to tag
git checkout main  # or the release branch

# Create and push tag
git tag -a v1.1.0 -m "V2 Release: Environment-aware deployments"
git push origin v1.1.0
```

### For Future Releases

```bash
# Major release
git tag -a v2.0.0 -m "Major release: [description]"
git push origin v2.0.0

# Minor release
git tag -a v1.2.0 -m "Minor release: [description]"
git push origin v1.2.0

# Patch release
git tag -a v1.1.1 -m "Patch release: [description]"
git push origin v1.1.1
```

## Viewing Tags

```bash
# List all tags
git tag

# List tags with messages
git tag -n

# Show specific tag
git show v1.0.0

# List tags matching pattern
git tag -l "v1.*"
```

## Checking Current Version

```bash
# Get version info (uses git tags)
npm run version:get

# Get version for specific environment
npm run version:staging
npm run version:prod
```

## Version Script Output

The version script returns:
```json
{
  "version": "v1.0.0",           // Git tag or derived version
  "tag": "v1.0.0",                // Latest git tag
  "versionFromTag": "1.0.0",      // Extracted version number
  "majorVersion": 1,               // Major version from tag
  "minorVersion": 0,               // Minor version from tag
  "patchVersion": 0,               // Patch version from tag
  "isV1": true,                   // V1 detection
  "isV2": false,                   // V2 detection
  "releaseVersion": "v1",         // Release version
  "commit": "a1b2c3d",            // Commit hash
  "branch": "main"                // Git branch
}
```

## Best Practices

1. **Always use annotated tags** for releases (include `-a` flag)
2. **Always include a message** describing the release
3. **Tag on main/master branch** for production releases
4. **Push tags immediately** after creating them
5. **Follow semantic versioning** strictly
6. **Tag after successful deployment** to production

## Tagging Checklist

Before creating a tag:

- [ ] All tests passing
- [ ] Code reviewed and merged
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] On correct branch (main/master for production)
- [ ] Deployment successful (for production tags)

## Deleting Tags

```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin --delete v1.0.0

# Or push with colon
git push origin :refs/tags/v1.0.0
```

**Warning**: Only delete tags if absolutely necessary. Prefer creating a new tag instead.

## Troubleshooting

### Tag Not Detected

```bash
# Ensure tag exists
git tag -l

# Ensure tag is pushed to remote
git push origin --tags

# Check if script can see tag
git describe --tags --abbrev=0
```

### Wrong Version Detected

```bash
# Check latest tag
git describe --tags --abbrev=0

# Check all tags
git tag -l

# Verify tag format (should be vX.Y.Z)
git tag -l | grep "^v[0-9]"
```

## Related Documentation

- [DEPLOYMENT_V2.md](./DEPLOYMENT_V2.md) - Deployment guide
- [V1_COMPLETE.md](../V1_COMPLETE.md) - V1 completion
- [CHANGELOG.md](../CHANGELOG.md) - Version changelog

