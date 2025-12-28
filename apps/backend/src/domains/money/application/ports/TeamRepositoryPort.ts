/**
 * TeamRepositoryPort
 * 
 * Port (interface) for team repository operations.
 */

import { TeamDomain } from '@prisma/client'
import { Team } from '../../domain/entities/Team.js'

export interface TeamRepositoryPort {
  /**
   * Find team by ID
   */
  findById(id: string): Promise<Team | null>

  /**
   * Find team by domain
   */
  findByDomain(domain: TeamDomain): Promise<Team | null>

  /**
   * Find all teams
   */
  findAll(): Promise<Team[]>

  /**
   * Save team (create or update)
   */
  save(team: Team): Promise<Team>

  /**
   * Find teams that have expertise for a query
   */
  findTeamsForQuery(query: string): Promise<Team[]>
}


