/**
 * UserContextAdapter
 * 
 * Infrastructure adapter implementing UserContextPort using existing system APIs.
 */

import { PrismaClient } from '@prisma/client'
import { UserContextPort, UserContext, UserResources, UserEngine, UserInvestment } from '../../../application/ports/UserContextPort.js'

export class UserContextAdapter implements UserContextPort {
  constructor(private prisma: PrismaClient) {}

  async getUserContext(userId: string): Promise<UserContext> {
    const [user, resources, engines, investments] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        include: { xp: true },
      }),
      this.prisma.resources.findUnique({
        where: { userId },
      }),
      this.prisma.engine.findMany({
        where: { userId },
      }),
      this.prisma.investment.findMany({
        where: { userId },
      }),
    ])

    if (!user) {
      throw new Error(`User not found: ${userId}`)
    }

    const userResources: UserResources | null = resources
      ? {
          oxygen: Number(resources.oxygen),
          water: resources.water,
          gold: Number(resources.gold),
          armor: resources.armor,
          keys: resources.keys,
          energy: resources.energy ?? 100,
        }
      : null

    const userEngines: UserEngine[] = engines.map(engine => ({
      id: engine.id,
      type: engine.type,
      name: engine.name,
      currentOutput: Number(engine.currentOutput),
      status: engine.status,
    }))

    const userInvestments: UserInvestment[] = investments.map(inv => ({
      id: inv.id,
      type: inv.type,
      name: inv.name,
      amount: Number(inv.amount),
      currentValue: Number(inv.currentValue),
      expectedYield: Number(inv.expectedYield),
    }))

    return {
      userId,
      resources: userResources,
      engines: userEngines,
      investments: userInvestments,
      overallXP: user.overallXP,
      overallRank: user.overallRank,
      overallLevel: user.overallLevel,
    }
  }

  async getUserResources(userId: string): Promise<UserResources | null> {
    const resources = await this.prisma.resources.findUnique({
      where: { userId },
    })

    if (!resources) {
      return null
    }

    return {
      oxygen: Number(resources.oxygen),
      water: resources.water,
      gold: Number(resources.gold),
      armor: resources.armor,
      keys: resources.keys,
      energy: resources.energy ?? 100,
    }
  }

  async getUserEngines(userId: string): Promise<UserEngine[]> {
    const engines = await this.prisma.engine.findMany({
      where: { userId },
    })

    return engines.map(engine => ({
      id: engine.id,
      type: engine.type,
      name: engine.name,
      currentOutput: Number(engine.currentOutput),
      status: engine.status,
    }))
  }

  async getUserInvestments(userId: string): Promise<UserInvestment[]> {
    const investments = await this.prisma.investment.findMany({
      where: { userId },
    })

    return investments.map(inv => ({
      id: inv.id,
      type: inv.type,
      name: inv.name,
      amount: Number(inv.amount),
      currentValue: Number(inv.currentValue),
      expectedYield: Number(inv.expectedYield),
    }))
  }
}


