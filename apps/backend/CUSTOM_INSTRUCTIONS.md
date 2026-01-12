# Custom Instructions System

**Version**: 1.0.0  
**Last Updated**: 2025-01-27  
**Status**: MVP with Production Hooks

## Overview

The Custom Instructions system centralizes all AI prompt management for Life World OS. It provides a clean, extensible architecture for managing different personas (Query, Guide, Default) and providers (Ollama, Groq) with hooks for future production features.

## Architecture

### Core Components

1. **CustomInstructions Class** (`src/services/customInstructions.ts`)
   - Manages all system prompts
   - Version tracking
   - Analytics hooks
   - Response cleaning rules

2. **AI Service Integration** (`src/services/aiService.ts`)
   - Uses CustomInstructions for all prompts
   - Supports InstructionContext for RAG/web search
   - Provider-agnostic interface

## Usage

### Basic Usage

```typescript
import { CustomInstructions } from './services/customInstructions.js';

// Get system prompt
const prompt = CustomInstructions.getSystemPrompt('query', 'ollama', {
  userContext: 'User has 100 XP...',
  knowledgeArticles: [...],
  webContext: '...'
});

// Get response cleaner
const cleaner = CustomInstructions.getResponseCleaner('ollama');
const cleaned = cleaner(rawResponse);
```

### Personas

- **`query`** (default): Factual, system-like artifact. No instructions or purpose.
- **`guide`**: Helpful, friendly guide with actionable suggestions.
- **`default`**: Generic helpful assistant.

### Configuration

Set persona via environment variable:

```bash
# .env.local
AI_PERSONA=query  # or 'guide' or 'default'
```

If not set, defaults to `query`.

## Features

### MVP Features

✅ **Centralized Prompts**: All prompts in one place  
✅ **Version Tracking**: Built-in versioning system  
✅ **Provider Support**: Ollama and Groq  
✅ **Response Cleaning**: Provider-specific cleaning rules  
✅ **Analytics Hooks**: Extensible logging for future analytics  

### Future Production Features (Hooks Ready)

🔜 **A/B Testing**: Framework ready for variant selection  
🔜 **Prompt Versioning**: Database-backed version management  
🔜 **Evaluation Metrics**: Automated quality tracking  
🔜 **Cost Tracking**: Per-prompt cost analytics  
🔜 **Multi-tenant**: Per-user prompt isolation  

## File Structure

```
apps/backend/src/services/
├── customInstructions.ts    # Main instructions class
├── aiService.ts              # AI service (uses CustomInstructions)
└── ...
```

## API Reference

### CustomInstructions.getSystemPrompt()

```typescript
getSystemPrompt(
  persona: PersonaType = 'query',
  provider: ProviderType = 'ollama',
  context?: InstructionContext
): string
```

Returns a complete system prompt with context.

### CustomInstructions.getResponseCleaner()

```typescript
getResponseCleaner(provider: ProviderType): (content: string) => string
```

Returns a function to clean provider-specific response artifacts.

### CustomInstructions.getMetadata()

```typescript
getMetadata(persona: PersonaType, provider: ProviderType): PromptMetadata
```

Returns metadata about the prompt (version, persona, provider, etc.).

### CustomInstructions.getPersonaFromEnv()

```typescript
getPersonaFromEnv(): PersonaType
```

Gets persona from `AI_PERSONA` environment variable or defaults to `query`.

## InstructionContext

```typescript
interface InstructionContext {
  userContext?: string;           // Formatted user state
  knowledgeArticles?: Array<{     // RAG knowledge base articles
    title: string;
    content: string;
    similarity: number;
  }>;
  webContext?: string;            // Web search results
}
```

## Response Cleaning

### Ollama (DeepSeek-r1)

Removes:
- Thinking tags (`<think>...</think>`)
- Internal reasoning patterns
- Verbose formatting
- Multiple newlines

### Groq

Minimal cleaning (just trim).

## Analytics Hook

The `onPromptUsed()` method is called automatically when a prompt is generated:

```typescript
// MVP: Console logging
console.log(`[Prompt] query@ollama v1.0.0 - 2025-01-27T...`);

// Future: Send to analytics service
// await analyticsService.track('prompt.used', { ...usage, ...metadata });
```

## Version History

- **v1.0.0** (2025-01-27): Initial MVP with Query persona, Ollama/Groq support, analytics hooks

## Migration Guide

### From Hardcoded Prompts

**Before:**
```typescript
const systemPrompt = `You are a helpful guide...`;
```

**After:**
```typescript
import { CustomInstructions } from './services/customInstructions.js';
const systemPrompt = CustomInstructions.getSystemPrompt('query', 'ollama');
```

## Future Enhancements

1. **Database-Backed Prompts**: Store prompts in database for versioning
2. **A/B Testing**: Multi-variant prompt testing
3. **Evaluation Framework**: Automated quality metrics
4. **Cost Tracking**: Per-prompt cost analytics
5. **Fine-tuning Pipeline**: Dataset collection and model training

## Testing

```typescript
// Test prompt generation
const prompt = CustomInstructions.getSystemPrompt('query', 'ollama');
expect(prompt).toContain('Query, an artifact of Life World OS');

// Test response cleaning
const cleaner = CustomInstructions.getResponseCleaner('ollama');
const cleaned = cleaner('<think>reasoning</think>Final answer');
expect(cleaned).toBe('Final answer');
```

## Troubleshooting

### Wrong Persona

Check `AI_PERSONA` environment variable:
```bash
echo $AI_PERSONA  # Should be 'query', 'guide', or 'default'
```

### Prompt Not Updating

1. Check version in `customInstructions.ts`
2. Verify environment variable is set
3. Restart backend server

### Response Cleaning Issues

Check provider-specific cleaning rules in `getResponseCleaner()`.




