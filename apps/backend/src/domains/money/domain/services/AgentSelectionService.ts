/**
 * AgentSelectionService
 * 
 * Domain service for selecting the most appropriate agent for a query.
 * Pure business logic - no infrastructure dependencies.
 */

import { Agent } from '../entities/Agent.js'

export class AgentSelectionService {
  /**
   * Select the best agent for a given query
   * Business logic: agent selection algorithm
   */
  selectAgent(query: string, availableAgents: Agent[], context?: Record<string, unknown>): Agent | null {
    if (availableAgents.length === 0) {
      return null
    }

    // Score each agent based on suitability
    const scoredAgents = availableAgents.map(agent => ({
      agent,
      score: this.scoreAgent(agent, query, context),
    }))

    // Sort by score (highest first)
    scoredAgents.sort((a, b) => b.score - a.score)

    // Return the highest scoring agent (if score > 0)
    const bestMatch = scoredAgents[0]
    return bestMatch && bestMatch.score > 0 ? bestMatch.agent : null
  }

  /**
   * Score an agent's suitability for a query
   */
  private scoreAgent(agent: Agent, query: string, context?: Record<string, unknown>): number {
    let score = 0

    // Base suitability check
    if (agent.isSuitableFor(query, context)) {
      score += 10
    }

    // Query matching bonus (more specific matches score higher)
    const queryLower = query.toLowerCase()
    const expertiseLower = agent.expertise.toLowerCase()

    // Check for exact phrase matches
    if (expertiseLower.includes(queryLower)) {
      score += 20
    }

    // Check for keyword matches
    const queryWords = queryLower.split(/\s+/)
    const expertiseWords = expertiseLower.split(/\s+/)
    const matchingWords = queryWords.filter(word => 
      expertiseWords.some(expWord => expWord.includes(word) || word.includes(expWord))
    )
    score += matchingWords.length * 5

    return score
  }

  /**
   * Select multiple agents for a complex query (team scenarios)
   */
  selectAgents(query: string, availableAgents: Agent[], limit: number = 3): Agent[] {
    const scoredAgents = availableAgents.map(agent => ({
      agent,
      score: this.scoreAgent(agent, query),
    }))

    scoredAgents.sort((a, b) => b.score - a.score)

    return scoredAgents
      .filter(item => item.score > 0)
      .slice(0, limit)
      .map(item => item.agent)
  }
}


