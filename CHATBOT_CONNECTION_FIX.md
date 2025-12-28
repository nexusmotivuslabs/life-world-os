# Chatbot Connection Fix Summary

## Issues Fixed

### 1. Port Mismatch ✅
- **Problem**: GuideBot.tsx was checking port 5001 for health, but api.ts uses port 3001
- **Fix**: Updated GuideBot.tsx to use the same API_URL constant as api.ts (port 3001)

### 2. Error Handling ✅
- **Problem**: Generic error messages didn't help users diagnose connection issues
- **Fix**: Added specific error messages for:
  - Network/connection errors
  - Authentication errors (401)
  - Server errors (500)

### 3. Smoke Test Script ✅
- **Created**: `apps/backend/scripts/smoke-test-chat.ts`
- **Purpose**: Test chatbot endpoint connectivity and functionality
- **Usage**: `npm run test:chat` (from apps/backend)

## Configuration

### Backend Port
- Default: **3001** (configured in `apps/backend/src/index.ts`)
- Override: Set `PORT` in `apps/backend/.env.local`

### Frontend API URL
- Default: **http://localhost:3001** (configured in `apps/frontend/src/services/api.ts`)
- Override: Set `VITE_API_URL` in `apps/frontend/.env.local`

## Testing

### Manual Test
1. Ensure backend is running: `cd apps/backend && npm run dev`
2. Ensure frontend is running: `cd apps/frontend && npm run dev`
3. Open browser console and check for errors
4. Try sending a message in Query chatbot

### Smoke Test
```bash
cd apps/backend
npm run test:chat
```

### Verify Backend is Running
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"..."}
```

## Common Issues

### "Connection Refused" Error
- **Cause**: Backend not running or wrong port
- **Fix**: 
  1. Check backend is running: `ps aux | grep tsx`
  2. Verify port: `lsof -ti:3001`
  3. Restart backend: `cd apps/backend && npm run dev`

### "401 Unauthorized" Error
- **Cause**: User not logged in
- **Fix**: Log in to the application first

### "500 Internal Server Error"
- **Cause**: Backend error (check backend logs)
- **Fix**: Check backend console for error details

## Files Modified

1. `apps/frontend/src/components/GuideBot.tsx`
   - Fixed port mismatch (5001 → 3001)
   - Improved error handling with specific messages

2. `apps/backend/scripts/smoke-test-chat.ts` (new)
   - Smoke test script for chatbot connectivity

3. `apps/backend/package.json`
   - Added `test:chat` script

