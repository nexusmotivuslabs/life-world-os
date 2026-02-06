/**
 * Loadout Service Tests
 *
 * Tests for loadout operations: getUserLoadouts, getActiveLoadout,
 * getLoadoutItems, getLoadoutById. Mocks Prisma and ensurePresetLoadouts.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getUserLoadouts,
  getActiveLoadout,
  getLoadoutItems,
  getLoadoutById,
} from '../loadoutService'
import { LoadoutSlotType } from '@prisma/client'

vi.mock('../../lib/prisma', () => ({
  prisma: {
    loadout: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    loadoutItem: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('../presetLoadoutService', () => ({
  ensurePresetLoadouts: vi.fn().mockResolvedValue(undefined),
}))

import { prisma } from '../../lib/prisma'
import { ensurePresetLoadouts } from '../presetLoadoutService'

describe('loadoutService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(ensurePresetLoadouts).mockResolvedValue(undefined)
  })

  describe('getUserLoadouts', () => {
    it('returns loadouts when user has loadouts without calling ensurePresetLoadouts', async () => {
      const userId = 'user-123'
      const mockLoadouts = [
        {
          id: 'loadout-1',
          userId,
          name: 'Preset 1',
          isActive: false,
          isPreset: true,
          slots: [],
        },
      ]
      vi.mocked(prisma.loadout.findMany).mockResolvedValue(mockLoadouts as never)

      const result = await getUserLoadouts(userId)

      expect(ensurePresetLoadouts).not.toHaveBeenCalled()
      expect(prisma.loadout.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          slots: { include: { item: true } },
        },
        orderBy: [
          { isPreset: 'asc' },
          { createdAt: 'asc' },
        ],
      })
      expect(result).toEqual(mockLoadouts)
    })

    it('calls ensurePresetLoadouts when user has no loadouts, then returns loadouts from second findMany', async () => {
      const userId = 'user-456'
      const mockLoadouts = [
        {
          id: 'loadout-preset',
          userId,
          name: 'Preset',
          isActive: true,
          isPreset: true,
          slots: [],
        },
      ]
      vi.mocked(prisma.loadout.findMany)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockLoadouts as never)

      const result = await getUserLoadouts(userId)

      expect(ensurePresetLoadouts).toHaveBeenCalledTimes(1)
      expect(ensurePresetLoadouts).toHaveBeenCalledWith(userId)
      expect(prisma.loadout.findMany).toHaveBeenCalledTimes(2)
      expect(result).toEqual(mockLoadouts)
    })
  })

  describe('getActiveLoadout', () => {
    it('returns active loadout when found without calling ensurePresetLoadouts', async () => {
      const userId = 'user-123'
      const mockLoadout = {
        id: 'loadout-active',
        userId,
        name: 'Active',
        isActive: true,
        isPreset: false,
        slots: [],
      }
      vi.mocked(prisma.loadout.findFirst).mockResolvedValue(mockLoadout as never)

      const result = await getActiveLoadout(userId)

      expect(ensurePresetLoadouts).not.toHaveBeenCalled()
      expect(prisma.loadout.findFirst).toHaveBeenCalledWith({
        where: { userId, isActive: true },
        include: {
          slots: { include: { item: true } },
        },
      })
      expect(result).toEqual(mockLoadout)
    })

    it('calls ensurePresetLoadouts when no active loadout, then returns loadout from second findFirst', async () => {
      const userId = 'user-456'
      const mockLoadout = {
        id: 'loadout-active',
        userId,
        name: 'Active',
        isActive: true,
        isPreset: true,
        slots: [],
      }
      vi.mocked(prisma.loadout.findFirst)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockLoadout as never)

      const result = await getActiveLoadout(userId)

      expect(ensurePresetLoadouts).toHaveBeenCalledTimes(1)
      expect(ensurePresetLoadouts).toHaveBeenCalledWith(userId)
      expect(prisma.loadout.findFirst).toHaveBeenCalledTimes(2)
      expect(result).toEqual(mockLoadout)
    })

    it('returns null when no active loadout and ensurePresetLoadouts does not create one', async () => {
      vi.mocked(prisma.loadout.findFirst).mockResolvedValue(null)

      const result = await getActiveLoadout('user-456')

      expect(ensurePresetLoadouts).toHaveBeenCalledTimes(1)
      expect(result).toBeNull()
    })
  })

  describe('getLoadoutItems', () => {
    it('returns all items when slotType is undefined', async () => {
      const mockItems = [
        {
          id: 'item-1',
          name: 'Resilience',
          slotType: LoadoutSlotType.PRIMARY_WEAPON,
          powerLevel: 100,
          isDefault: true,
        },
      ]
      vi.mocked(prisma.loadoutItem.findMany).mockResolvedValue(mockItems as never)

      const result = await getLoadoutItems()

      expect(prisma.loadoutItem.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: [
          { isDefault: 'desc' },
          { powerLevel: 'desc' },
          { name: 'asc' },
        ],
      })
      expect(result).toEqual(mockItems)
    })

    it('filters by slotType when provided', async () => {
      const mockItems = [
        {
          id: 'item-1',
          name: 'Resilience',
          slotType: LoadoutSlotType.PRIMARY_WEAPON,
          powerLevel: 100,
          isDefault: true,
        },
      ]
      vi.mocked(prisma.loadoutItem.findMany).mockResolvedValue(mockItems as never)

      const result = await getLoadoutItems(LoadoutSlotType.PRIMARY_WEAPON)

      expect(prisma.loadoutItem.findMany).toHaveBeenCalledWith({
        where: { slotType: LoadoutSlotType.PRIMARY_WEAPON },
        orderBy: [
          { isDefault: 'desc' },
          { powerLevel: 'desc' },
          { name: 'asc' },
        ],
      })
      expect(result).toEqual(mockItems)
    })
  })

  describe('getLoadoutById', () => {
    it('returns loadout when found for user', async () => {
      const loadoutId = 'loadout-1'
      const userId = 'user-123'
      const mockLoadout = {
        id: loadoutId,
        userId,
        name: 'My Loadout',
        isActive: false,
        isPreset: false,
        slots: [],
      }
      vi.mocked(prisma.loadout.findFirst).mockResolvedValue(mockLoadout as never)

      const result = await getLoadoutById(loadoutId, userId)

      expect(prisma.loadout.findFirst).toHaveBeenCalledWith({
        where: { id: loadoutId, userId },
        include: {
          slots: { include: { item: true } },
        },
      })
      expect(result).toEqual(mockLoadout)
    })

    it('returns null when loadout not found', async () => {
      vi.mocked(prisma.loadout.findFirst).mockResolvedValue(null)

      const result = await getLoadoutById('missing-id', 'user-456')

      expect(result).toBeNull()
    })
  })
})
