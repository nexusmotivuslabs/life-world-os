/**
 * PrismaGuideRepositoryAdapter
 * 
 * Infrastructure adapter implementing GuideRepositoryPort using Prisma.
 */

import { PrismaClient, GuideCategory } from '@prisma/client'
import { GuideRepositoryPort } from '../../../application/ports/GuideRepositoryPort.js'
import { MoneyGuide } from '../../../domain/entities/MoneyGuide.js'

export class PrismaGuideRepositoryAdapter implements GuideRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<MoneyGuide | null> {
    const guideData = await this.prisma.moneyGuide.findUnique({
      where: { id },
    })

    if (!guideData) {
      return null
    }

    return MoneyGuide.fromPersistence({
      id: guideData.id,
      agentId: guideData.agentId,
      teamId: guideData.teamId,
      title: guideData.title,
      description: guideData.description,
      steps: guideData.steps,
      category: guideData.category,
      difficulty: guideData.difficulty,
      estimatedTime: guideData.estimatedTime,
      prerequisites: guideData.prerequisites,
      isTeamGuide: guideData.isTeamGuide,
      documentation: guideData.documentation as any,
    })
  }

  async findByAgentId(agentId: string): Promise<MoneyGuide[]> {
    const guidesData = await this.prisma.moneyGuide.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
    })

    return guidesData.map(guideData =>
      MoneyGuide.fromPersistence({
        id: guideData.id,
        agentId: guideData.agentId,
        teamId: guideData.teamId,
        title: guideData.title,
        description: guideData.description,
        steps: guideData.steps,
        category: guideData.category,
        difficulty: guideData.difficulty,
        estimatedTime: guideData.estimatedTime,
        prerequisites: guideData.prerequisites,
        isTeamGuide: guideData.isTeamGuide,
        documentation: guideData.documentation as any,
      })
    )
  }

  async findByTeamId(teamId: string): Promise<MoneyGuide[]> {
    const guidesData = await this.prisma.moneyGuide.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
    })

    return guidesData.map(guideData =>
      MoneyGuide.fromPersistence({
        id: guideData.id,
        agentId: guideData.agentId,
        teamId: guideData.teamId,
        title: guideData.title,
        description: guideData.description,
        steps: guideData.steps,
        category: guideData.category,
        difficulty: guideData.difficulty,
        estimatedTime: guideData.estimatedTime,
        prerequisites: guideData.prerequisites,
        isTeamGuide: guideData.isTeamGuide,
        documentation: guideData.documentation as any,
      })
    )
  }

  async findByCategory(category: GuideCategory): Promise<MoneyGuide[]> {
    const guidesData = await this.prisma.moneyGuide.findMany({
      where: { category },
      orderBy: { createdAt: 'desc' },
    })

    return guidesData.map(guideData =>
      MoneyGuide.fromPersistence({
        id: guideData.id,
        agentId: guideData.agentId,
        teamId: guideData.teamId,
        title: guideData.title,
        description: guideData.description,
        steps: guideData.steps,
        category: guideData.category,
        difficulty: guideData.difficulty,
        estimatedTime: guideData.estimatedTime,
        prerequisites: guideData.prerequisites,
        isTeamGuide: guideData.isTeamGuide,
        documentation: guideData.documentation as any,
      })
    )
  }

  async findAll(): Promise<MoneyGuide[]> {
    const guidesData = await this.prisma.moneyGuide.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return guidesData.map(guideData =>
      MoneyGuide.fromPersistence({
        id: guideData.id,
        agentId: guideData.agentId,
        teamId: guideData.teamId,
        title: guideData.title,
        description: guideData.description,
        steps: guideData.steps,
        category: guideData.category,
        difficulty: guideData.difficulty,
        estimatedTime: guideData.estimatedTime,
        prerequisites: guideData.prerequisites,
        isTeamGuide: guideData.isTeamGuide,
        documentation: guideData.documentation as any,
      })
    )
  }

  async save(guide: MoneyGuide): Promise<MoneyGuide> {
    const guideData = await this.prisma.moneyGuide.upsert({
      where: { id: guide.id },
      create: {
        id: guide.id,
        agentId: guide.agentId ?? undefined,
        teamId: guide.teamId ?? undefined,
        title: guide.title,
        description: guide.description,
        steps: guide.steps as any,
        category: guide.category,
        difficulty: guide.difficulty,
        estimatedTime: guide.estimatedTime ?? undefined,
        prerequisites: guide.prerequisites ? (guide.prerequisites as any) : undefined,
        documentation: guide.documentation ? (guide.documentation as any) : undefined,
        isTeamGuide: guide.isTeamGuide,
      },
      update: {
        title: guide.title,
        description: guide.description,
        steps: guide.steps as any,
        category: guide.category,
        difficulty: guide.difficulty,
        estimatedTime: guide.estimatedTime ?? undefined,
        prerequisites: guide.prerequisites ? (guide.prerequisites as any) : undefined,
        documentation: guide.documentation ? (guide.documentation as any) : undefined,
        isTeamGuide: guide.isTeamGuide,
      },
    })

    return MoneyGuide.fromPersistence({
      id: guideData.id,
      agentId: guideData.agentId,
      teamId: guideData.teamId,
      title: guideData.title,
      description: guideData.description,
      steps: guideData.steps,
      category: guideData.category,
      difficulty: guideData.difficulty,
      estimatedTime: guideData.estimatedTime,
      prerequisites: guideData.prerequisites,
      isTeamGuide: guideData.isTeamGuide,
      documentation: guideData.documentation as any,
    })
  }
}





