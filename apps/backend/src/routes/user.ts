import { Router } from 'express'
import { z } from 'zod'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { sendProblem } from '../utils/problemDetails'

const router = Router()

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
})

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        currentSeason: true,
        seasonStartDate: true,
        overallXP: true,
        overallRank: true,
        overallLevel: true,
        isAdmin: true,
        createdAt: true,
      },
    })

    if (!user) {
      return sendProblem(res, 404, 'Not Found', {
        detail: 'User not found',
        code: 'USER_NOT_FOUND',
      })
    }

    res.json(user)
  } catch (error) {
    console.error('Get profile error:', error)
    return sendProblem(res, 500, 'Internal Server Error', {
      detail: 'Failed to get profile',
      code: 'PROFILE_FETCH_FAILED',
    })
  }
})

// Update user profile (e.g. first name for Google users who didn't have one)
router.patch('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const parsed = updateProfileSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendProblem(res, 400, 'Bad Request', {
        detail: parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
        code: 'VALIDATION_ERROR',
      })
    }

    const { firstName, lastName } = parsed.data
    const updateData: { firstName?: string | null; lastName?: string | null } = {}
    if (firstName !== undefined) {
      updateData.firstName = firstName.trim() === '' ? null : firstName.trim()
    }
    if (lastName !== undefined) {
      updateData.lastName = lastName.trim() === '' ? null : lastName.trim()
    }

    if (Object.keys(updateData).length === 0) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, username: true, firstName: true, lastName: true },
      })
      return res.json(user)
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        currentSeason: true,
        seasonStartDate: true,
        overallXP: true,
        overallRank: true,
        overallLevel: true,
        isAdmin: true,
        createdAt: true,
      },
    })

    res.json(user)
  } catch (error) {
    console.error('Update profile error:', error)
    return sendProblem(res, 500, 'Internal Server Error', {
      detail: 'Failed to update profile',
      code: 'PROFILE_UPDATE_FAILED',
    })
  }
})

export default router

