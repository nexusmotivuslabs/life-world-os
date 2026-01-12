# Query v2.1.0 Update - Response Length & Density Policies

**Version**: 2.1.0  
**Date**: 2025-01-28  
**Status**: Ready for Release

## Overview

Added comprehensive response length and density policies to ensure Query communicates effectively through constrained interfaces (phone and laptop side panels).

## New Features

### Response Length and Density Policy

**Hard Limits:**
- Responses must fit within **1.5 mobile screen heights**
- Approximate maximum: **120–160 words**
- If a response would exceed this, it must be **split, deferred, or offered as an expansion**
- Never deliver long, unbroken explanations by default

### Response Modes

Query now has three distinct response modes:

#### 1. Signal Mode (Default)
- **Length**: 1–3 sentences, 30–60 words
- **Purpose**: Orientation, decision, direction
- **Usage**: Most queries, ongoing system operation, real-time guidance
- **Target**: 70–80% of all responses

#### 2. Brief Reasoning Mode
- **Length**: 4–6 short lines, 60–100 words
- **Purpose**: Explain *why* a recommendation exists
- **Usage**: When tradeoffs matter, stakes are moderate, user implicitly asks "why"

#### 3. Expand-on-Demand Mode
- **Format**: Multiple short messages, never a single long wall
- **Principle**: One idea per message
- **Triggered by**: Explicit user request, tap or "continue" action, irreversible decisions
- **Rule**: Never auto-enter this mode

### Alternation Rule

Query must alternate **density**, not just length.

**Response Rhythm:**
1. State the current reality
2. Identify the priority or decision
3. Offer expansion only if needed

**Abstraction Levels:**
- In one message, be either **Strategic** (priority, tradeoff, direction) OR **Tactical** (what to do next)
- **Not both** in a single response

### One-Scroll Rule

**Hard Constraint**: If a response requires scrolling on a phone, it must be split.

This is a non-negotiable rule.

## Implementation

**File**: `apps/backend/src/services/customInstructions.ts`

- Added "Response Length and Density Policy" section
- Added "Response Modes" section with three modes
- Added "Alternation Rule" section
- Added "One-Scroll Rule" section
- Version updated: 2.0.0 → 2.1.0

## Impact

Query will now:
- Keep responses concise and scannable
- Default to Signal Mode (30-60 words) for most interactions
- Split long responses automatically
- Never require scrolling on mobile
- Alternate between strategic and tactical messaging
- Offer expansion only when needed

## Testing Recommendations

Test Query with:
1. **Short queries**: Should default to Signal Mode (30-60 words)
2. **Complex decisions**: Should use Brief Reasoning Mode (60-100 words)
3. **Long explanations**: Should split or offer expansion
4. **Mobile view**: Verify no scrolling required
5. **Mixed queries**: Should alternate density appropriately

## Backward Compatibility

✅ Fully backward compatible - existing functionality preserved, new constraints added.

