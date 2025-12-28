/**
 * SessionRepositoryPort
 * 
 * Port (interface) for session repository operations (agent and team sessions).
 */

import { SessionStatus } from '@prisma/client'

export interface Session {
  id: string
  userId: string
  agentId?: string
  teamId?: string
  guideId: string | null
  currentStep: number
  status: SessionStatus
  context: Record<string, unknown> | null
  startedAt: Date
  completedAt: Date | null
}

export interface SessionRepositoryPort {
  /**
   * Find session by ID
   */
  findById(id: string): Promise<Session | null>

  /**
   * Find active sessions for user
   */
  findActiveSessionsByUserId(userId: string): Promise<Session[]>

  /**
   * Find sessions by agent ID
   */
  findSessionsByAgentId(userId: string, agentId: string): Promise<Session[]>

  /**
   * Find sessions by team ID
   */
  findSessionsByTeamId(userId: string, teamId: string): Promise<Session[]>

  /**
   * Create new session
   */
  create(session: Omit<Session, 'id' | 'startedAt'>): Promise<Session>

  /**
   * Update session
   */
  update(
    id: string,
    updates: Partial<Pick<Session, 'currentStep' | 'status' | 'context' | 'completedAt'>>
  ): Promise<Session>

  /**
   * Complete session
   */
  complete(id: string): Promise<Session>

  /**
   * Abandon session
   */
  abandon(id: string): Promise<Session>
}


