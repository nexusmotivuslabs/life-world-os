/**
 * Admin Guard Middleware
 * 
 * Ensures only admin users can access admin routes.
 * Admin status is only configurable in the database.
 */

import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from './auth'
import { logger } from '../lib/logger.js'

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    })

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      })
    }

    if (!user.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required. Admin status can only be granted via database configuration.',
      })
    }

    next()
  } catch (error) {
    logger.error('Admin guard error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify admin status',
    })
  }
}


