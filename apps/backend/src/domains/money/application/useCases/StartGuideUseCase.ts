/**
 * StartGuideUseCase
 * 
 * Use case for starting a guide workflow.
 */

import { GuideRepositoryPort } from '../ports/GuideRepositoryPort.js'
import { SessionRepositoryPort } from '../ports/SessionRepositoryPort.js'
import { WorkflowExecutionService } from '../../domain/services/WorkflowExecutionService.js'
import { MoneyGuide } from '../../domain/entities/MoneyGuide.js'

export interface StartGuideRequest {
  userId: string
  guideId: string
  agentId?: string
  teamId?: string
}

export interface StartGuideResponse {
  sessionId: string
  guide: {
    id: string
    title: string
    description: string
    totalSteps: number
  }
  currentStep: {
    id: string
    title: string
    description: string
    instructions: string
    order: number
  }
  progress: number
}

export class StartGuideUseCase {
  constructor(
    private guideRepository: GuideRepositoryPort,
    private sessionRepository: SessionRepositoryPort,
    private workflowService: WorkflowExecutionService = new WorkflowExecutionService()
  ) {}

  async execute(request: StartGuideRequest): Promise<StartGuideResponse> {
    // Get guide
    const guide = await this.guideRepository.findById(request.guideId)
    if (!guide) {
      throw new Error(`Guide not found: ${request.guideId}`)
    }

    // Validate guide belongs to agent or team
    if (request.agentId && guide.agentId !== request.agentId) {
      throw new Error('Guide does not belong to specified agent')
    }
    if (request.teamId && guide.teamId !== request.teamId) {
      throw new Error('Guide does not belong to specified team')
    }

    // Initialize workflow state
    const workflowState = this.workflowService.initializeWorkflow(guide)

    // Create session
    const session = await this.sessionRepository.create({
      userId: request.userId,
      agentId: request.agentId ?? undefined,
      teamId: request.teamId ?? undefined,
      guideId: request.guideId,
      currentStep: 0,
      status: 'ACTIVE',
      context: {},
    })

    // Get first step
    const firstStep = guide.getFirstStep()
    if (!firstStep) {
      throw new Error('Guide has no steps')
    }

    const progress = this.workflowService.getProgress(guide, workflowState)

    return {
      sessionId: session.id,
      guide: {
        id: guide.id,
        title: guide.title,
        description: guide.description,
        totalSteps: guide.getTotalSteps(),
      },
      currentStep: {
        id: firstStep.id,
        title: firstStep.title,
        description: firstStep.description,
        instructions: firstStep.instructions,
        order: firstStep.order,
      },
      progress,
    }
  }
}


