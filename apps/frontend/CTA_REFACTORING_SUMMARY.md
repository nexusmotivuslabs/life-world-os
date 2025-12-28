# CTA Refactoring Summary

## Canonical Interaction Model

Life World OS uses **Planes** as interaction modes. Planes are not pages—they define how the user interacts with the system.

### Plane Rules

1. **Knowledge Plane**
   - Read-only
   - No state changes
   - No energy consumption
   - No consequences
   - Purpose: understanding, orientation, interpretation
   - **CTA Pattern**: "Explore knowledge", "Understand systems", "View knowledge base"

2. **Systems Plane**
   - Actions change state
   - Energy is consumed
   - Consequences apply
   - Subject to capacity, decay, and burnout
   - Purpose: execution, work, growth, output
   - **CTA Pattern**: "Take action", "Start working", "Execute systems"

3. **Loadouts Plane**
   - Configuration only
   - No execution
   - No consequences
   - Purpose: preparation and optimization before action
   - **CTA Pattern**: "Configure loadout", "Optimize build", "Prepare for action"

4. **Tier System Plane**
   - Structural and strategic view
   - No execution
   - No direct state changes
   - Purpose: orientation, hierarchy, system navigation
   - **CTA Pattern**: "Explore hierarchy", "View system structure", "Navigate systems"

## Global CTA Rules (MANDATORY)

✅ **DO:**
- Use plane-specific, action-oriented language
- Reflect the purpose of each plane
- Use verbs that describe the interaction mode
- Be specific about what the user will do

❌ **DON'T:**
- Never use generic CTAs like "Click to enter" or "Go to"
- Avoid vague terms like "View Details" (use context-specific alternatives)
- Don't use "Click here" or "Enter"
- Avoid navigation-focused language that doesn't describe the action

## Changes Made

### PlaneChoice.tsx
- ✅ Knowledge Plane: "Click to enter" → "Explore knowledge"
- ✅ Systems Plane: "Click to enter" → "Take action"
- ✅ Loadouts Plane: "Click to enter" → "Configure loadout"
- ✅ Tier System Plane: "Click to enter" → "Explore hierarchy"

### KnowledgeSearch.tsx
- ✅ Generic "View Details" → "Explore content" (for unknown types)

### LoadoutPage.tsx
- ✅ "View Details" → "Inspect item"
- ✅ "Click to select item" → "Select item"

### LoadoutItemSelector.tsx
- ✅ "View Details" → "Inspect item"

### CustomLocationCard.tsx
- ✅ "View Details" → "Explore location"

## Remaining Work

### Components to Review
- [ ] Check all button labels in components
- [ ] Review modal CTAs
- [ ] Update any remaining "View Details" instances
- [ ] Review navigation links for plane-appropriate language
- [ ] Check form submission buttons
- [ ] Review quick action buttons

### Patterns to Apply
- Knowledge Plane links: "Explore [topic]", "Understand [concept]", "View [resource]"
- Systems Plane actions: "Start [activity]", "Execute [action]", "Work on [task]"
- Loadouts Plane: "Configure [item]", "Select [option]", "Optimize [aspect]"
- Tier System Plane: "Explore [tier]", "View [system]", "Navigate [hierarchy]"

## Examples of Good CTAs

### Knowledge Plane
- "Explore knowledge base"
- "Understand system behavior"
- "View laws and principles"
- "Interpret constraints"

### Systems Plane
- "Take action"
- "Start working"
- "Execute system"
- "Begin activity"

### Loadouts Plane
- "Configure loadout"
- "Select item"
- "Optimize build"
- "Prepare for action"

### Tier System Plane
- "Explore hierarchy"
- "View system structure"
- "Navigate tiers"
- "Browse systems"


