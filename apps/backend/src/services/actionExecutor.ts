import { ProposedAction } from './decisionEngine.js';
import { prisma } from '../lib/prisma.js';
import { ActivityType } from '../types/index.js';

export interface ExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Action Executor
 * Executes validated actions
 */
export class ActionExecutor {
  /**
   * Execute a RECORD_ACTIVITY action
   */
  async executeRecordActivity(
    userId: string,
    action: ProposedAction
  ): Promise<ExecutionResult> {
    try {
      if (!action.activityType) {
        return {
          success: false,
          message: 'Activity type is required',
          error: 'Missing activityType',
        };
      }

      // Call the existing XP activity endpoint logic
      // We'll need to import the logic or make an internal call
      const response = await fetch(`http://localhost:${process.env.PORT || 3001}/api/xp/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: In production, we'd need to pass auth token or use internal service
        },
        body: JSON.stringify({
          activityType: action.activityType,
          description: action.description,
          customXP: action.customXP,
          resourceChanges: action.resourceChanges,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.error || 'Failed to record activity',
          error: error.error,
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: `Activity recorded: ${action.activityType}`,
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to execute activity',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Execute a RECORD_ACTIVITY action (internal, direct database access)
   */
  async executeRecordActivityInternal(
    userId: string,
    action: ProposedAction
  ): Promise<ExecutionResult> {
    try {
      if (!action.activityType) {
        return {
          success: false,
          message: 'Activity type is required',
          error: 'Missing activityType',
        };
      }

      // Import required services
      const { ensureDailyTick } = await import('./tickService.js');
      const { getActionEnergyCost, getEffectiveEnergy } = await import('./energyService.js');
      const { isInBurnout, getBurnoutXPModifier } = await import('./burnoutService.js');
      const { calculateXP } = await import('./xpCalculator.js');
      const { calculateOverallRank, calculateOverallLevel } = await import('./rankService.js');
      const { applyCapacityModifierToXP, applyCapacityModifierToReward } = await import('./capacityModifierService.js');
      const { getActiveLoadoutBonuses, applyLoadoutEnergyReduction, applyLoadoutXPModifier } = await import('./loadoutBonusService.js');
      const { checkMilestones } = await import('./milestoneService.js');
      const { Prisma } = await import('@prisma/client');

      await ensureDailyTick(userId);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          resources: true,
          xp: true,
          cloud: true,
        },
      });

      if (!user || !user.resources || !user.xp || !user.cloud) {
        return {
          success: false,
          message: 'User data not found',
          error: 'User or data not found',
        };
      }

      const userIsInBurnout = await isInBurnout(userId);

      if (userIsInBurnout && action.activityType === ActivityType.WORK_PROJECT) {
        return {
          success: false,
          message: 'Cannot perform Work Project actions while in burnout',
          error: 'Burnout restriction',
        };
      }

      let energyCost = getActionEnergyCost(action.activityType);
      const loadoutBonuses = await getActiveLoadoutBonuses(userId);
      energyCost = applyLoadoutEnergyReduction(energyCost, loadoutBonuses.energyCostReduction);

      const currentEnergy = user.resources.energy ?? 100;
      const capacity = user.cloud.capacityStrength;
      const usableEnergy = getEffectiveEnergy(currentEnergy, capacity, userIsInBurnout);

      if (usableEnergy < energyCost) {
        return {
          success: false,
          message: `Insufficient energy. Required: ${energyCost}, Available: ${usableEnergy}`,
          error: 'Insufficient energy',
        };
      }

      const isRecoveryAction = action.activityType === ActivityType.REST;
      const baseCalculation = calculateXP(action.activityType, user.currentSeason, action.customXP);

      let modifiedOverallXP = isRecoveryAction ? 0 : applyCapacityModifierToXP(baseCalculation.overallXP, capacity);
      let modifiedCategoryXP = isRecoveryAction
        ? { capacity: 0, engines: 0, oxygen: 0, meaning: 0, optionality: 0 }
        : {
            capacity: applyCapacityModifierToXP(baseCalculation.categoryXP.capacity, capacity),
            engines: applyCapacityModifierToXP(baseCalculation.categoryXP.engines, capacity),
            oxygen: applyCapacityModifierToXP(baseCalculation.categoryXP.oxygen, capacity),
            meaning: applyCapacityModifierToXP(baseCalculation.categoryXP.meaning, capacity),
            optionality: applyCapacityModifierToXP(baseCalculation.categoryXP.optionality, capacity),
          };

      if (!isRecoveryAction && loadoutBonuses.xpGain) {
        modifiedOverallXP = applyLoadoutXPModifier(modifiedOverallXP, loadoutBonuses.xpGain);
        modifiedCategoryXP = {
          capacity: applyLoadoutXPModifier(modifiedCategoryXP.capacity, loadoutBonuses.xpGain),
          engines: applyLoadoutXPModifier(modifiedCategoryXP.engines, loadoutBonuses.xpGain),
          oxygen: applyLoadoutXPModifier(modifiedCategoryXP.oxygen, loadoutBonuses.xpGain),
          meaning: applyLoadoutXPModifier(modifiedCategoryXP.meaning, loadoutBonuses.xpGain),
          optionality: applyLoadoutXPModifier(modifiedCategoryXP.optionality, loadoutBonuses.xpGain),
        };
      }

      if (userIsInBurnout && !isRecoveryAction) {
        const burnoutModifier = await getBurnoutXPModifier(userId);
        modifiedOverallXP = Math.round(modifiedOverallXP * burnoutModifier);
        modifiedCategoryXP = {
          capacity: Math.round(modifiedCategoryXP.capacity * burnoutModifier),
          engines: Math.round(modifiedCategoryXP.engines * burnoutModifier),
          oxygen: Math.round(modifiedCategoryXP.oxygen * burnoutModifier),
          meaning: Math.round(modifiedCategoryXP.meaning * burnoutModifier),
          optionality: Math.round(modifiedCategoryXP.optionality * burnoutModifier),
        };
      }

      const newOverallXP = isRecoveryAction ? user.xp.overallXP : user.xp.overallXP + modifiedOverallXP;
      const newRank = isRecoveryAction ? user.overallRank : calculateOverallRank(newOverallXP);
      const newLevel = isRecoveryAction ? user.overallLevel : calculateOverallLevel(newOverallXP);

      const newEnergy = Math.max(0, currentEnergy - energyCost);

      const modifiedResourceChanges = action.resourceChanges
        ? {
            oxygen: action.resourceChanges.oxygen !== undefined
              ? applyCapacityModifierToReward(action.resourceChanges.oxygen, capacity)
              : undefined,
            water: action.resourceChanges.water !== undefined
              ? applyCapacityModifierToReward(action.resourceChanges.water, capacity)
              : undefined,
            gold: action.resourceChanges.gold !== undefined
              ? applyCapacityModifierToReward(action.resourceChanges.gold, capacity)
              : undefined,
            armor: action.resourceChanges.armor !== undefined
              ? Math.round(applyCapacityModifierToReward(action.resourceChanges.armor, capacity))
              : undefined,
            keys: action.resourceChanges.keys !== undefined
              ? Math.round(applyCapacityModifierToReward(action.resourceChanges.keys, capacity))
              : undefined,
          }
        : undefined;

      await prisma.$transaction(async (tx) => {
        if (!isRecoveryAction) {
          await tx.xP.update({
            where: { userId },
            data: {
              overallXP: newOverallXP,
              overallRank: newRank,
              overallLevel: newLevel,
              capacityXP: user.xp.capacityXP + modifiedCategoryXP.capacity,
              enginesXP: user.xp.enginesXP + modifiedCategoryXP.engines,
              oxygenXP: user.xp.oxygenXP + modifiedCategoryXP.oxygen,
              meaningXP: user.xp.meaningXP + modifiedCategoryXP.meaning,
              optionalityXP: user.xp.optionalityXP + modifiedCategoryXP.optionality,
            },
          });

          await tx.user.update({
            where: { id: userId },
            data: {
              overallXP: newOverallXP,
              overallRank: newRank,
              overallLevel: newLevel,
            },
          });
        } else {
          await tx.user.update({
            where: { id: userId },
            data: {
              lastRecoveryActionAt: new Date(),
            },
          });
        }

        await tx.resources.update({
          where: { userId },
          data: {
            energy: newEnergy,
            ...(modifiedResourceChanges?.oxygen !== undefined && {
              oxygen: new Prisma.Decimal(user.resources.oxygen.toNumber() + modifiedResourceChanges.oxygen),
            }),
            ...(modifiedResourceChanges?.water !== undefined && {
              water: modifiedResourceChanges.water,
            }),
            ...(modifiedResourceChanges?.gold !== undefined && {
              gold: new Prisma.Decimal(user.resources.gold.toNumber() + modifiedResourceChanges.gold),
            }),
            ...(modifiedResourceChanges?.armor !== undefined && {
              armor: modifiedResourceChanges.armor,
            }),
            ...(modifiedResourceChanges?.keys !== undefined && {
              keys: user.resources.keys + modifiedResourceChanges.keys,
            }),
          },
        });

        await tx.activityLog.create({
          data: {
            userId,
            activityType: action.activityType!,
            overallXPGained: modifiedOverallXP,
            categoryXPGain: modifiedCategoryXP,
            resourceChanges: modifiedResourceChanges || null,
            seasonContext: user.currentSeason,
            seasonMultiplier: baseCalculation.seasonMultiplier,
            description: action.description || null,
          },
        });
      });

      const milestones = await checkMilestones(userId);

      return {
        success: true,
        message: `Activity recorded: ${action.activityType}`,
        data: {
          xpGained: {
            overallXP: modifiedOverallXP,
            categoryXP: modifiedCategoryXP,
            seasonMultiplier: baseCalculation.seasonMultiplier,
          },
          newOverallXP,
          newRank,
          newLevel,
          milestones,
          energyUsed: energyCost,
          remainingEnergy: newEnergy,
        },
      };
    } catch (error) {
      console.error('Action execution error:', error);
      return {
        success: false,
        message: 'Failed to execute activity',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Execute an UPDATE_RESOURCES action
   */
  async executeUpdateResources(
    userId: string,
    action: ProposedAction
  ): Promise<ExecutionResult> {
    try {
      if (!action.resourceChanges) {
        return {
          success: false,
          message: 'Resource changes are required',
          error: 'Missing resourceChanges',
        };
      }

      const current = await prisma.resources.findUnique({
        where: { userId },
      });

      if (!current) {
        return {
          success: false,
          message: 'Resources not found',
          error: 'Resources not found',
        };
      }

      const { Prisma } = await import('@prisma/client');

      const updated = await prisma.resources.update({
        where: { userId },
        data: {
          oxygen: action.resourceChanges.oxygen !== undefined
            ? new Prisma.Decimal(current.oxygen.toNumber() + action.resourceChanges.oxygen)
            : undefined,
          water: action.resourceChanges.water !== undefined
            ? action.resourceChanges.water
            : undefined,
          gold: action.resourceChanges.gold !== undefined
            ? new Prisma.Decimal(current.gold.toNumber() + action.resourceChanges.gold)
            : undefined,
          armor: action.resourceChanges.armor !== undefined
            ? action.resourceChanges.armor
            : undefined,
          keys: action.resourceChanges.keys !== undefined
            ? current.keys + action.resourceChanges.keys
            : undefined,
        },
      });

      return {
        success: true,
        message: 'Resources updated successfully',
        data: {
          oxygen: Number(updated.oxygen),
          water: updated.water,
          gold: Number(updated.gold),
          armor: updated.armor,
          keys: updated.keys,
        },
      };
    } catch (error) {
      console.error('Resource update error:', error);
      return {
        success: false,
        message: 'Failed to update resources',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Execute a proposed action
   */
  async execute(
    userId: string,
    action: ProposedAction
  ): Promise<ExecutionResult> {
    if (action.actionType === 'NONE') {
      return {
        success: true,
        message: 'No action to execute',
      };
    }

    if (action.actionType === 'RECORD_ACTIVITY') {
      return await this.executeRecordActivityInternal(userId, action);
    }

    if (action.actionType === 'UPDATE_RESOURCES') {
      return await this.executeUpdateResources(userId, action);
    }

    return {
      success: false,
      message: 'Unknown action type',
      error: `Unknown action type: ${action.actionType}`,
    };
  }
}

export const actionExecutor = new ActionExecutor();

