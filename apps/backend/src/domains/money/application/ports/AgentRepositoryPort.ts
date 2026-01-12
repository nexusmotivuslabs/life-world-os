/**
 * AgentRepositoryPort
 * 
 * Port (interface) for agent repository operations.
 * This is what the application layer needs from the infrastructure layer.
 */

import { AgentType } from '@prisma/client'
import { Agent } from '../../domain/entities/Agent.js'

export interface AgentRepositoryPort {
  /**
   * Find agent by ID
   */
  findById(id: string): Promise<Agent | null>

  /**
   * Find agent by type
   */
  findByType(type: AgentType): Promise<Agent | null>

  /**
   * Find all agents
   */
  findAll(): Promise<Agent[]>

  /**
   * Save agent (create or update)
   */
  save(agent: Agent): Promise<Agent>
}





