/**
 * TeamWorkflowEngine
 * 
 * Domain service for coordinating multi-agent team workflows.
 * Pure business logic - orchestrates team member collaboration.
 */

import { Team, TeamAgent } from '../entities/Team.js'
import { Agent } from '../entities/Agent.js'

export interface TeamWorkflowStep {
  stepId: string
  assignedAgents: Agent[]
  coordination: 'parallel' | 'sequential' | 'consensus'
  aggregation: 'merge' | 'vote' | 'lead'
}

export interface TeamWorkflowResult {
  stepId: string
  contributions: Array<{
    agentId: string
    agentName: string
    contribution: string
  }>
  aggregatedResponse: string
  coordinationMethod: string
}

export class TeamWorkflowEngine {
  /**
   * Determine which team members should contribute to a query
   * Business logic: team member selection
   */
  selectContributingMembers(team: Team, query: string): TeamAgent[] {
    const members = team.getAgents()
    
    // Always include the lead
    const lead = team.getTeamLead()
    const contributingMembers: TeamAgent[] = []

    if (lead) {
      const leadMember = members.find(m => m.agentId === lead.id)
      if (leadMember) {
        contributingMembers.push(leadMember)
      }
    }

    // Add members whose expertise matches the query
    for (const member of members) {
      if (member.role === 'LEAD') continue // Already added

      if (member.agent.isSuitableFor(query)) {
        contributingMembers.push(member)
      }
    }

    // If no matches, include all active members
    if (contributingMembers.length <= 1) {
      return members.filter(m => m.role !== 'SPECIALIST' || m.agent.isSuitableFor(query))
    }

    return contributingMembers
  }

  /**
   * Determine workflow coordination method
   * Business logic: how team members should collaborate
   */
  determineCoordinationMethod(contributingMembers: TeamAgent[]): 'parallel' | 'sequential' | 'consensus' {
    // If only lead, sequential
    if (contributingMembers.length === 1) {
      return 'sequential'
    }

    // If multiple members with different expertise, parallel
    const hasDifferentExpertise = contributingMembers.some(
      (member, index) => 
        contributingMembers.slice(index + 1).some(
          other => member.agent.expertise !== other.agent.expertise
        )
    )

    if (hasDifferentExpertise) {
      return 'parallel'
    }

    // If similar expertise, consensus
    return 'consensus'
  }

  /**
   * Aggregate responses from multiple team members
   * Business logic: how to combine multiple agent responses
   */
  aggregateResponses(
    contributions: Array<{ agentId: string; agentName: string; response: string }>,
    method: 'merge' | 'vote' | 'lead' = 'merge'
  ): string {
    if (contributions.length === 0) {
      return ''
    }

    if (contributions.length === 1) {
      return contributions[0].response
    }

    switch (method) {
      case 'lead':
        // Use first contribution (assumed to be lead)
        return contributions[0].response

      case 'vote':
        // For vote, we'd need voting logic (simplified here)
        // In practice, this might use LLM to synthesize
        return contributions.map(c => c.response).join('\n\n---\n\n')

      case 'merge':
      default:
        // Merge all contributions with attribution
        const merged = contributions
          .map((c, index) => {
            const prefix = index === 0 
              ? `**${c.agentName}** (Lead):`
              : `\n\n**${c.agentName}**:`
            return `${prefix}\n${c.response}`
          })
          .join('\n\n')
        
        return merged
    }
  }

  /**
   * Create workflow plan for team consultation
   */
  createWorkflowPlan(team: Team, query: string): TeamWorkflowStep[] {
    const contributingMembers = this.selectContributingMembers(team, query)
    const coordination = this.determineCoordinationMethod(contributingMembers)

    return [
      {
        stepId: 'team-consultation',
        assignedAgents: contributingMembers.map(m => m.agent),
        coordination,
        aggregation: coordination === 'parallel' ? 'merge' : 'lead',
      },
    ]
  }
}


