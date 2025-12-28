#!/bin/bash

# Quick Fix Script for Hierarchy Data Loading Issue
# This script checks and fixes common hierarchy loading problems

set -e

echo "🔍 Checking Hierarchy Data Status..."
echo ""

# Check if backend is running
echo "1. Checking backend server..."
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is not running"
    echo "   💡 Start backend: cd apps/backend && npm run dev"
    exit 1
fi

# Check if reality-root exists
echo ""
echo "2. Checking for reality-root node..."
REALITY_ROOT=$(curl -s http://localhost:3001/api/reality-nodes/reality-root 2>&1)

if echo "$REALITY_ROOT" | grep -q "Node not found\|404\|error"; then
    echo "   ❌ reality-root node not found"
    echo "   💡 Database needs seeding"
    NEEDS_SEED=true
else
    echo "   ✅ reality-root node exists"
    NEEDS_SEED=false
fi

# Check root nodes
echo ""
echo "3. Checking root nodes..."
ROOTS=$(curl -s http://localhost:3001/api/reality-nodes/roots 2>&1)

if echo "$ROOTS" | grep -q "nodes.*\[\]"; then
    echo "   ❌ No root nodes found"
    NEEDS_SEED=true
else
    ROOT_COUNT=$(echo "$ROOTS" | grep -o '"count":[0-9]*' | grep -o '[0-9]*' || echo "0")
    echo "   ✅ Found $ROOT_COUNT root node(s)"
fi

# Fix if needed
if [ "$NEEDS_SEED" = true ]; then
    echo ""
    echo "🔧 Fixing: Seeding database..."
    echo ""
    
    cd "$(dirname "$0")/.."
    
    # Run migrations
    echo "   Running migrations..."
    npm run migrate || echo "   ⚠️  Migration may have failed (continuing...)"
    
    # Run seed
    echo "   Seeding database..."
    npm run seed
    
    echo ""
    echo "✅ Database seeded! Try refreshing the frontend."
else
    echo ""
    echo "✅ Everything looks good! If you're still seeing errors:"
    echo "   1. Check browser console for network errors"
    echo "   2. Verify frontend API URL matches backend port"
    echo "   3. Check CORS configuration"
fi

