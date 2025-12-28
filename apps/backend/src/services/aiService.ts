import dotenv from 'dotenv';
import { OllamaLMAdapter } from '../domains/money/infrastructure/adapters/llm/OllamaLMAdapter.js';

dotenv.config();

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

type AIProvider = 'ollama' | 'groq';

/**
 * Select AI provider based on environment variables
 * Priority: Ollama (local) > Groq (dev)
 */
function selectProvider(): AIProvider | null {
  if (process.env.OLLAMA_URL) {
    return 'ollama';
  }
  if (process.env.GROQ_API_KEY) {
    return 'groq';
  }
  return null;
}

/**
 * Generate response using Ollama
 */
async function generateWithOllama(
  userMessage: string,
  history: ChatMessage[],
  userContext?: string
): Promise<string> {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'llama3.2';
  
  const systemPrompt = `You are a helpful guide for the Life World Operating System. Life World OS is a gamified life management system that helps users allocate effort, energy, and resources sustainably across time using game mechanics.

The system includes:
- 🌥️ Clouds of Life: Five persistent background systems (Capacity, Engines, Oxygen, Meaning, Optionality)
- 🍂 Seasons of Life: Four cyclical modes (Spring, Summer, Autumn, Winter)
- 💎 Resources: Oxygen, Water, Gold, Armor, and Keys
- ⚙️ Engines: Career, Business, Investment, and Learning engines
- 🎮 XP System: Overall rank and category XP progression

${userContext ? `\n\nCurrent User Status:\n${userContext}\n\nUse this information to provide personalized answers about the user's current state, resources, progress, and recommendations.` : ''}

Provide helpful, accurate answers about the Life World OS system, game mechanics, and how to optimize life management. Be conversational and friendly. If you don't know something, say so.`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.slice(-10).map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  try {
    const adapter = new OllamaLMAdapter(ollamaUrl, model);
    const response = await adapter.generateResponse(messages, {
      temperature: 0.7,
      maxTokens: 1000,
    });
    return response.content;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Cannot connect to Ollama')) {
      return "I'm sorry, I cannot connect to Ollama. Please make sure Ollama is running locally. Install from https://ollama.ai and run 'ollama serve'.";
    }
    throw error;
  }
}

/**
 * Generate response using Groq
 */
async function generateWithGroq(
  userMessage: string,
  history: ChatMessage[],
  userContext?: string
): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY not found in environment variables');
  }

  const systemPrompt = `You are a helpful guide for the Life World Operating System. Life World OS is a gamified life management system that helps users allocate effort, energy, and resources sustainably across time using game mechanics.

The system includes:
- 🌥️ Clouds of Life: Five persistent background systems (Capacity, Engines, Oxygen, Meaning, Optionality)
- 🍂 Seasons of Life: Four cyclical modes (Spring, Summer, Autumn, Winter)
- 💎 Resources: Oxygen, Water, Gold, Armor, and Keys
- ⚙️ Engines: Career, Business, Investment, and Learning engines
- 🎮 XP System: Overall rank and category XP progression

${userContext ? `\n\nCurrent User Status:\n${userContext}\n\nUse this information to provide personalized answers about the user's current state, resources, progress, and recommendations.` : ''}

Provide helpful, accurate answers about the Life World OS system, game mechanics, and how to optimize life management. Be conversational and friendly. If you don't know something, say so.`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.slice(-10).map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  try {
    // Import GroqLMAdapter
    const { GroqLMAdapter } = await import('../domains/travel/infrastructure/adapters/llm/GroqLMAdapter.js');
    const adapter = new GroqLMAdapter(groqApiKey);
    const response = await adapter.generateResponse(messages, {
      temperature: 0.7,
      maxTokens: 2000,
      model: 'llama-3.1-8b-instant', // Fast Groq model
    });
    return response.content;
  } catch (error: any) {
    if (error.message?.includes('Groq SDK not installed')) {
      throw new Error('Groq SDK not installed. Please install it: npm install groq-sdk');
    }
    if (error.message?.includes('Invalid Groq API key')) {
      throw new Error('Invalid Groq API key. Get one from https://console.groq.com');
    }
    throw error;
  }
}

export const aiService = {
  async generateResponse(
    userMessage: string,
    history: ChatMessage[],
    userContext?: string
  ): Promise<string> {
    try {
      const provider = selectProvider();
      
      if (!provider) {
        return "I'm sorry, the AI service is not properly configured. Please set either OLLAMA_URL (for local) or GROQ_API_KEY (for dev) in your environment variables.";
      }

      if (provider === 'ollama') {
        return await generateWithOllama(userMessage, history, userContext);
      } else if (provider === 'groq') {
        return await generateWithGroq(userMessage, history, userContext);
      }

      // Fallback (should not reach here)
      throw new Error('No AI provider available');
    } catch (error) {
      console.error('AI Service error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Return user-friendly error messages
      if (errorMessage.includes('Cannot connect to Ollama')) {
        return "I'm sorry, I cannot connect to Ollama. Please make sure Ollama is running locally. Install from https://ollama.ai and run 'ollama serve'.";
      }
      if (errorMessage.includes('Invalid Groq API key')) {
        return "I'm sorry, there's an issue with the Groq API key. Please check your GROQ_API_KEY environment variable. Get a key from https://console.groq.com";
      }
      if (errorMessage.includes('Groq SDK not installed')) {
        return "I'm sorry, the Groq SDK is not installed. Please install it: npm install groq-sdk";
      }
      
      return `I'm sorry, I'm having trouble generating a response. Error: ${errorMessage}. Please check your AI provider configuration.`;
    }
  },
};


