# Quick Restart Instructions

## After Large Changes

Use the restart script:
```bash
./restart-dev.sh
```

Or manually:
```bash
lsof -ti:5173 | xargs kill -9 2>/dev/null
rm -rf node_modules/.vite
npm run dev
```

## Full Documentation

See `../../RESTART_GUIDE.md` for comprehensive restart instructions including Docker options.
