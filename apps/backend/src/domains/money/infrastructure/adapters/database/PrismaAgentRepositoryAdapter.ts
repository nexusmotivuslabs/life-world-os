/**
 * PrismaAgentRepositoryAdapter
 * 
 * Infrastructure adapter implementing AgentRepositoryPort using Prisma.
 */

import { PrismaClient, AgentType } from '@prisma/client'
import { AgentRepositoryPort } from '../../../application/ports/AgentRepositoryPort.js'
import { Agent } from '../../../domain/entities/Agent.js'

export class PrismaAgentRepositoryAdapter implements AgentRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Agent | null> {
    const agentData = await this.prisma.agent.findUnique({
      where: { id },
    })

    if (!agentData) {
      return null
    }

    return Agent.fromPersistence({
      id: agentData.id,
      type: agentData.type,
      name: agentData.name,
      description: agentData.description,
      expertise: agentData.expertise,
      avatar: agentData.avatar,
      order: agentData.order,
    })
  }

  async findByType(type: AgentType): Promise<Agent | null> {
    const agentData = await this.prisma.agent.findUnique({
      where: { type },
    })

    if (!agentData) {
      return null
    }

    return Agent.fromPersistence({
      id: agentData.id,
      type: agentData.type,
      name: agentData.name,
      description: agentData.description,
      expertise: agentData.expertise,
      avatar: agentData.avatar,
      order: agentData.order,
    })
  }

  async findAll(): Promise<Agent[]> {
    const agentsData = await this.prisma.agent.findMany({
      orderBy: { order: 'asc' },
    })

    return agentsData.map(agentData =>
      Agent.fromPersistence({
        id: agentData.id,
        type: agentData.type,
        name: agentData.name,
        description: agentData.description,
        expertise: agentData.expertise,
        avatar: agentData.avatar,
        order: agentData.order,
      })
    )
  }

  async save(agent: Agent): Promise<Agent> {
    const agentData = await this.prisma.agent.upsert({
      where: { id: agent.id },
      create: {
        id: agent.id,
        type: agent.type,
        name: agent.name,
        description: agent.description,
        expertise: agent.expertise,
        avatar: agent.avatar,
        order: agent.order,
      },
      update: {
        name: agent.name,
        description: agent.description,
        expertise: agent.expertise,
        avatar: agent.avatar,
        order: agent.order,
      },
    })

    return Agent.fromPersistence({
      id: agentData.id,
      type: agentData.type,
      name: agentData.name,
      description: agentData.description,
      expertise: agentData.expertise,
      avatar: agentData.avatar,
      order: agentData.order,
    })
  }
}


