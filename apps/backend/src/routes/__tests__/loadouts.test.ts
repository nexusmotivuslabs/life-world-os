/**
 * Loadouts Route Tests
 *
 * Tests for loadout endpoints: GET /items (public), and behavior with valid/invalid input.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { LoadoutSlotType } from '@prisma/client'
import {
  getLoadoutItems,
  getUserLoadouts,
  getActiveLoadout,
} from '../../services/loadoutService'

vi.mock('../../services/loadoutService', () => ({
  getLoadoutItems: vi.fn(),
  getUserLoadouts: vi.fn(),
  getActiveLoadout: vi.fn(),
  getLoadoutById: vi.fn(),
  createLoadout: vi.fn(),
  updateLoadout: vi.fn(),
  activateLoadout: vi.fn(),
  deleteLoadout: vi.fn(),
}))

vi.mock('../../services/powerLevelCalculator', () => ({
  calculatePowerLevel: vi.fn(),
}))

import router from '../loadouts'

describe('Loadouts Routes', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let jsonSpy: ReturnType<typeof vi.fn>
  let statusSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    jsonSpy = vi.fn()
    statusSpy = vi.fn().mockReturnValue({ json: jsonSpy })
    mockReq = {
      query: {},
      params: {},
      body: {},
      headers: {},
    }
    mockRes = {
      status: statusSpy,
      json: jsonSpy,
    } as Response
    vi.clearAllMocks()
  })

  describe('GET /items', () => {
    function getItemsHandler() {
      const layer = router.stack.find(
        (l: { route?: { path: string; methods?: { get?: boolean } } }) =>
          l.route?.path === '/items' && l.route?.methods?.get
      ) as { route?: { stack: { handle: (req: Request, res: Response) => Promise<void> }[] } }
      return layer?.route?.stack?.[0]?.handle
    }

    it('returns 200 and items array when no slotType', async () => {
      const mockItems = [
        {
          id: 'item-1',
          name: 'Resilience',
          slotType: LoadoutSlotType.PRIMARY_WEAPON,
          powerLevel: 100,
          isDefault: true,
        },
      ]
      vi.mocked(getLoadoutItems).mockResolvedValue(mockItems as never)

      const handler = getItemsHandler()
      expect(handler).toBeDefined()
      if (handler) {
        await handler(mockReq as Request, mockRes as Response)
      }

      expect(getLoadoutItems).toHaveBeenCalledWith(undefined)
      expect(statusSpy).not.toHaveBeenCalled()
      expect(jsonSpy).toHaveBeenCalledWith(mockItems)
    })

    it('returns 200 and items when valid slotType in query', async () => {
      mockReq.query = { slotType: LoadoutSlotType.PRIMARY_WEAPON }
      const mockItems = [
        {
          id: 'item-1',
          name: 'Resilience',
          slotType: LoadoutSlotType.PRIMARY_WEAPON,
          powerLevel: 100,
          isDefault: true,
        },
      ]
      vi.mocked(getLoadoutItems).mockResolvedValue(mockItems as never)

      const handler = getItemsHandler()
      if (handler) {
        await handler(mockReq as Request, mockRes as Response)
      }

      expect(getLoadoutItems).toHaveBeenCalledWith(LoadoutSlotType.PRIMARY_WEAPON)
      expect(jsonSpy).toHaveBeenCalledWith(mockItems)
    })

    it('returns 500 when getLoadoutItems throws', async () => {
      vi.mocked(getLoadoutItems).mockRejectedValue(new Error('DB error'))

      const handler = getItemsHandler()
      if (handler) {
        await handler(mockReq as Request, mockRes as Response)
      }

      expect(statusSpy).toHaveBeenCalledWith(500)
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'Failed to get loadout items' })
    })
  })
})
