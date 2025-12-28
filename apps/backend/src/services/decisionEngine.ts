import { aiService } from './aiService.js';
import { ActivityType } from '../types/index.js';
import { logger } from '../lib/logger.js'

export interface SystemState {
  user: {
    overallRank: string;
    overallLevel: number;
    overallXP: number;
    xpForNextRank: number | null;
    progressToNextRank: number;
  };
  resources: {
    oxygen: number;
    water: number;
    gold: number;
    armor: number;
    keys: number;
    energy: number;
    usableEnergy: number;
    energyCap: number;
  };
  season: {
    season: string;
    daysInSeason: number;
  };
  clouds: {
    capacity: number;
    engines: number;
    oxygen: number;
    meaning: number;
    optionality: number;
  };
  xp: {
    overall: number;
    category: {
      capacity: number;
      engines: number;
      oxygen: number;
      meaning: number;
      optionality: number;
    };
    categoryLevels: {
      capacity: number;
      engines: number;
      oxygen: number;
      meaning: number;
      optionality: number;
    };
  };
  balance: {
    isBalanced: boolean;
    warnings?: string[];
    recommendations?: string[];
  };
  engines: Array<{
    id: string;
    type: string;
    name: string;
    currentOutput: number;
  }>;
  isInBurnout?: boolean;
}

export interface ProposedAction {
  actionType: 'RECORD_ACTIVITY' | 'UPDATE_RESOURCES' | 'NONE';
  activityType?: ActivityType;
  description?: string;
  resourceChanges?: {
    oxygen?: number;
    water?: number;
    gold?: number;
    armor?: number;
    keys?: number;
  };
  customXP?: {
    overall?: number;
    category?: {
      capacity?: number;
      engines?: number;
      oxygen?: number;
      meaning?: number;
      optionality?: number;
    };
  };
  reasoning: string;
  confidence: number; // 0-1
}

/**
 * Decision Engine
 * Uses AI to propose actions based on system state
 */
export class DecisionEngine {
  /**
   * Propose an action based on system state and user message
   */
  async proposeAction(
    userMessage: string,
    systemState: SystemState,
    chatHistory: Array<{ role: string; content: string }>
  ): Promise<ProposedAction> {
    const stateJson = JSON.stringify(systemState, null, 2);
    
    const decisionPrompt = `You are a decision engine for Life World OS. Analyze the user's request and current system state, then propose an action.

Current System State:
${stateJson}

Available Actions:
- RECORD_ACTIVITY: Record an activity (WORK_PROJECT, EXERCISE, SAVE_EXPENSES, LEARNING, REST, CUSTOM)
- UPDATE_RESOURCES: Update resources directly (oxygen, water, gold, armor, keys)
- NONE: No action needed, just provide information

Rules:
1. Only propose actions if the user explicitly requests them or it's clearly beneficial
2. Check energy requirements (activities cost energy)
3. Respect burnout state (no WORK_PROJECT during burnout)
4. Consider current season for optimal actions
5. Balance recommendations based on XP categories

Respond with ONLY a valid JSON object in this exact format:
{
  "actionType": "RECORD_ACTIVITY" | "UPDATE_RESOURCES" | "NONE",
  "activityType": "WORK_PROJECT" | "EXERCISE" | "SAVE_EXPENSES" | "LEARNING" | "REST" | "CUSTOM" (only if actionType is RECORD_ACTIVITY),
  "description": "Brief description of the action",
  "resourceChanges": { "oxygen": 0, "water": 0, "gold": 0, "armor": 0, "keys": 0 } (only if actionType is UPDATE_RESOURCES or RECORD_ACTIVITY with resource changes),
  "customXP": { "overall": 0, "category": { "capacity": 0, "engines": 0, "oxygen": 0, "meaning": 0, "optionality": 0 } } (optional, only for CUSTOM activities),
  "reasoning": "Why this action is proposed",
  "confidence": 0.0-1.0
}

If no action is needed, use:
{
  "actionType": "NONE",
  "reasoning": "Explanation",
  "confidence": 1.0
}

User Message: ${userMessage}`;

    try {
      const response = await aiService.generateResponse(
        decisionPrompt,
        chatHistory,
        undefined // Don't add user context again, it's in systemState
      );

      // Extract JSON from response (handle markdown code blocks and other formatting)
      let jsonStr = response.trim();
      
      // Remove markdown code blocks
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
      }
      
      // Remove any leading/trailing text before/after JSON
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      let proposedAction: ProposedAction;
      try {
        proposedAction = JSON.parse(jsonStr);
      } catch (parseError) {
        logger.error('Failed to parse action proposal JSON:', jsonStr);
        return {
          actionType: 'NONE',
          reasoning: 'Failed to parse action proposal',
          confidence: 0,
        };
      }

      // Validate structure
      if (!proposedAction.actionType || !proposedAction.reasoning) {
        return {
          actionType: 'NONE',
          reasoning: 'Invalid action proposal format',
          confidence: 0,
        };
      }

      return proposedAction;
    } catch (error) {
      logger.error('Decision engine error:', error);
      return {
        actionType: 'NONE',
        reasoning: 'Failed to generate action proposal',
        confidence: 0,
      };
    }
  }
}

export const decisionEngine = new DecisionEngine();

