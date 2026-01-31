import { Router } from 'express'
import { z } from 'zod'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import {
  getUserLoadouts,
  getLoadoutById,
  getActiveLoadout,
  createLoadout,
  updateLoadout,
  activateLoadout,
  deleteLoadout,
  getLoadoutItems,
} from '../services/loadoutService'
import { calculatePowerLevel } from '../services/powerLevelCalculator'
import { LoadoutSlotType } from '@prisma/client'

const router = Router()

const createLoadoutSchema = z.object({
  name: z.string().min(1).max(255),
  slots: z.array(
    z.object({
      slotType: z.nativeEnum(LoadoutSlotType),
      itemId: z.string().uuid(),
    })
  ),
})

const updateLoadoutSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slots: z
    .array(
      z.object({
        slotType: z.nativeEnum(LoadoutSlotType),
        itemId: z.string().uuid(),
      })
    )
    .optional(),
})

// GET /api/loadouts - List user's loadouts
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const loadouts = await getUserLoadouts(userId)

    res.json(loadouts)
  } catch (error) {
    console.error('Get loadouts error:', error)
    res.status(500).json({ error: 'Failed to get loadouts' })
  }
})

// GET /api/loadouts/active - Get active loadout
router.get('/active', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const loadout = await getActiveLoadout(userId)

    if (!loadout) {
      return res.status(404).json({ error: 'No active loadout found' })
    }

    res.json(loadout)
  } catch (error) {
    console.error('Get active loadout error:', error)
    res.status(500).json({ error: 'Failed to get active loadout' })
  }
})

// GET /api/loadouts/items - Get available loadout items (Public endpoint)
router.get('/items', async (req, res) => {
  try {
    const rawSlotType = req.query.slotType as string | undefined
    let slotType: LoadoutSlotType | undefined
    if (rawSlotType) {
      const valid = Object.values(LoadoutSlotType).includes(rawSlotType as LoadoutSlotType)
      if (!valid) {
        return res.status(400).json({
          error: 'Invalid slotType',
          validValues: Object.values(LoadoutSlotType),
        })
      }
      slotType = rawSlotType as LoadoutSlotType
    }
    const items = await getLoadoutItems(slotType)

    res.json(items)
  } catch (error) {
    console.error('Get loadout items error:', error)
    res.status(500).json({
      error: 'Failed to get loadout items',
      message: error instanceof Error ? error.message : String(error),
    })
  }
})

// GET /api/loadouts/:id - Get single loadout
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const loadoutId = req.params.id
    const loadout = await getLoadoutById(loadoutId, userId)

    if (!loadout) {
      return res.status(404).json({ error: 'Loadout not found' })
    }

    res.json(loadout)
  } catch (error) {
    console.error('Get loadout error:', error)
    res.status(500).json({ error: 'Failed to get loadout' })
  }
})

// GET /api/loadouts/:id/power-level - Calculate power level for loadout
router.get('/:id/power-level', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const loadoutId = req.params.id
    const loadout = await getLoadoutById(loadoutId, userId)

    if (!loadout) {
      return res.status(404).json({ error: 'Loadout not found' })
    }

    // Convert loadout slots to item data format
    const items = loadout.slots.map(slot => ({
      id: slot.item.id,
      name: slot.item.name,
      slotType: slot.slotType,
      powerLevel: slot.item.powerLevel,
      benefits: slot.item.benefits as Record<string, any>,
    }))

    const powerLevel = calculatePowerLevel(items)

    res.json(powerLevel)
  } catch (error) {
    console.error('Calculate power level error:', error)
    res.status(500).json({ error: 'Failed to calculate power level' })
  }
})

// POST /api/loadouts - Create new loadout
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const data = createLoadoutSchema.parse(req.body)

    const loadout = await createLoadout(userId, data)

    res.status(201).json(loadout)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    console.error('Create loadout error:', error)
    res.status(500).json({ error: 'Failed to create loadout' })
  }
})

// PUT /api/loadouts/:id - Update loadout
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const loadoutId = req.params.id
    const data = updateLoadoutSchema.parse(req.body)

    const loadout = await updateLoadout(loadoutId, userId, data)

    res.json(loadout)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    if (error instanceof Error && error.message === 'Loadout not found') {
      return res.status(404).json({ error: error.message })
    }
    console.error('Update loadout error:', error)
    res.status(500).json({ error: 'Failed to update loadout' })
  }
})

// PUT /api/loadouts/:id/activate - Activate loadout
router.put('/:id/activate', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const loadoutId = req.params.id

    const loadout = await activateLoadout(loadoutId, userId)

    res.json(loadout)
  } catch (error) {
    if (error instanceof Error && error.message === 'Loadout not found') {
      return res.status(404).json({ error: error.message })
    }
    console.error('Activate loadout error:', error)
    res.status(500).json({ error: 'Failed to activate loadout' })
  }
})

// DELETE /api/loadouts/:id - Delete loadout
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const loadoutId = req.params.id

    await deleteLoadout(loadoutId, userId)

    res.status(204).send()
  } catch (error) {
    if (error instanceof Error && error.message === 'Loadout not found') {
      return res.status(404).json({ error: error.message })
    }
    console.error('Delete loadout error:', error)
    res.status(500).json({ error: 'Failed to delete loadout' })
  }
})

export default router

