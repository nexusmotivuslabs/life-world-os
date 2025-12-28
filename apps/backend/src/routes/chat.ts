import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { aiService } from '../services/aiService.js';
import { decisionEngine, SystemState } from '../services/decisionEngine.js';
import { policyChecker } from '../services/policyChecker.js';
import { actionExecutor } from '../services/actionExecutor.js';
import { calculateCategoryLevel } from '../services/rankService.js';
import { calculateBalance } from '../services/balanceService.js';
import { getXPForNextRank, getRankProgress } from '../services/rankService.js';
import { ensureDailyTick } from '../services/tickService.js';
import { getEffectiveEnergy } from '../services/energyService.js';
import { isInBurnout } from '../services/burnoutService.js';
import { trackQueryRequest } from '../services/queryMetrics.js';
import { CustomInstructions } from '../services/customInstructions.js';
import { logger } from '../lib/logger.js'

const router = express.Router();

/**
 * Format user dashboard data as context string for AI
 */
function formatUserContext(dashboardData: any): string {
  const { user, season, clouds, resources, xp, balance, engines, isInBurnout } = dashboardData;

  const contextParts: string[] = [];

  // User info
  contextParts.push(`- Rank: ${user.overallRank}, Level ${user.overallLevel}, ${user.overallXP} XP`);
  if (user.xpForNextRank !== null) {
    contextParts.push(`- Progress to next rank: ${user.progressToNextRank.toFixed(1)}% (${user.xpForNextRank} XP needed)`);
  }

  // Resources
  contextParts.push(`- Resources: ${resources.oxygen} Oxygen, ${resources.water} Water, ${resources.gold} Gold, ${resources.armor} Armor, ${resources.keys} Keys`);
  contextParts.push(`- Energy: ${resources.energy}/${resources.energyCap} (usable: ${resources.usableEnergy})`);

  // Season
  contextParts.push(`- Current Season: ${season.season} (Day ${season.daysInSeason})`);

  // Clouds
  contextParts.push(`- Clouds: Capacity ${clouds.capacity}%, Engines ${clouds.engines}%, Oxygen ${clouds.oxygen}%, Meaning ${clouds.meaning}%, Optionality ${clouds.optionality}%`);

  // XP Categories
  contextParts.push(`- XP Categories: Capacity L${xp.categoryLevels.capacity} (${xp.category.capacity} XP), Engines L${xp.categoryLevels.engines} (${xp.category.engines} XP), Oxygen L${xp.categoryLevels.oxygen} (${xp.category.oxygen} XP), Meaning L${xp.categoryLevels.meaning} (${xp.category.meaning} XP), Optionality L${xp.categoryLevels.optionality} (${xp.category.optionality} XP)`);

  // Engines
  if (engines && engines.length > 0) {
    const engineList = engines.map((e: any) => `${e.name} (${e.type}, Output: ${e.currentOutput})`).join(', ');
    contextParts.push(`- Active Engines: ${engineList}`);
  } else {
    contextParts.push(`- Active Engines: None`);
  }

  // Balance
  if (balance) {
    const balanceStatus = balance.isBalanced ? 'Balanced' : 'Unbalanced';
    contextParts.push(`- Balance: ${balanceStatus}`);
    if (balance.warnings && balance.warnings.length > 0) {
      contextParts.push(`- Warnings: ${balance.warnings.join(', ')}`);
    }
    if (balance.recommendations && balance.recommendations.length > 0) {
      contextParts.push(`- Recommendations: ${balance.recommendations.join(', ')}`);
    }
  }

  // Burnout
  if (isInBurnout) {
    contextParts.push(`- Status: In Burnout (energy cap reduced)`);
  }

  return contextParts.join('\n');
}

/**
 * Fetch user dashboard data
 */
async function fetchUserDashboardData(userId: string): Promise<any | null> {
  try {
    // Ensure daily tick is applied
    await ensureDailyTick(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cloud: true,
        resources: true,
        xp: true,
        engines: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!user || !user.cloud || !user.resources || !user.xp) {
      return null;
    }

    // Check burnout status
    const userIsInBurnout = await isInBurnout(userId);

    // Calculate usable energy
    const currentEnergy = user.resources.energy ?? 100;
    const usableEnergy = getEffectiveEnergy(currentEnergy, user.cloud.capacityStrength, userIsInBurnout);

    const daysInSeason = Math.floor(
      (Date.now() - user.seasonStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const categoryLevels = {
      capacity: calculateCategoryLevel(user.xp.capacityXP),
      engines: calculateCategoryLevel(user.xp.enginesXP),
      oxygen: calculateCategoryLevel(user.xp.oxygenXP),
      meaning: calculateCategoryLevel(user.xp.meaningXP),
      optionality: calculateCategoryLevel(user.xp.optionalityXP),
    };

    const balance = calculateBalance({
      capacity: user.xp.capacityXP,
      engines: user.xp.enginesXP,
      oxygen: user.xp.oxygenXP,
      meaning: user.xp.meaningXP,
      optionality: user.xp.optionalityXP,
    });

    const xpForNext = getXPForNextRank(user.overallRank, user.overallXP);
    const progress = getRankProgress(user.overallRank, user.overallXP);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        overallXP: user.overallXP,
        overallRank: user.overallRank,
        overallLevel: user.overallLevel,
        xpForNextRank: xpForNext,
        progressToNextRank: progress,
        isAdmin: user.isAdmin,
      },
      season: {
        season: user.currentSeason,
        startDate: user.seasonStartDate,
        daysInSeason,
      },
      clouds: {
        capacity: user.cloud.capacityStrength,
        engines: user.cloud.enginesStrength,
        oxygen: user.cloud.oxygenStrength,
        meaning: user.cloud.meaningStrength,
        optionality: user.cloud.optionalityStrength,
      },
      resources: {
        oxygen: Number(user.resources.oxygen),
        water: user.resources.water,
        gold: Number(user.resources.gold),
        armor: user.resources.armor,
        keys: user.resources.keys,
        energy: currentEnergy,
        usableEnergy: usableEnergy,
        energyCap: usableEnergy,
      },
      isInBurnout: userIsInBurnout,
      xp: {
        overall: user.xp.overallXP,
        category: {
          capacity: user.xp.capacityXP,
          engines: user.xp.enginesXP,
          oxygen: user.xp.oxygenXP,
          meaning: user.xp.meaningXP,
          optionality: user.xp.optionalityXP,
        },
        categoryLevels,
      },
      balance,
      engines: user.engines.map((e) => ({
        id: e.id,
        type: e.type,
        name: e.name,
        description: e.description,
        fragilityScore: e.fragilityScore,
        currentOutput: Number(e.currentOutput),
        status: e.status,
      })),
    };
  } catch (error) {
    logger.error('Error fetching user dashboard data:', error);
    return null;
  }
}

// Send chat message
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.userId!;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    let session;
    if (sessionId) {
      session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: {},
        include: { messages: [] },
      });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'user',
        content: message,
      },
    });

    // Get chat history
    const history = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
    });

    // Fetch user dashboard data for context and system state
    let userContext: string | undefined;
    let systemState: SystemState | null = null;
    try {
      const dashboardData = await fetchUserDashboardData(userId);
      if (dashboardData) {
        userContext = formatUserContext(dashboardData);
        // Convert dashboard data to system state format
        systemState = {
          user: dashboardData.user,
          resources: dashboardData.resources,
          season: dashboardData.season,
          clouds: dashboardData.clouds,
          xp: dashboardData.xp,
          balance: dashboardData.balance,
          engines: dashboardData.engines,
          isInBurnout: dashboardData.isInBurnout,
        };
      }
    } catch (error) {
      logger.error('Error fetching user context:', error);
      // Continue without context if fetch fails
    }

    // MVP Architecture: Decision Engine → Policy Check → Execute or Reject
    let actionResult: any = null;
    let actionProposed = false;

    // Only run decision engine if explicitly enabled
    // Disabled by default to avoid breaking normal chat
    const enableDecisionEngine = process.env.ENABLE_DECISION_ENGINE === 'true';
    
    if (systemState && enableDecisionEngine) {
      try {
        // Step 1: Decision Engine - Propose action based on system state
        const proposedAction = await decisionEngine.proposeAction(
          message,
          systemState,
          history.map(msg => ({ role: msg.role, content: msg.content }))
        );

        actionProposed = proposedAction.actionType !== 'NONE';

        if (actionProposed) {
          // Step 2: Policy Check - Validate proposed action
          const policyCheck = await policyChecker.checkPolicy(
            proposedAction,
            systemState,
            userId
          );

          if (policyCheck.allowed) {
            // Step 3: Execute action
            const executionResult = await actionExecutor.execute(userId, proposedAction);
            actionResult = {
              proposed: proposedAction,
              policyCheck,
              execution: executionResult,
            };

            // Refresh system state after execution
            const updatedDashboardData = await fetchUserDashboardData(userId);
            if (updatedDashboardData) {
              systemState = {
                user: updatedDashboardData.user,
                resources: updatedDashboardData.resources,
                season: updatedDashboardData.season,
                clouds: updatedDashboardData.clouds,
                xp: updatedDashboardData.xp,
                balance: updatedDashboardData.balance,
                engines: updatedDashboardData.engines,
                isInBurnout: updatedDashboardData.isInBurnout,
              };
              userContext = formatUserContext(updatedDashboardData);
            }
          } else {
            // Action rejected by policy
            actionResult = {
              proposed: proposedAction,
              policyCheck,
              execution: null,
            };
          }
        }
      } catch (error) {
        logger.error('Error in decision engine flow:', error);
        // Continue with normal chat response if decision engine fails
        // Don't let decision engine errors break the chat
      }
    }

    // Generate AI response with context and action result
    const startTime = Date.now();
    let responseMessage = '';
    let queryError: { type: string; message: string } | undefined;
    
    // Get persona and provider for metrics
    const persona = CustomInstructions.getPersonaFromEnv();
    const provider = process.env.OLLAMA_URL ? 'ollama' : (process.env.GROQ_API_KEY ? 'groq' : 'unknown');
    
    try {
      if (actionResult && actionResult.execution?.success) {
        // Include action execution result in response
        responseMessage = await aiService.generateResponse(
          `${message}\n\n[Action executed: ${actionResult.proposed.actionType}]`,
          history.map(msg => ({ role: msg.role as 'user' | 'assistant' | 'system', content: msg.content })),
          userContext
        );
      } else if (actionResult && !actionResult.policyCheck.allowed) {
        // Action was rejected
        responseMessage = await aiService.generateResponse(
          `${message}\n\n[Action rejected: ${actionResult.policyCheck.reason}]`,
          history.map(msg => ({ role: msg.role as 'user' | 'assistant' | 'system', content: msg.content })),
          userContext
        );
      } else {
        // Normal chat response
        responseMessage = await aiService.generateResponse(
          message,
          history.map(msg => ({ role: msg.role as 'user' | 'assistant' | 'system', content: msg.content })),
          userContext
        );
      }
    } catch (aiError) {
      logger.error('AI Service error in chat route:', aiError);
      const errorDetails = aiError instanceof Error ? aiError.message : String(aiError);
      
      queryError = {
        type: errorDetails.includes('Ollama') ? 'provider_unavailable' : 
               errorDetails.includes('API key') ? 'auth_error' : 
               'unknown_error',
        message: errorDetails,
      };
      
      // Return a helpful error message instead of crashing
      if (errorDetails.includes('Ollama') || errorDetails.includes('Cannot connect')) {
        responseMessage = "I'm sorry, I cannot connect to Ollama. Please make sure Ollama is running locally. Install from https://ollama.ai and run 'ollama serve'.";
      } else if (errorDetails.includes('API key') || errorDetails.includes('GROQ')) {
        responseMessage = "I'm sorry, there's an issue with the AI service configuration. Please check your API keys.";
      } else {
        responseMessage = `I'm sorry, I'm having trouble generating a response. Error: ${errorDetails}. Please try again or check your AI service configuration.`;
      }
    }

    // Track Query metrics
    const responseTime = Date.now() - startTime;
    
    // Extract artifacts from response (simple detection)
    const artifactNames = ['Capacity', 'Engines', 'Oxygen', 'Meaning', 'Optionality', 'Energy', 'Water', 'Gold', 'Armor', 'Keys'];
    const detectedArtifacts = artifactNames.filter(artifact => 
      responseMessage.toLowerCase().includes(artifact.toLowerCase())
    );
    
    trackQueryRequest({
      persona,
      provider: provider as 'ollama' | 'groq',
      responseTime,
      tokens: undefined, // TODO: Extract from AI response if available
      error: queryError,
      artifacts: detectedArtifacts.length > 0 ? detectedArtifacts : undefined,
    });

    // Save assistant message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'assistant',
        content: responseMessage,
      },
    });

    res.json({
      response: responseMessage,
      sessionId: session.id,
      id: session.id,
      ...(actionResult && {
        action: {
          proposed: actionResult.proposed.actionType,
          allowed: actionResult.policyCheck.allowed,
          executed: actionResult.execution?.success || false,
          result: actionResult.execution?.data || null,
          rejectionReason: actionResult.policyCheck.reason || null,
        },
      }),
    });
  } catch (error) {
    logger.error('Error processing chat message:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Get chat history
router.get('/history/:sessionId', async (req, res) => {
  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: req.params.sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    logger.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

export default router;


