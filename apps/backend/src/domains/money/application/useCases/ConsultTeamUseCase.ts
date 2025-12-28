/**
 * ConsultTeamUseCase
 * 
 * Use case for consulting with a team (multi-agent collaboration).
 */

import { TeamRepositoryPort } from '../ports/TeamRepositoryPort.js'
import { AgentRepositoryPort } from '../ports/AgentRepositoryPort.js'
import { KnowledgeBasePort } from '../ports/KnowledgeBasePort.js'
import { LLMServicePort } from '../ports/LLMServicePort.js'
import { UserContextPort } from '../ports/UserContextPort.js'
import { TeamWorkflowEngine } from '../../domain/services/TeamWorkflowEngine.js'
import { RAGService } from '../../domain/services/RAGService.js'
import { Team } from '../../domain/entities/Team.js'

export interface ConsultTeamRequest {
  userId: string
  query: string
  teamId?: string // Optional: if not provided, select best team
}

export interface ConsultTeamResponse {
  team: {
    id: string
    name: string
    domain: string
  }
  contributingAgents: Array<{
    id: string
    name: string
    role: string
  }>
  response: string
  coordinationMethod: string
  relevantArticles: Array<{
    id: string
    title: string
    preview: string
  }>
}

export class ConsultTeamUseCase {
  constructor(
    private teamRepository: TeamRepositoryPort,
    private agentRepository: AgentRepositoryPort,
    private knowledgeBase: KnowledgeBasePort,
    private llmService: LLMServicePort,
    private userContext: UserContextPort,
    private teamWorkflowEngine: TeamWorkflowEngine = new TeamWorkflowEngine(),
    private ragService: RAGService = new RAGService()
  ) {}

  async execute(request: ConsultTeamRequest): Promise<ConsultTeamResponse> {
    // Get or select team
    let team: Team | null = null

    if (request.teamId) {
      team = await this.teamRepository.findById(request.teamId)
      if (!team) {
        throw new Error(`Team not found: ${request.teamId}`)
      }
    } else {
      // Select best team for query
      const teams = await this.teamRepository.findTeamsForQuery(request.query)
      if (teams.length === 0) {
        throw new Error('No suitable team found for query')
      }
      team = teams[0] // Use first match
    }

    // Get contributing members
    const contributingMembers = this.teamWorkflowEngine.selectContributingMembers(
      team,
      request.query
    )

    // Determine coordination method
    const coordinationMethod = this.teamWorkflowEngine.determineCoordinationMethod(
      contributingMembers
    )

    // Get user context
    const userContextData = await this.userContext.getUserContext(request.userId)

    // Search knowledge base for team
    const knowledgeResults = await this.knowledgeBase.searchByTeam(
      request.query,
      team.id,
      5
    )

    // Select relevant articles
    const relevantArticles = this.ragService.selectRelevantArticles(
      knowledgeResults.map(r => r.article),
      request.query,
      3,
      0.5
    )

    // Generate responses from each contributing agent
    const agentResponses: Array<{ agentId: string; agentName: string; response: string }> = []

    for (const member of contributingMembers) {
      // Get agent-specific knowledge
      const agentKnowledge = await this.knowledgeBase.searchByAgent(
        request.query,
        member.agentId,
        3
      )

      const agentArticles = this.ragService.selectRelevantArticles(
        agentKnowledge.map(r => r.article),
        request.query,
        2,
        0.5
      )

      // Generate response from this agent
      const llmResponse = await this.llmService.generateResponseWithRAG(
        request.query,
        {
          agentPersonality: member.agent.getPersonality(),
          knowledgeArticles: agentArticles.articles.map(a => ({
            title: a.title,
            content: a.content,
            similarity: agentArticles.relevanceScores.get(a.id) || 0,
          })),
          userContext: {
            resources: userContextData.resources,
            engines: userContextData.engines,
            investments: userContextData.investments,
          },
        }
      )

      agentResponses.push({
        agentId: member.agentId,
        agentName: member.agent.name,
        response: llmResponse.content,
      })
    }

    // Aggregate responses
    const aggregatedResponse = this.teamWorkflowEngine.aggregateResponses(
      agentResponses,
      coordinationMethod === 'parallel' ? 'merge' : 'lead'
    )

    return {
      team: {
        id: team.id,
        name: team.name,
        domain: team.domain,
      },
      contributingAgents: contributingMembers.map(m => ({
        id: m.agentId,
        name: m.agent.name,
        role: m.role,
      })),
      response: aggregatedResponse,
      coordinationMethod,
      relevantArticles: relevantArticles.articles.map(a => ({
        id: a.id,
        title: a.title,
        preview: a.getPreview(150),
      })),
    }
  }
}


