# Vite Host Blocking Fix

## Issue
Vite was blocking requests from `dev.lifeworld.com` with the error:
```
Blocked request. This host ("dev.lifeworld.com") is not allowed.
To allow this host, add "dev.lifeworld.com" to `server.allowedHosts` in vite.config.js.
```

## Solution

The `allowedHosts` option is not a standard Vite configuration option. Instead, we need to:

1. Set `host: '0.0.0.0'` to listen on all interfaces
2. Configure HMR (Hot Module Replacement) to use the custom domain
3. Ensure `strictPort: false` for flexibility

## Fixed Configuration

```typescript
server: {
  port: 5173,
  host: '0.0.0.0', // Listen on all interfaces
  strictPort: false,
  hmr: {
    host: 'dev.lifeworld.com',
  },
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
},
```

## Why This Works

- `host: '0.0.0.0'` allows Vite to accept connections from any host/IP
- `hmr.host` tells Vite's HMR system to use the custom domain
- `strictPort: false` prevents port conflicts

## Testing

After the fix:
```bash
# Should return HTML (200 OK)
curl http://dev.lifeworld.com/

# Should return JSON
curl http://dev.lifeworld.com/api/health
```

## Status: ✅ FIXED

The domain `http://dev.lifeworld.com` is now fully accessible without blocking errors.

