#!/bin/bash
# Force restart script for frontend dev server
# This script kills any running Vite dev server and restarts it

set -e  # Exit on error

echo "🔄 Force restarting frontend dev server..."

# Kill any process on port 5173 (Vite default)
echo "📛 Stopping any running dev server on port 5173..."
lsof -ti:5173 | xargs kill -9 2>/dev/null && echo "   ✅ Killed process on port 5173" || echo "   ℹ️  No process found on port 5173"

# Kill any node processes related to vite
echo "🧹 Cleaning up any Vite processes..."
pkill -f "vite" 2>/dev/null && echo "   ✅ Killed Vite processes" || echo "   ℹ️  No Vite processes found"

# Clear Vite cache (recommended after large changes)
echo "🗑️  Clearing Vite cache..."
rm -rf node_modules/.vite 2>/dev/null && echo "   ✅ Cleared Vite cache" || echo "   ℹ️  No cache to clear"

# Wait a moment for processes to fully terminate
sleep 1

# Run type check first to catch errors early
echo "🔍 Running TypeScript type check..."
if npm run type-check 2>&1 | grep -q "error TS"; then
    echo "   ⚠️  TypeScript errors found. Check output above."
    echo "   💡 Fix errors before restarting, or continue anyway? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "   ❌ Aborting restart. Fix errors first."
        exit 1
    fi
else
    echo "   ✅ No TypeScript errors"
fi

# Start the dev server
echo "🚀 Starting dev server..."
echo "   📍 Server will be available at http://localhost:5173"
echo "   Press Ctrl+C to stop"
echo ""

npm run dev
