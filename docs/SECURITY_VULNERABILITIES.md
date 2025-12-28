# Security Vulnerabilities Guide

## Current Status

### Dev Dependencies Vulnerabilities

**Status:** ⚠️ 5 moderate vulnerabilities in dev dependencies  
**Risk Level:** Low (dev environment only)  
**Action Required:** Optional (monitor for updates)

### Details

The vulnerabilities are in:
- `esbuild` (via vite)
- `vite`
- `vite-node`
- `vitest`
- `@vitest/coverage-v8`

**Vulnerability:** Development server allows requests from any origin  
**Impact:** Only affects dev server, not production builds  
**Mitigation:** Dev server should never be exposed to untrusted networks

## Why This Is Safe

1. **Dev-only dependencies:** These packages are not included in production builds
2. **Local development:** Dev servers run on localhost only
3. **No production impact:** Production builds don't use these packages
4. **Moderate severity:** Not critical or high severity

## When to Fix

### Fix Now If:
- You're exposing the dev server to external networks
- You're using these packages in production (you shouldn't be)
- A critical/high severity vulnerability is found

### Can Wait If:
- Dev server is localhost only
- These are dev dependencies only
- No external access to dev environment

## How to Fix

### Option 1: Update Packages (Recommended)
```bash
# In backend container
docker-compose -f docker-compose.dev.yml exec backend-dev npm update vite vitest @vitest/coverage-v8

# Rebuild if needed
npm run dev:rebuild
```

### Option 2: Audit Fix (May Break Things)
```bash
# Automatic fix (may cause breaking changes)
docker-compose -f docker-compose.dev.yml exec backend-dev npm audit fix

# Force fix (will install breaking changes)
docker-compose -f docker-compose.dev.yml exec backend-dev npm audit fix --force
```

### Option 3: Manual Update
Update `package.json`:
```json
{
  "devDependencies": {
    "vite": "^6.0.0",  // Update to latest
    "vitest": "^2.0.0",  // Update to latest
    "@vitest/coverage-v8": "^2.0.0"  // Update to latest
  }
}
```

Then rebuild:
```bash
npm run dev:rebuild
```

## Monitoring

### Check Vulnerabilities
```bash
# In container
docker-compose -f docker-compose.dev.yml exec backend-dev npm audit

# On host (if dependencies match)
cd apps/backend && npm audit
```

### Regular Checks
- Run `npm audit` monthly
- Check for critical/high severity vulnerabilities
- Update dev dependencies quarterly

## Production Security

**Important:** Production builds should have zero vulnerabilities in production dependencies.

### Production Audit
```bash
# Check production dependencies only
npm audit --production

# Should show 0 vulnerabilities
```

### CI/CD Integration
Add to your CI pipeline:
```yaml
- name: Security Audit
  run: |
    npm audit --production
    # Fail build if critical/high vulnerabilities found
```

## Best Practices

1. **Separate dev and prod dependencies:** Keep vulnerabilities in dev deps
2. **Regular updates:** Update packages monthly
3. **Monitor advisories:** Subscribe to security advisories
4. **Production focus:** Prioritize production dependency security
5. **Document decisions:** Record why vulnerabilities are acceptable

## Related Documents

- [Docker Rebuild Guide](./DOCKER_REBUILD_GUIDE.md)
- [Security Procedures](../docs/confluence/domains/security/implementation/security-procedures.md)

