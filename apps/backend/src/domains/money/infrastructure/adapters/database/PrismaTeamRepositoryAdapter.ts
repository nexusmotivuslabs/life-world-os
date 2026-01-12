/**
 * PrismaTeamRepositoryAdapter
 * 
 * Infrastructure adapter implementing TeamRepositoryPort using Prisma.
 */

import { PrismaClient, TeamDomain } from '@prisma/client'
import { TeamRepositoryPort } from '../../../application/ports/TeamRepositoryPort.js'
import { Team, TeamAgent, TeamAgentRole } from '../../../domain/entities/Team.js'
import { Agent } from '../../../domain/entities/Agent.js'
import { PrismaAgentRepositoryAdapter } from './PrismaAgentRepositoryAdapter.js'

export class PrismaTeamRepositoryAdapter implements TeamRepositoryPort {
  private agentRepository: PrismaAgentRepositoryAdapter

  constructor(private prisma: PrismaClient) {
    this.agentRepository = new PrismaAgentRepositoryAdapter(prisma)
  }

  async findById(id: string): Promise<Team | null> {
    const teamData = await this.prisma.team.findUnique({
      where: { id },
      include: {
        teamAgents: {
          include: {
            agent: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!teamData) {
      return null
    }

    // Load team agents
    const teamAgents: TeamAgent[] = []
    for (const teamAgentData of teamData.teamAgents) {
      const agent = await this.agentRepository.findById(teamAgentData.agentId)
      if (agent) {
        teamAgents.push(
          TeamAgent.create(
            teamAgentData.agentId,
            agent,
            teamAgentData.role as TeamAgentRole,
            teamAgentData.order
          )
        )
      }
    }

    const team = Team.fromPersistence({
      id: teamData.id,
      name: teamData.name,
      domain: teamData.domain,
      description: teamData.description,
      icon: teamData.icon,
      order: teamData.order,
      teamLeadAgentId: teamData.teamLeadAgentId,
      agents: teamAgents,
    })

    return team
  }

  async findByDomain(domain: TeamDomain): Promise<Team | null> {
    const teamData = await this.prisma.team.findUnique({
      where: { domain },
      include: {
        teamAgents: {
          include: {
            agent: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!teamData) {
      return null
    }

    // Load team agents
    const teamAgents: TeamAgent[] = []
    for (const teamAgentData of teamData.teamAgents) {
      const agent = await this.agentRepository.findById(teamAgentData.agentId)
      if (agent) {
        teamAgents.push(
          TeamAgent.create(
            teamAgentData.agentId,
            agent,
            teamAgentData.role as TeamAgentRole,
            teamAgentData.order
          )
        )
      }
    }

    const team = Team.fromPersistence({
      id: teamData.id,
      name: teamData.name,
      domain: teamData.domain,
      description: teamData.description,
      icon: teamData.icon,
      order: teamData.order,
      teamLeadAgentId: teamData.teamLeadAgentId,
      agents: teamAgents,
    })

    return team
  }

  async findAll(): Promise<Team[]> {
    const teamsData = await this.prisma.team.findMany({
      include: {
        teamAgents: {
          include: {
            agent: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })

    const teams: Team[] = []

    for (const teamData of teamsData) {
      const teamAgents: TeamAgent[] = []
      for (const teamAgentData of teamData.teamAgents) {
        const agent = await this.agentRepository.findById(teamAgentData.agentId)
        if (agent) {
          teamAgents.push(
            TeamAgent.create(
              teamAgentData.agentId,
              agent,
              teamAgentData.role as TeamAgentRole,
              teamAgentData.order
            )
          )
        }
      }

      teams.push(
        Team.fromPersistence({
          id: teamData.id,
          name: teamData.name,
          domain: teamData.domain,
          description: teamData.description,
          icon: teamData.icon,
          order: teamData.order,
          teamLeadAgentId: teamData.teamLeadAgentId,
          agents: teamAgents,
        })
      )
    }

    return teams
  }

  async save(team: Team): Promise<Team> {
    // This would implement full save logic including team agents
    // For now, simplified version
    const teamData = await this.prisma.team.upsert({
      where: { id: team.id },
      create: {
        id: team.id,
        name: team.name,
        domain: team.domain,
        description: team.description,
        icon: team.icon,
        order: team.order,
        teamLeadAgentId: team.teamLeadAgentId ?? undefined,
      },
      update: {
        name: team.name,
        description: team.description,
        icon: team.icon,
        order: team.order,
        teamLeadAgentId: team.teamLeadAgentId ?? undefined,
      },
    })

    // Re-fetch with relations
    return this.findById(teamData.id) ?? team
  }

  async findTeamsForQuery(query: string): Promise<Team[]> {
    const allTeams = await this.findAll()
    return allTeams.filter(team => team.hasExpertiseFor(query))
  }
}





