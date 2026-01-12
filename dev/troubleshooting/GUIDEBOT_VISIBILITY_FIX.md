# GuideBot Visibility Fix

## Problem

The Query bot (GuideBot) was not appearing in the app because it was being covered by the SystemGuide button. Both components were positioned at the exact same location (`bottom-6 right-6`).

## Root Cause

1. **SystemGuide** component (rendered in Dashboard.tsx):
   - Position: `fixed bottom-6 right-6 z-30`
   - Blue help button with question mark icon

2. **GuideBot** component (rendered in App.tsx):
   - Position: `fixed bottom-6 right-6 z-50`
   - Yin-yang styled Query button

Even though GuideBot had a higher z-index (50 vs 30), the SystemGuide button was visually covering it or preventing clicks.

## Solution

Moved GuideBot button to `right-24` instead of `right-6` to avoid overlap:

- **Minimized button**: `fixed bottom-6 right-24 z-50`
- **Expanded chat window**: `fixed bottom-6 right-24 z-50`

This positions the Query bot to the left of the SystemGuide button, making both visible and accessible.

## Files Modified

- `apps/frontend/src/components/GuideBot.tsx`
  - Changed minimized button position from `right-6` to `right-24`
  - Changed expanded chat window position from `right-6` to `right-24`

## Visual Layout

```
Bottom Right Corner:
┌─────────────────────────────────┐
│                                 │
│  [Query Bot]  [System Guide]   │
│  (right-24)   (right-6)        │
│                                 │
└─────────────────────────────────┘
```

Both buttons are now visible and accessible.

