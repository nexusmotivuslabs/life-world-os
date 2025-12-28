# Versioning Strategy

**Approach**: Git tags are the **only source of truth** for versioning.

## Overview

All version information is derived from git tags. The version scripts automatically detect git tags and use them for versioning. **No need to maintain version numbers in package.json files.**

## How It Works

1. **Git tags** are created for each release (e.g., `v1.0.0`, `v1.1.0`)
2. **Version scripts** automatically detect the latest git tag
3. **Version information** is extracted from the tag format
4. **V1/V2 detection** is based on tag version numbers

## Tag Format

Tags follow semantic versioning:
- `v1.0.0` - Major.Minor.Patch
- `v1.1.0` - Minor version bump (V2)
- `v2.0.0` - Major version bump

## Creating Tags

```bash
# Create annotated tag
git tag -a v1.0.0 -m "V1 Complete: Initial production release"

# Push tag to remote
git push origin v1.0.0
```

## Version Detection

The `scripts/get-version.js` script:
- Detects latest git tag using `git describe --tags --abbrev=0`
- Extracts version from tag (e.g., `v1.0.0` → `1.0.0`)
- Determines V1/V2 based on tag version
- Uses tag for all versioning operations

## Version Information

Version script returns:
```json
{
  "version": "v1.0.0",           // Git tag
  "tag": "v1.0.0",                // Latest git tag
  "versionFromTag": "1.0.0",      // Extracted version
  "majorVersion": 1,               // From tag
  "minorVersion": 0,               // From tag
  "patchVersion": 0,               // From tag
  "isV1": true,                   // V1 detection
  "isV2": false,                   // V2 detection
  "releaseVersion": "v1"          // Release version
}
```

## Benefits

1. **Single source of truth** - Git tags only
2. **No duplication** - No need to sync package.json versions
3. **Automatic detection** - Scripts automatically find tags
4. **Semantic versioning** - Standard format (vX.Y.Z)
5. **Git history** - Tags are part of git history

## Package.json Versions

Package.json files may still have version fields, but they are **not used for versioning**. They are kept for:
- npm package metadata (if publishing)
- Reference only
- Backward compatibility

## Related Documentation

- [GIT_TAGGING_GUIDE.md](./docs/GIT_TAGGING_GUIDE.md) - Complete tagging guide
- [DEPLOYMENT_V2.md](./docs/DEPLOYMENT_V2.md) - Deployment guide
- [V1_COMPLETE.md](./V1_COMPLETE.md) - V1 completion

