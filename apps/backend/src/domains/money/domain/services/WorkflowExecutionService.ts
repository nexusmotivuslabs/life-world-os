/**
 * WorkflowExecutionService
 * 
 * Domain service for executing guide workflows step-by-step.
 * Pure business logic for workflow progression and validation.
 */

import { MoneyGuide, GuideStep } from '../entities/MoneyGuide.js'

export interface WorkflowState {
  guideId: string
  currentStepIndex: number
  completedSteps: string[] // step IDs
  context: Record<string, unknown>
}

export interface StepExecutionResult {
  step: GuideStep
  canProceed: boolean
  nextStep: GuideStep | null
  isComplete: boolean
  validationErrors?: string[]
}

export class WorkflowExecutionService {
  /**
   * Initialize workflow state
   */
  initializeWorkflow(guide: MoneyGuide): WorkflowState {
    return {
      guideId: guide.id,
      currentStepIndex: 0,
      completedSteps: [],
      context: {},
    }
  }

  /**
   * Get current step
   */
  getCurrentStep(guide: MoneyGuide, state: WorkflowState): GuideStep | null {
    return guide.getStepByIndex(state.currentStepIndex)
  }

  /**
   * Check if a step can be accessed
   */
  canAccessStep(
    guide: MoneyGuide,
    stepId: string,
    state: WorkflowState
  ): boolean {
    return guide.canAccessStep(stepId, state.completedSteps, state.context)
  }

  /**
   * Execute a step (validate and move forward)
   */
  executeStep(
    guide: MoneyGuide,
    state: WorkflowState,
    stepData?: Record<string, unknown>
  ): StepExecutionResult {
    const currentStep = this.getCurrentStep(guide, state)

    if (!currentStep) {
      return {
        step: currentStep!,
        canProceed: false,
        nextStep: null,
        isComplete: true,
        validationErrors: ['No current step available'],
      }
    }

    // Update context with step data
    if (stepData) {
      state.context = { ...state.context, ...stepData }
    }

    // Validate step completion criteria
    const validationErrors = this.validateStepCompletion(
      currentStep,
      state.context
    )

    const canProceed = validationErrors.length === 0

    if (canProceed) {
      // Mark step as completed
      if (!state.completedSteps.includes(currentStep.id)) {
        state.completedSteps.push(currentStep.id)
      }

      // Move to next step
      state.currentStepIndex += 1
    }

    const nextStep = guide.getStepByIndex(state.currentStepIndex)
    const isComplete = nextStep === null

    return {
      step: currentStep,
      canProceed,
      nextStep: nextStep ?? null,
      isComplete,
      validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
    }
  }

  /**
   * Validate step completion criteria
   */
  private validateStepCompletion(
    step: GuideStep,
    context: Record<string, unknown>
  ): string[] {
    const errors: string[] = []

    if (!step.completionCriteria) {
      return errors // No validation needed
    }

    const criteria = step.completionCriteria

    switch (criteria.type) {
      case 'manual':
        // Manual completion - user marks as done, no validation needed
        break

      case 'data_check':
        // Check if required data is present in context
        if (criteria.data) {
          const requiredFields = Object.keys(criteria.data)
          for (const field of requiredFields) {
            if (!(field in context)) {
              errors.push(`Missing required field: ${field}`)
            }
          }
        }
        break

      case 'system_check':
        // System-level validation (would be implemented by infrastructure)
        // This is a placeholder - actual validation happens at infrastructure layer
        break
    }

    return errors
  }

  /**
   * Get workflow progress (percentage)
   */
  getProgress(guide: MoneyGuide, state: WorkflowState): number {
    const totalSteps = guide.getTotalSteps()
    if (totalSteps === 0) return 100

    return Math.round((state.completedSteps.length / totalSteps) * 100)
  }

  /**
   * Check if workflow is complete
   */
  isComplete(guide: MoneyGuide, state: WorkflowState): boolean {
    const totalSteps = guide.getTotalSteps()
    return state.completedSteps.length >= totalSteps
  }

  /**
   * Skip to a specific step (if accessible)
   */
  skipToStep(
    guide: MoneyGuide,
    state: WorkflowState,
    stepId: string
  ): boolean {
    const step = guide.getStep(stepId)
    if (!step) {
      return false
    }

    if (!this.canAccessStep(guide, stepId, state)) {
      return false
    }

    // Find step index
    const sortedSteps = [...guide.getTotalSteps()]
      .map((_, i) => guide.getStepByIndex(i)!)
      .sort((a, b) => a.order - b.order)

    const stepIndex = sortedSteps.findIndex(s => s.id === stepId)
    if (stepIndex === -1) {
      return false
    }

    state.currentStepIndex = stepIndex
    return true
  }
}





