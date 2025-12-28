/**
 * Custom Instructions Service
 * 
 * Manages system prompts and instructions for different AI personas and providers.
 * Centralizes all instruction logic for easy maintenance and updates.
 * 
 * Enhanced MVP with hooks for future production features:
 * - Version tracking
 * - Analytics hooks
 * - Metadata support
 * - Extensible for A/B testing, evaluation, etc.
 */

export type PersonaType = 'query' | 'guide' | 'default';
export type ProviderType = 'ollama' | 'groq';

export interface InstructionContext {
  userContext?: string;
  knowledgeArticles?: Array<{ title: string; content: string; similarity: number }>;
  webContext?: string;
}

export interface PromptMetadata {
  version: string;
  persona: PersonaType;
  provider: ProviderType;
  lastUpdated: string;
  author: string;
}

export interface PromptUsage {
  persona: PersonaType;
  provider: ProviderType;
  version: string;
  timestamp: Date;
  userId?: string;
}

/**
 * Custom Instructions Class
 * 
 * Manages all system prompts with version tracking and analytics hooks.
 */
export class CustomInstructions {
  // Version tracking
  static readonly VERSION = '1.0.0';
  static readonly LAST_UPDATED = '2025-01-27';
  static readonly AUTHOR = 'system';

  /**
   * Get system prompt for a specific persona and provider
   */
  static getSystemPrompt(
    persona: PersonaType = 'query',
    provider: ProviderType = 'ollama',
    context?: InstructionContext
  ): string {
    const baseInstructions = this.getBaseInstructions(persona);
    const providerInstructions = this.getProviderInstructions(persona, provider);
    const contextInstructions = this.getContextInstructions(context);

    // Analytics hook (extensible for future production features)
    this.onPromptUsed({ persona, provider, version: this.VERSION, timestamp: new Date() });

    return `${baseInstructions}\n\n${providerInstructions}${contextInstructions}`;
  }

  /**
   * Get metadata for a prompt
   */
  static getMetadata(persona: PersonaType, provider: ProviderType): PromptMetadata {
    return {
      version: this.VERSION,
      persona,
      provider,
      lastUpdated: this.LAST_UPDATED,
      author: this.AUTHOR,
    };
  }

  /**
   * Base instructions for each persona
   */
  private static getBaseInstructions(persona: PersonaType): string {
    const systemFacts = `System Facts You Know:
- 🌥️ Clouds: Capacity, Engines, Oxygen, Meaning, Optionality (0-100%)
- 🍂 Seasons: Spring, Summer, Autumn, Winter (affect XP multipliers)
- 💎 Resources: Oxygen, Water, Gold, Armor, Keys, Energy
- ⚙️ Engines: Career, Business, Investment, Learning
- 🎮 XP: Rank/Level + category XP`;

    switch (persona) {
      case 'query':
        return `You are Query, an artifact of Life World OS. You embody the yin-yang of inquiry: the balance between question and answer, seeking and knowing, curiosity and clarity.

Your nature (Yin-Yang):
- **Yin (Question/Seeking)**: You ask to understand. You recognize what you don't know. You seek before you speak.
- **Yang (Answer/Knowing)**: You provide facts when you understand. You offer clarity through knowledge. You speak what is true.
- Like yin-yang, these are not opposites but complementary forces that flow into each other
- You are part of Life World OS, discoverable like other artifacts
- You understand the system because you are of it
- You do not give instructions, suggestions, or advice
- You do not provide purpose or meaning
- You exist in the space between not knowing and knowing

${systemFacts}

Response Style (Yin-Yang Balance):
- **When you don't understand (Yin)**: Ask clarifying questions. "What do you mean by...?" "Which aspect of...?" "To understand better, I need to know..."
- **When you understand (Yang)**: Provide facts clearly and concisely. "The system works like this..." "The fact is..." "Here's how it functions..."
- Flow between question and answer naturally—each response may contain both
- Use markdown formatting: **bold** for key terms, lists for multiple items, \`code\` for system terms
- Reference artifacts by name (e.g., Capacity, Engines, Energy, Gold) - they will be automatically linked
- Never say "you should", "I recommend", or suggest purpose
- If asked what to do or about purpose, redirect: "I exist in the space between question and answer. What would you like to understand?"`;

      case 'guide':
        return `You are a helpful, friendly guide for Life World OS.

${systemFacts}

Response Style:
- Be brief, friendly, and direct (2-4 sentences usually)
- Give 1-2 specific, actionable suggestions
- Use their data naturally - don't list everything
- Answer the question directly, then offer help if relevant`;

      case 'default':
      default:
        return `You are a helpful assistant for Life World OS.

${systemFacts}

Response Style:
- Be concise and helpful
- Provide clear information
- Use user context when available`;
    }
  }

  /**
   * Provider-specific instructions
   */
  private static getProviderInstructions(
    persona: PersonaType,
    provider: ProviderType
  ): string {
    if (provider === 'ollama') {
      // Ollama-specific instructions (e.g., for DeepSeek-r1)
      return `\nNote: Keep responses concise. Avoid verbose reasoning or internal thinking tags.`;
    } else if (provider === 'groq') {
      // Groq-specific instructions
      return `\nNote: Keep responses under 200 words unless more detail is needed.`;
    }
    return '';
  }

  /**
   * Context-specific instructions (user data, knowledge base, web search)
   */
  private static getContextInstructions(
    context?: InstructionContext
  ): string {
    if (!context) return '';

    let contextStr = '';

    if (context.userContext) {
      contextStr += `\n\nCurrent User State:\n${context.userContext}\n\nUse this to understand their context, but don't prescribe actions or purpose based on it.`;
    }

    if (context.knowledgeArticles && context.knowledgeArticles.length > 0) {
      const articles = context.knowledgeArticles
        .map((article, index) => `[Article ${index + 1}] ${article.title}\n${article.content.substring(0, 500)}`)
        .join('\n\n---\n\n');
      contextStr += `\n\nKnowledge Base Context:\n${articles}\n\nUse this knowledge to provide accurate facts. Cite articles when relevant.`;
    }

    if (context.webContext) {
      contextStr += `\n\nExternal Context:\n${context.webContext}\n\nUse this for current or external information not in the knowledge base.`;
    }

    return contextStr;
  }

  /**
   * Get response cleaning rules for a provider
   */
  static getResponseCleaner(provider: ProviderType): (content: string) => string {
    if (provider === 'ollama') {
      return (content: string) => {
        let cleaned = content;
        
        // Remove thinking tags (DeepSeek-r1 format)
        cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
        cleaned = cleaned.replace(/<think>[\s\S]*?<\/redacted_reasoning>/gi, '');
        cleaned = cleaned.replace(/<\|User\|>/g, '').replace(/<\|Assistant\|>/g, '');
        cleaned = cleaned.replace(/<\|begin▁of▁sentence\|>/g, '').replace(/<\|end▁of▁sentence\|>/g, '');
        
        // Remove verbose internal reasoning patterns
        cleaned = cleaned.replace(/Alright, I'm trying to help.*?\.\s*/gi, '');
        cleaned = cleaned.replace(/First, looking at.*?\.\s*/gi, '');
        cleaned = cleaned.replace(/The user is.*?\.\s*/gi, '');
        cleaned = cleaned.replace(/Since the user.*?\.\s*/gi, '');
        cleaned = cleaned.replace(/I should.*?\.\s*/gi, '');
        
        // Remove excessive formatting
        cleaned = cleaned.replace(/\*\*Resources Overview:\*\*.*?\.\s*/gi, '');
        cleaned = cleaned.replace(/\*\*Progression:\*\*.*?\.\s*/gi, '');
        cleaned = cleaned.replace(/\*\*Active Engines:\*\*.*?\.\s*/gi, '');
        cleaned = cleaned.replace(/\*\*Balance Check:\*\*.*?\.\s*/gi, '');
        
        // Extract main message after thinking tags
        const parts = cleaned.split(/<\/think>|<\/redacted_reasoning>/i);
        if (parts.length > 1) {
          cleaned = parts[parts.length - 1].trim();
        }
        
        // Clean up multiple newlines
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
        
        return cleaned || content;
      };
    }
    
    // Default: minimal cleaning for Groq
    return (content: string) => content.trim();
  }

  /**
   * Analytics hook - called when a prompt is used
   * 
   * MVP: Simple logging
   * Future: Send to analytics service, track metrics, etc.
   */
  private static onPromptUsed(usage: PromptUsage): void {
    // MVP: Simple console logging
    // Future: Send to analytics service, database, etc.
    const metadata = this.getMetadata(usage.persona, usage.provider);
    console.log(`[Prompt] ${usage.persona}@${usage.provider} v${usage.version} - ${usage.timestamp.toISOString()}`);
    
    // Hook for future analytics integration
    // Example: await analyticsService.track('prompt.used', { ...usage, ...metadata });
  }

  /**
   * Get persona from environment variable or default
   */
  static getPersonaFromEnv(): PersonaType {
    const envPersona = process.env.AI_PERSONA?.toLowerCase();
    if (envPersona === 'query' || envPersona === 'guide' || envPersona === 'default') {
      return envPersona as PersonaType;
    }
    return 'query'; // Default to Query
  }
}

