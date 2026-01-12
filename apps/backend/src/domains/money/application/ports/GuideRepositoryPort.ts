/**
 * GuideRepositoryPort
 * 
 * Port (interface) for guide repository operations.
 */

import { GuideCategory } from '@prisma/client'
import { MoneyGuide } from '../../domain/entities/MoneyGuide.js'

export interface GuideRepositoryPort {
  /**
   * Find guide by ID
   */
  findById(id: string): Promise<MoneyGuide | null>

  /**
   * Find guides by agent ID
   */
  findByAgentId(agentId: string): Promise<MoneyGuide[]>

  /**
   * Find guides by team ID
   */
  findByTeamId(teamId: string): Promise<MoneyGuide[]>

  /**
   * Find guides by category
   */
  findByCategory(category: GuideCategory): Promise<MoneyGuide[]>

  /**
   * Find all guides
   */
  findAll(): Promise<MoneyGuide[]>

  /**
   * Save guide (create or update)
   */
  save(guide: MoneyGuide): Promise<MoneyGuide>
}





