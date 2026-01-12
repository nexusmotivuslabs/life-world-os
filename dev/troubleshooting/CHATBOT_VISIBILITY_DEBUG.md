# Chatbot Visibility Debug Guide

## Current Configuration

**GuideBot (Query) Button:**
- Position: `fixed bottom-6 right-6`
- Z-index: `z-[100]` (very high to ensure visibility)
- Size: `w-16 h-16` (64px × 64px)
- Color: Yin-yang (purple/orange split)

**SystemGuide Button:**
- Position: `fixed bottom-6 right-28` (moved left to avoid overlap)
- Z-index: `z-30`
- Size: Standard button size

## Troubleshooting Steps

### 1. Check if Component is Rendered
Open browser DevTools Console and check for:
- Any React errors
- Component mount errors
- Import errors

### 2. Check CSS Visibility
In DevTools, inspect the bottom-right corner:
```javascript
// In browser console
document.querySelector('[aria-label="Open Query"]')
```

### 3. Check Z-Index Conflicts
Look for any elements with:
- `z-index` > 100
- `position: fixed` at bottom-right
- Overlay/backdrop elements

### 4. Verify Component Import
Check `App.tsx` line 21 and 191:
- Should have: `import GuideBot from './components/GuideBot'`
- Should have: `<GuideBot />` inside BrowserRouter

### 5. Check Viewport
The button should be visible if:
- Viewport width > 400px
- Viewport height > 200px
- No `overflow: hidden` on parent containers

### 6. Force Visibility Test
Temporarily add inline style to test:
```tsx
style={{ display: 'block', visibility: 'visible', opacity: 1 }}
```

## Expected Behavior

- **Minimized**: Yin-yang button at bottom-right (64px × 64px)
- **Expanded**: Chat window (384px × 600px) at bottom-right
- **Always visible**: Button should always be visible when minimized

## Quick Fix

If still not visible, try:
1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
2. Clear browser cache
3. Check if other fixed elements are visible
4. Verify Tailwind CSS is loading correctly

