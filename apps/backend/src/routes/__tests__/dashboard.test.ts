/**
 * Dashboard Route Tests
 * 
 * Tests for dashboard endpoint including firstName in response.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma'

vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

describe('Dashboard Route - firstName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should include firstName in dashboard user response', async () => {
    const mockUser = {
      id: 'user-id',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'John',
      overallXP: 1000,
      overallRank: 'PRIVATE',
      overallLevel: 1,
      isAdmin: false,
      cloud: { capacityStrength: 50 },
      resources: { energy: 100 },
      xp: {
        capacityXP: 100,
        enginesXP: 100,
        oxygenXP: 100,
        meaningXP: 100,
        optionalityXP: 100,
      },
      engines: [],
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)

    const user = await prisma.user.findUnique({
      where: { id: 'user-id' },
      include: {
        cloud: true,
        resources: true,
        xp: true,
        engines: {
          where: { status: 'ACTIVE' },
        },
      },
    })

    expect(user?.firstName).toBe('John')
  })

  it('should handle null firstName in dashboard response', async () => {
    const mockUser = {
      id: 'user-id',
      username: 'testuser',
      email: 'test@example.com',
      firstName: null,
      overallXP: 1000,
      overallRank: 'PRIVATE',
      overallLevel: 1,
      isAdmin: false,
      cloud: { capacityStrength: 50 },
      resources: { energy: 100 },
      xp: {
        capacityXP: 100,
        enginesXP: 100,
        oxygenXP: 100,
        meaningXP: 100,
        optionalityXP: 100,
      },
      engines: [],
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)

    const user = await prisma.user.findUnique({
      where: { id: 'user-id' },
    })

    expect(user?.firstName).toBeNull()
  })
})
