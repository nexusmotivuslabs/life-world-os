/**
 * PrismaSessionRepositoryAdapter
 * 
 * Infrastructure adapter implementing SessionRepositoryPort using Prisma.
 */

import { PrismaClient, SessionStatus } from '@prisma/client'
import { SessionRepositoryPort, Session } from '../../../application/ports/SessionRepositoryPort.js'

export class PrismaSessionRepositoryAdapter implements SessionRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  private toDomain(sessionData: any): Session {
    return {
      id: sessionData.id,
      userId: sessionData.userId,
      agentId: sessionData.agentId ?? undefined,
      teamId: sessionData.teamId ?? undefined,
      guideId: sessionData.guideId ?? null,
      currentStep: sessionData.currentStep,
      status: sessionData.status as SessionStatus,
      context: (sessionData.context as Record<string, unknown>) ?? null,
      startedAt: sessionData.startedAt,
      completedAt: sessionData.completedAt ?? null,
    }
  }

  async findById(id: string): Promise<Session | null> {
    const sessionData = await this.prisma.agentSession.findUnique({
      where: { id },
    }).catch(async () => {
      // Try team session if agent session not found
      return await this.prisma.teamSession.findUnique({
        where: { id },
      })
    })

    if (!sessionData) {
      return null
    }

    return this.toDomain(sessionData)
  }

  async findActiveSessionsByUserId(userId: string): Promise<Session[]> {
    const [agentSessions, teamSessions] = await Promise.all([
      this.prisma.agentSession.findMany({
        where: {
          userId,
          status: 'ACTIVE',
        },
      }),
      this.prisma.teamSession.findMany({
        where: {
          userId,
          status: 'ACTIVE',
        },
      }),
    ])

    return [...agentSessions, ...teamSessions].map(s => this.toDomain(s))
  }

  async findSessionsByAgentId(userId: string, agentId: string): Promise<Session[]> {
    const sessionsData = await this.prisma.agentSession.findMany({
      where: {
        userId,
        agentId,
      },
      orderBy: { startedAt: 'desc' },
    })

    return sessionsData.map(s => this.toDomain(s))
  }

  async findSessionsByTeamId(userId: string, teamId: string): Promise<Session[]> {
    const sessionsData = await this.prisma.teamSession.findMany({
      where: {
        userId,
        teamId,
      },
      orderBy: { startedAt: 'desc' },
    })

    return sessionsData.map(s => this.toDomain(s))
  }

  async create(session: Omit<Session, 'id' | 'startedAt'>): Promise<Session> {
    if (session.agentId) {
      const sessionData = await this.prisma.agentSession.create({
        data: {
          userId: session.userId,
          agentId: session.agentId,
          guideId: session.guideId ?? undefined,
          currentStep: session.currentStep,
          status: session.status,
          context: session.context ? (session.context as any) : undefined,
        },
      })
      return this.toDomain(sessionData)
    } else if (session.teamId) {
      const sessionData = await this.prisma.teamSession.create({
        data: {
          userId: session.userId,
          teamId: session.teamId,
          guideId: session.guideId ?? undefined,
          currentStep: session.currentStep,
          status: session.status,
          context: session.context ? (session.context as any) : undefined,
        },
      })
      return this.toDomain(sessionData)
    } else {
      throw new Error('Session must have either agentId or teamId')
    }
  }

  async update(
    id: string,
    updates: Partial<Pick<Session, 'currentStep' | 'status' | 'context' | 'completedAt'>>
  ): Promise<Session> {
    // Try agent session first
    const agentSession = await this.prisma.agentSession.findUnique({ where: { id } })
    
    if (agentSession) {
      const sessionData = await this.prisma.agentSession.update({
        where: { id },
        data: {
          currentStep: updates.currentStep,
          status: updates.status,
          context: updates.context ? (updates.context as any) : undefined,
          completedAt: updates.completedAt,
        },
      })
      return this.toDomain(sessionData)
    }

    // Try team session
    const sessionData = await this.prisma.teamSession.update({
      where: { id },
      data: {
        currentStep: updates.currentStep,
        status: updates.status,
        context: updates.context ? (updates.context as any) : undefined,
        completedAt: updates.completedAt,
      },
    })
    return this.toDomain(sessionData)
  }

  async complete(id: string): Promise<Session> {
    return this.update(id, {
      status: 'COMPLETED',
      completedAt: new Date(),
    })
  }

  async abandon(id: string): Promise<Session> {
    return this.update(id, {
      status: 'ABANDONED',
    })
  }
}


