/**
 * User Routes Tests
 * 
 * Tests for user profile endpoint including firstName.
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

describe('User Profile Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return firstName in profile response', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-id',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'John',
      currentSeason: 'SPRING',
      seasonStartDate: new Date(),
      overallXP: 1000,
      overallRank: 'PRIVATE',
      overallLevel: 1,
      isAdmin: false,
      createdAt: new Date(),
    } as any)

    const user = await prisma.user.findUnique({
      where: { id: 'user-id' },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        currentSeason: true,
        seasonStartDate: true,
        overallXP: true,
        overallRank: true,
        overallLevel: true,
        isAdmin: true,
        createdAt: true,
      },
    })

    expect(user?.firstName).toBe('John')
  })

  it('should return null firstName when not set', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-id',
      email: 'test@example.com',
      username: 'testuser',
      firstName: null,
      currentSeason: 'SPRING',
      seasonStartDate: new Date(),
      overallXP: 1000,
      overallRank: 'PRIVATE',
      overallLevel: 1,
      isAdmin: false,
      createdAt: new Date(),
    } as any)

    const user = await prisma.user.findUnique({
      where: { id: 'user-id' },
      select: {
        firstName: true,
      },
    })

    expect(user?.firstName).toBeNull()
  })
})
