import { ProposedAction, SystemState } from './decisionEngine.js';
import { ActivityType } from '../types/index.js';
import { getActionEnergyCost } from './energyService.js';
import { getEffectiveEnergy } from './energyService.js';
import { isInBurnout } from './burnoutService.js';

export interface PolicyCheckResult {
  allowed: boolean;
  reason?: string;
  energyRequired?: number;
  energyAvailable?: number;
}

/**
 * Policy Checker
 * Validates proposed actions against system rules
 */
export class PolicyChecker {
  /**
   * Check if a proposed action is allowed
   */
  async checkPolicy(
    action: ProposedAction,
    systemState: SystemState,
    userId: string
  ): Promise<PolicyCheckResult> {
    // NONE actions are always allowed
    if (action.actionType === 'NONE') {
      return { allowed: true };
    }

    // Check RECORD_ACTIVITY actions
    if (action.actionType === 'RECORD_ACTIVITY') {
      if (!action.activityType) {
        return {
          allowed: false,
          reason: 'Activity type is required for RECORD_ACTIVITY',
        };
      }

      // Check burnout restrictions
      if (systemState.isInBurnout && action.activityType === ActivityType.WORK_PROJECT) {
        return {
          allowed: false,
          reason: 'Cannot perform Work Project actions while in burnout. Recovery actions (Exercise, Learning, Save Expenses) are required.',
        };
      }

      // Check energy requirements
      const energyCost = getActionEnergyCost(action.activityType);
      const usableEnergy = systemState.resources.usableEnergy;

      if (usableEnergy < energyCost) {
        return {
          allowed: false,
          reason: `Insufficient energy. Required: ${energyCost}, Available: ${usableEnergy}`,
          energyRequired: energyCost,
          energyAvailable: usableEnergy,
        };
      }

      return {
        allowed: true,
        energyRequired: energyCost,
        energyAvailable: usableEnergy,
      };
    }

    // Check UPDATE_RESOURCES actions
    if (action.actionType === 'UPDATE_RESOURCES') {
      if (!action.resourceChanges) {
        return {
          allowed: false,
          reason: 'Resource changes are required for UPDATE_RESOURCES',
        };
      }

      // Validate resource constraints
      const { water, armor, keys } = action.resourceChanges;
      
      // Water must be 0-100
      if (water !== undefined) {
        const newWater = systemState.resources.water + (water || 0);
        if (newWater < 0 || newWater > 100) {
          return {
            allowed: false,
            reason: `Water must be between 0 and 100. Current: ${systemState.resources.water}, Change: ${water}, Result: ${newWater}`,
          };
        }
      }

      // Armor must be 0-100
      if (armor !== undefined) {
        const newArmor = systemState.resources.armor + (armor || 0);
        if (newArmor < 0 || newArmor > 100) {
          return {
            allowed: false,
            reason: `Armor must be between 0 and 100. Current: ${systemState.resources.armor}, Change: ${armor}, Result: ${newArmor}`,
          };
        }
      }

      // Keys cannot be negative
      if (keys !== undefined) {
        const newKeys = systemState.resources.keys + (keys || 0);
        if (newKeys < 0) {
          return {
            allowed: false,
            reason: `Keys cannot be negative. Current: ${systemState.resources.keys}, Change: ${keys}, Result: ${newKeys}`,
          };
        }
      }

      return { allowed: true };
    }

    return {
      allowed: false,
      reason: 'Unknown action type',
    };
  }
}

export const policyChecker = new PolicyChecker();




