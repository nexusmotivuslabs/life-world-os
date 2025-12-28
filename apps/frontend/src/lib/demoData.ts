import { DashboardData } from '../types'
import { OverallRank, Season, EngineType, EngineStatus } from '../types'

export function getDemoData(): DashboardData {
  return {
    user: {
      id: 'demo-user-id',
      username: 'Demo User',
      email: 'demo@example.com',
      overallXP: 12500,
      overallRank: OverallRank.CORPORAL,
      overallLevel: 3,
      xpForNextRank: 5000,
      progressToNextRank: 45.5,
    },
    season: {
      season: Season.SPRING,
      startDate: new Date().toISOString(),
      daysInSeason: 12,
    },
    clouds: {
      capacity: 65,
      engines: 70,
      oxygen: 55,
      meaning: 60,
      optionality: 50,
    },
    resources: {
      oxygen: 3.5,
      water: 75,
      gold: 15000,
      armor: 40,
      keys: 2,
    },
    xp: {
      overall: 12500,
      category: {
        capacity: 2500,
        engines: 3500,
        oxygen: 2000,
        meaning: 1500,
        optionality: 3000,
      },
      categoryLevels: {
        capacity: 3,
        engines: 4,
        oxygen: 2,
        meaning: 2,
        optionality: 3,
      },
    },
    balance: {
      isBalanced: false,
      averageLevel: 2.8,
      categoryLevels: {
        capacity: 3,
        engines: 4,
        oxygen: 2,
        meaning: 2,
        optionality: 3,
      },
      warnings: ['Oxygen level is below average'],
      recommendations: ['Focus on building financial stability'],
    },
    engines: [
      {
        id: 'demo-engine-1',
        type: EngineType.CAREER,
        name: 'Software Engineer',
        description: 'Full-time position',
        fragilityScore: 70,
        currentOutput: 5000,
        status: EngineStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'demo-engine-2',
        type: EngineType.LEARNING,
        name: 'Online Courses',
        description: 'Skill development',
        fragilityScore: 30,
        currentOutput: 200,
        status: EngineStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  }
}


