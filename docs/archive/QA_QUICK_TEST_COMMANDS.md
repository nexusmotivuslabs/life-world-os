# Quick Testing Commands for QA

## Pre-Test Setup

```bash
# Ensure dev server is running
cd apps/frontend
npm run dev

# In another terminal, check server
curl http://localhost:5173
```

## Smoke Test Commands

```bash
# Test all critical routes
curl -I http://localhost:5173
curl -I http://localhost:5173/explore
curl -I http://localhost:5173/master/money
curl -I http://localhost:5173/master/energy
curl -I http://localhost:5173/master/travel
curl -I http://localhost:5173/systems
curl -I http://localhost:5173/admin
```

## Type Checking

```bash
cd apps/frontend
npm run type-check
```

## Linting

```bash
cd apps/frontend
npm run lint
```

## Browser Console Commands

Open browser console and run:

```javascript
// Check current route
window.location.pathname

// Check if React Router is working
window.history.length

// Test navigation programmatically
// (Requires React Router context)
```

## Network Monitoring

In browser DevTools Network tab:
- Filter by "XHR" or "Fetch"
- Look for failed requests (red)
- Check response status codes
- Verify request URLs match new route pattern

## Quick Navigation Tests

### Test Route Helpers
1. Open browser console
2. Navigate to any page
3. Check that route matches expected pattern:
   - `/master/money` (not `/master-money`)
   - `/master/energy` (not `/master-energy`)
   - `/master/travel` (not `/master-travel`)

### Test Breadcrumbs
1. Navigate to `/master/money`
2. Verify breadcrumbs show: Explore Systems > Master Money System
3. Click "Explore Systems" in breadcrumbs
4. Should navigate to `/explore`

### Test Layout
1. Navigate to any authenticated page
2. Verify header is visible
3. Verify breadcrumbs are visible
4. Click "Explore Systems" in header
5. Should navigate to `/explore`

## Automated Test Script

Create a simple test script:

```bash
#!/bin/bash
# quick-smoke-test.sh

echo "Running smoke tests..."

# Test server is up
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running"
    exit 1
fi

# Test routes
routes=("/" "/explore" "/master/money" "/master/energy" "/master/travel" "/systems" "/admin")

for route in "${routes[@]}"; do
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:5173$route" | grep -q "200\|301\|302"; then
        echo "✅ Route $route accessible"
    else
        echo "❌ Route $route failed"
    fi
done

echo "Smoke tests complete"
```

## Manual Test Checklist

### Navigation Flow Test
- [ ] Start at `/explore`
- [ ] Click on "Master Money System" card
- [ ] Should navigate to `/master/money`
- [ ] Breadcrumbs should show: Explore Systems > Master Money System
- [ ] Click breadcrumb "Explore Systems"
- [ ] Should navigate back to `/explore`

### Deep Link Test
- [ ] Open new tab
- [ ] Navigate directly to `http://localhost:5173/master/money`
- [ ] Page should load correctly
- [ ] Breadcrumbs should be correct
- [ ] No console errors

### Browser Navigation Test
- [ ] Navigate to `/master/money`
- [ ] Click browser back button
- [ ] Should go to previous page
- [ ] Click browser forward button
- [ ] Should go forward
- [ ] Refresh page
- [ ] Should stay on same route

## Performance Checks

```javascript
// In browser console, measure navigation time
const start = performance.now();
// Navigate to route
const end = performance.now();
console.log(`Navigation took ${end - start}ms`);
```

## Error Detection

### Console Errors
- Open DevTools Console
- Look for red errors
- Note any warnings
- Check for React errors

### Network Errors
- Open DevTools Network tab
- Filter by "Failed"
- Check for 404, 500, or CORS errors
- Verify API endpoints are correct

### Visual Errors
- Check for blank screens
- Check for broken layouts
- Check for missing components
- Check for incorrect styling

