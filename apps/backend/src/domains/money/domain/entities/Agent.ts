/**
 * Agent Domain Entity
 * 
 * Pure business logic entity representing an AI agent with financial expertise.
 * No infrastructure dependencies - pure TypeScript class.
 */

import { AgentType } from '@prisma/client'

export class Agent {
  private constructor(
    public readonly id: string,
    public readonly type: AgentType,
    public readonly name: string,
    public readonly description: string,
    public readonly expertise: string,
    public readonly avatar: string | null,
    public readonly order: number
  ) {}

  /**
   * Create a new Agent entity from raw data
   */
  static create(
    id: string,
    type: AgentType,
    name: string,
    description: string,
    expertise: string,
    avatar: string | null = null,
    order: number = 0
  ): Agent {
    return new Agent(id, type, name, description, expertise, avatar, order)
  }

  /**
   * Create Agent from persisted data (from repository)
   */
  static fromPersistence(data: {
    id: string
    type: AgentType
    name: string
    description: string
    expertise: string
    avatar: string | null
    order: number
  }): Agent {
    return new Agent(
      data.id,
      data.type,
      data.name,
      data.description,
      data.expertise,
      data.avatar,
      data.order
    )
  }

  /**
   * Determine if this agent is suitable for a given query/topic
   * Business logic: agent selection logic
   */
  isSuitableFor(query: string, context?: Record<string, unknown>): boolean {
    const queryLower = query.toLowerCase()
    const expertiseLower = this.expertise.toLowerCase()
    
    // Check if query matches agent's expertise
    const expertiseKeywords = expertiseLower.split(/\s+/)
    const matchesExpertise = expertiseKeywords.some(keyword => 
      queryLower.includes(keyword)
    )

    // Domain-specific matching based on agent type
    const typeMatches = this.matchesAgentType(queryLower)

    return matchesExpertise || typeMatches
  }

  /**
   * Check if query matches agent type keywords
   */
  private matchesAgentType(query: string): boolean {
    const typeKeywords: Record<AgentType, string[]> = {
      INVESTOR: ['investment', 'portfolio', 'asset', 'return', 'risk', 'stock', 'bond'],
      FINANCIAL_ADVISOR: ['plan', 'strategy', 'financial', 'goal', 'retirement', 'wealth'],
      ACCOUNTANT: ['tax', 'deduction', 'filing', 'irs', 'record', 'receipt'],
      BOOKKEEPER: ['expense', 'transaction', 'record', 'categorize', 'track', 'bookkeeping'],
      TAX_STRATEGIST: ['tax optimization', 'tax planning', 'tax strategy', 'tax-efficient'],
      CASH_FLOW_SPECIALIST: ['cash flow', 'budget', 'expense', 'income', 'liquidity'],
      DEBT_SPECIALIST: ['debt', 'credit', 'loan', 'payoff', 'consolidation', 'interest'],
    }

    const keywords = typeKeywords[this.type] || []
    return keywords.some(keyword => query.includes(keyword))
  }

  /**
   * Get agent's personality/tone for responses
   * Business logic: defines how agent communicates
   */
  getPersonality(): string {
    const personalities: Record<AgentType, string> = {
      INVESTOR: 'Data-driven, conservative growth focus',
      FINANCIAL_ADVISOR: 'Strategic, comprehensive, institutional-grade',
      ACCOUNTANT: 'Detail-oriented, compliance-focused',
      BOOKKEEPER: 'Organized, methodical, system-focused',
      TAX_STRATEGIST: 'Strategic, forward-thinking, optimization-focused',
      CASH_FLOW_SPECIALIST: 'Practical, efficiency-focused, results-oriented',
      DEBT_SPECIALIST: 'Systematic, strategic, goal-oriented, empathetic',
    }

    return personalities[this.type] || 'Professional and helpful'
  }
}

