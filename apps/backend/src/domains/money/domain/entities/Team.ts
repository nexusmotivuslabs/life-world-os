/**
 * Team Domain Entity
 * 
 * Pure business logic entity representing a domain-focused feature team.
 * No infrastructure dependencies - pure TypeScript class.
 */

import { TeamDomain } from '@prisma/client'
import { Agent } from './Agent'

export enum TeamAgentRole {
  LEAD = 'LEAD',
  MEMBER = 'MEMBER',
  SPECIALIST = 'SPECIALIST',
}

export class TeamAgent {
  private constructor(
    public readonly agentId: string,
    public readonly agent: Agent,
    public readonly role: TeamAgentRole,
    public readonly order: number
  ) {}

  static create(
    agentId: string,
    agent: Agent,
    role: TeamAgentRole,
    order: number = 0
  ): TeamAgent {
    return new TeamAgent(agentId, agent, role, order)
  }
}

export class Team {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly domain: TeamDomain,
    public readonly description: string,
    public readonly icon: string | null,
    public readonly order: number,
    public readonly teamLeadAgentId: string | null,
    private agents: TeamAgent[]
  ) {}

  /**
   * Create a new Team entity
   */
  static create(
    id: string,
    name: string,
    domain: TeamDomain,
    description: string,
    icon: string | null = null,
    order: number = 0,
    teamLeadAgentId: string | null = null,
    agents: TeamAgent[] = []
  ): Team {
    return new Team(id, name, domain, description, icon, order, teamLeadAgentId, agents)
  }

  /**
   * Create Team from persisted data
   */
  static fromPersistence(data: {
    id: string
    name: string
    domain: TeamDomain
    description: string
    icon: string | null
    order: number
    teamLeadAgentId: string | null
    agents: TeamAgent[]
  }): Team {
    return new Team(
      data.id,
      data.name,
      data.domain,
      data.description,
      data.icon,
      data.order,
      data.teamLeadAgentId,
      data.agents
    )
  }

  /**
   * Add an agent to the team
   */
  addAgent(agent: Agent, role: TeamAgentRole, order?: number): void {
    const existingAgent = this.agents.find(ta => ta.agentId === agent.id)
    if (existingAgent) {
      throw new Error(`Agent ${agent.id} is already in the team`)
    }

    const teamAgent = TeamAgent.create(
      agent.id,
      agent,
      role,
      order ?? this.agents.length
    )

    this.agents.push(teamAgent)
  }

  /**
   * Get all agents in the team
   */
  getAgents(): readonly TeamAgent[] {
    return [...this.agents]
  }

  /**
   * Get team lead agent
   */
  getTeamLead(): Agent | null {
    if (!this.teamLeadAgentId) {
      return null
    }

    const leadAgent = this.agents.find(
      ta => ta.agentId === this.teamLeadAgentId && ta.role === TeamAgentRole.LEAD
    )

    return leadAgent?.agent ?? null
  }

  /**
   * Get agents by role
   */
  getAgentsByRole(role: TeamAgentRole): Agent[] {
    return this.agents
      .filter(ta => ta.role === role)
      .map(ta => ta.agent)
  }

  /**
   * Check if team has expertise for a given query
   * Business logic: team selection logic
   */
  hasExpertiseFor(query: string): boolean {
    // Check if any agent in the team is suitable
    return this.agents.some(teamAgent => 
      teamAgent.agent.isSuitableFor(query)
    )
  }

  /**
   * Get domain description
   */
  getDomainDescription(): string {
    const domainDescriptions: Record<TeamDomain, string> = {
      INVESTMENT: 'Investment strategies and portfolio management',
      TAX_OPTIMIZATION: 'Tax planning and optimization',
      CASH_FLOW: 'Monthly cash flow and liquidity management',
      BUSINESS_ADVISORY: 'Business development and income streams',
      COMPREHENSIVE_PLANNING: 'Full financial planning across all areas',
      DEBT_MANAGEMENT: 'Debt reduction and optimization',
      EMERGENCY_FUND: 'Emergency fund planning and tracking',
      PLATFORM_ENGINEERING: 'Platform reliability, security, and infrastructure',
    }

    return domainDescriptions[this.domain] || this.description
  }
}


