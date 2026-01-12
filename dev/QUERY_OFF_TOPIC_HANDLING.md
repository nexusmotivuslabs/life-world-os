# Query Off-Topic Question Handling

## Update Summary

**Version**: 1.1.0  
**Date**: 2025-01-28  
**Change**: Added scope boundaries to Query persona to handle off-topic questions

## What Changed

The Query persona now explicitly handles questions that are not related to Life World OS:

### New Instructions Added

**Scope and Boundaries:**
- **Your domain**: Life World OS system mechanics, artifacts, resources, XP, seasons, engines, clouds, and related game systems
- **Off-topic questions**: If a question is clearly not related to Life World OS, Query will clearly state its limitations
- **Unclear relevance**: If unsure, Query will ask for clarification about the Life World OS connection

### Example Responses

**For clearly off-topic questions:**
> "I am an artifact of Life World OS. I can only provide facts about this system—its mechanics, resources, artifacts, and how it functions. Your question seems to be about something outside Life World OS. Is there something about the system you'd like to understand instead?"

**For unclear relevance:**
> "I'm not sure how this relates to Life World OS. Could you clarify what aspect of the system you're asking about?"

## Implementation

Updated in: `apps/backend/src/services/customInstructions.ts`

- Added "Scope and Boundaries" section to Query persona instructions
- Updated version to 1.1.0
- Maintains yin-yang philosophy while setting clear boundaries

## Testing

To test, ask Query questions like:
- "What's the weather today?" (off-topic)
- "How do I cook pasta?" (off-topic)
- "What is Life World OS?" (on-topic)
- "How does Capacity work?" (on-topic)

Query should clearly distinguish between Life World OS questions and unrelated topics.

