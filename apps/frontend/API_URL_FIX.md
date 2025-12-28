# Port Configuration

## Local Development Ports

- **Database**: Port 5000
- **Backend**: Port 5001
- **Frontend**: Port 5002

## Configuration

The defaults have been updated to use port 5001 for the backend. If you need to override, create/update `apps/frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5001
```

## Verify

After starting services, check:
1. Backend running on http://localhost:5001
2. Frontend running on http://localhost:5002
3. Query bot shows "Connected" status
4. No more `ERR_CONNECTION_REFUSED` errors

