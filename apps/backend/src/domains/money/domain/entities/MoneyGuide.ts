/**
 * MoneyGuide Domain Entity
 * 
 * Pure business logic entity representing a step-by-step guide/workflow.
 * No infrastructure dependencies - pure TypeScript class.
 */

import { GuideCategory } from '@prisma/client'

export interface GuideStep {
  id: string
  title: string
  description: string
  instructions: string
  isOptional: boolean
  order: number
  conditions?: {
    // Conditions that must be met for this step to be available
    requiredSteps?: string[]
    requiredData?: string[]
  }
  completionCriteria?: {
    // What marks this step as complete
    type: 'manual' | 'data_check' | 'system_check'
    data?: Record<string, unknown>
  }
}

export class MoneyGuide {
  private constructor(
    public readonly id: string,
    public readonly agentId: string | null,
    public readonly teamId: string | null,
    public readonly title: string,
    public readonly description: string,
    public readonly steps: GuideStep[],
    public readonly category: GuideCategory,
    public readonly difficulty: number, // 1-5 scale
    public readonly estimatedTime: number | null, // minutes
    public readonly prerequisites: string[] | null,
    public readonly isTeamGuide: boolean
  ) {
    // Validate difficulty
    if (difficulty < 1 || difficulty > 5) {
      throw new Error('Difficulty must be between 1 and 5')
    }
  }

  /**
   * Create a new MoneyGuide entity
   */
  static create(
    id: string,
    title: string,
    description: string,
    steps: GuideStep[],
    category: GuideCategory,
    difficulty: number = 1,
    estimatedTime: number | null = null,
    prerequisites: string[] | null = null,
    agentId: string | null = null,
    teamId: string | null = null,
    isTeamGuide: boolean = false
  ): MoneyGuide {
    // Validate that either agentId or teamId is set, but not both
    if (agentId && teamId) {
      throw new Error('Guide cannot belong to both an agent and a team')
    }
    if (!agentId && !teamId) {
      throw new Error('Guide must belong to either an agent or a team')
    }

    return new MoneyGuide(
      id,
      agentId,
      teamId,
      title,
      description,
      steps,
      category,
      difficulty,
      estimatedTime,
      prerequisites,
      isTeamGuide
    )
  }

  /**
   * Create MoneyGuide from persisted data
   */
  static fromPersistence(data: {
    id: string
    agentId: string | null
    teamId: string | null
    title: string
    description: string
    steps: unknown // JSON from database
    category: GuideCategory
    difficulty: number
    estimatedTime: number | null
    prerequisites: unknown // JSON from database
    isTeamGuide: boolean
  }): MoneyGuide {
    // Parse steps from JSON
    const steps = Array.isArray(data.steps)
      ? (data.steps as GuideStep[])
      : JSON.parse(data.steps as string) as GuideStep[]

    // Parse prerequisites from JSON
    const prerequisites = data.prerequisites
      ? (Array.isArray(data.prerequisites)
          ? (data.prerequisites as string[])
          : JSON.parse(data.prerequisites as string) as string[])
      : null

    return new MoneyGuide(
      data.id,
      data.agentId,
      data.teamId,
      data.title,
      data.description,
      steps,
      data.category,
      data.difficulty,
      data.estimatedTime,
      prerequisites,
      data.isTeamGuide
    )
  }

  /**
   * Get the first step of the guide
   */
  getFirstStep(): GuideStep | null {
    if (this.steps.length === 0) {
      return null
    }

    const sortedSteps = [...this.steps].sort((a, b) => a.order - b.order)
    return sortedSteps[0]
  }

  /**
   * Get a specific step by ID
   */
  getStep(stepId: string): GuideStep | null {
    return this.steps.find(step => step.id === stepId) ?? null
  }

  /**
   * Get step by index (0-based)
   */
  getStepByIndex(index: number): GuideStep | null {
    const sortedSteps = [...this.steps].sort((a, b) => a.order - b.order)
    return sortedSteps[index] ?? null
  }

  /**
   * Get next step after a given step
   */
  getNextStep(currentStepId: string): GuideStep | null {
    const sortedSteps = [...this.steps].sort((a, b) => a.order - b.order)
    const currentIndex = sortedSteps.findIndex(step => step.id === currentStepId)

    if (currentIndex === -1 || currentIndex === sortedSteps.length - 1) {
      return null
    }

    return sortedSteps[currentIndex + 1]
  }

  /**
   * Get total number of steps
   */
  getTotalSteps(): number {
    return this.steps.length
  }

  /**
   * Check if a step can be accessed (conditions met)
   * Business logic: step availability check
   */
  canAccessStep(stepId: string, completedSteps: string[], context?: Record<string, unknown>): boolean {
    const step = this.getStep(stepId)
    if (!step) {
      return false
    }

    // Check if required steps are completed
    if (step.conditions?.requiredSteps) {
      const allRequiredCompleted = step.conditions.requiredSteps.every(
        requiredStepId => completedSteps.includes(requiredStepId)
      )
      if (!allRequiredCompleted) {
        return false
      }
    }

    // Check if required data is present in context
    if (step.conditions?.requiredData && context) {
      const allRequiredDataPresent = step.conditions.requiredData.every(
        dataKey => dataKey in context
      )
      if (!allRequiredDataPresent) {
        return false
      }
    }

    return true
  }

  /**
   * Check if guide prerequisites are met
   */
  prerequisitesMet(completedGuideIds: string[]): boolean {
    if (!this.prerequisites || this.prerequisites.length === 0) {
      return true
    }

    return this.prerequisites.every(prereqId => 
      completedGuideIds.includes(prereqId)
    )
  }
}





