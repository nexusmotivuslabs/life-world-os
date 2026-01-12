/**
 * ExecuteGuideStepUseCase
 * 
 * Use case for executing a step in a guide workflow.
 */

import { GuideRepositoryPort } from '../ports/GuideRepositoryPort.js'
import { SessionRepositoryPort } from '../ports/SessionRepositoryPort.js'
import { WorkflowExecutionService } from '../../domain/services/WorkflowExecutionService.js'

export interface ExecuteGuideStepRequest {
  userId: string
  sessionId: string
  stepData?: Record<string, unknown>
}

export interface ExecuteGuideStepResponse {
  stepCompleted: {
    id: string
    title: string
  }
  nextStep: {
    id: string
    title: string
    description: string
    instructions: string
    order: number
  } | null
  progress: number
  isComplete: boolean
  validationErrors?: string[]
}

export class ExecuteGuideStepUseCase {
  constructor(
    private guideRepository: GuideRepositoryPort,
    private sessionRepository: SessionRepositoryPort,
    private workflowService: WorkflowExecutionService = new WorkflowExecutionService()
  ) {}

  async execute(request: ExecuteGuideStepRequest): Promise<ExecuteGuideStepResponse> {
    // Get session
    const session = await this.sessionRepository.findById(request.sessionId)
    if (!session) {
      throw new Error(`Session not found: ${request.sessionId}`)
    }

    if (session.userId !== request.userId) {
      throw new Error('Session does not belong to user')
    }

    if (session.status !== 'ACTIVE') {
      throw new Error('Session is not active')
    }

    // Get guide
    if (!session.guideId) {
      throw new Error('Session has no associated guide')
    }

    const guide = await this.guideRepository.findById(session.guideId)
    if (!guide) {
      throw new Error(`Guide not found: ${session.guideId}`)
    }

    // Reconstruct workflow state from session
    const workflowState = {
      guideId: guide.id,
      currentStepIndex: session.currentStep,
      completedSteps: [], // Would be stored in session context
      context: session.context || {},
    }

    // Execute step
    const result = this.workflowService.executeStep(
      guide,
      workflowState,
      request.stepData
    )

    // Update session
    const updatedSession = await this.sessionRepository.update(session.id, {
      currentStep: workflowState.currentStepIndex,
      context: workflowState.context,
      status: result.isComplete ? 'COMPLETED' : 'ACTIVE',
      completedAt: result.isComplete ? new Date() : undefined,
    })

    const progress = this.workflowService.getProgress(guide, workflowState)

    return {
      stepCompleted: {
        id: result.step.id,
        title: result.step.title,
      },
      nextStep: result.nextStep
        ? {
            id: result.nextStep.id,
            title: result.nextStep.title,
            description: result.nextStep.description,
            instructions: result.nextStep.instructions,
            order: result.nextStep.order,
          }
        : null,
      progress,
      isComplete: result.isComplete,
      validationErrors: result.validationErrors,
    }
  }
}





