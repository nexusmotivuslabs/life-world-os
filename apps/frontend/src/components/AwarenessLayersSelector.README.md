# Awareness Layers Selector - Xbox 360 Style Navigation

## Overview

The Awareness Layers Selector component provides an Xbox 360-style navigation experience for browsing and selecting awareness layers. This design pattern emphasizes:

- **Grid-based layout** (3 columns)
- **Keyboard navigation** (Arrow keys + Enter)
- **Visual focus indicators** (ring, scale, elevation)
- **Smooth animations** (Framer Motion)
- **Clear selection states** (focused vs selected)

## Design Principles

### Xbox 360 Dashboard Inspiration

The Xbox 360 dashboard featured:
- Large, selectable tiles in a grid layout
- Clear visual feedback on focus/selection
- Smooth transitions between items
- Keyboard/gamepad navigation support
- Prominent highlighting of the active item

### Implementation Details

1. **Grid Layout**: 3 columns (responsive: 1 column on mobile)
2. **Navigation**:
   - Arrow keys (↑↓←→) to move focus
   - Enter/Space to select
   - Mouse hover also updates focus
3. **Visual States**:
   - **Default**: Normal opacity, standard border
   - **Focused**: Scale up (1.05x), elevate (-4px), ring highlight, category-colored border
   - **Selected**: Additional ring indicator, "Selected" label
4. **Category Colors**:
   - **ROOT**: Blue (Bible is primary root)
   - **EXAMINE**: Yellow (Nihilism awareness)
   - **REFUTE**: Red

## Usage

```tsx
<AwarenessLayersSelector
  onLayerSelect={(layer) => {
    // Handle layer selection
    console.log('Selected:', layer)
  }}
/>
```

## Features

- ✅ Keyboard navigation (Arrow keys + Enter)
- ✅ Mouse hover support
- ✅ Visual focus indicators
- ✅ Category-based color coding
- ✅ Parent/child relationship display
- ✅ Bible highlighted as #1 (orderIndex: 1)
- ✅ Smooth animations
- ✅ Responsive design

## UX Agent Notes

**For UX Agent**: This component should be highlighted as an example of game-console-inspired navigation patterns. The dashboard should emphasize:

1. **Accessibility**: Keyboard navigation makes it accessible without mouse
2. **Visual Hierarchy**: Clear focus states guide user attention
3. **Feedback**: Immediate visual response to user actions
4. **Consistency**: Similar patterns can be applied to other dashboard sections

Consider applying this pattern to:
- System selection cards
- Quick action buttons
- Navigation menus
- Feature discovery sections


