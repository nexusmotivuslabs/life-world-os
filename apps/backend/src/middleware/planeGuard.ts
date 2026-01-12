/**
 * Plane Guard Middleware
 * 
 * Enforces architectural separation between Knowledge Plane (read-only)
 * and Systems Plane (executable, state-changing).
 * 
 * Knowledge Plane routes should only allow GET requests.
 * Systems Plane routes must go through physics engine (energy checks, etc.).
 */

import { Request, Response, NextFunction } from 'express'

/**
 * Middleware to ensure Knowledge Plane routes are read-only
 * This prevents accidental mutations from Knowledge Plane access
 */
export function enforceKnowledgePlaneReadOnly(req: Request, res: Response, next: NextFunction) {
  // Only allow GET requests for Knowledge Plane routes
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Knowledge Plane is read-only',
      message: 'This route only supports GET requests. Use Systems Plane for state-changing operations.',
    })
  }
  next()
}

/**
 * Middleware to ensure Systems Plane routes go through physics engine
 * This is a placeholder - actual physics enforcement happens in route handlers
 * via energy checks, capacity modifiers, etc.
 */
export function enforceSystemsPlanePhysics(req: Request, res: Response, next: NextFunction) {
  // Systems Plane routes should always go through physics engine
  // This middleware serves as a reminder/audit point
  // Actual enforcement is in individual route handlers (energy checks, etc.)
  
  // Add header to indicate this is a Systems Plane request
  res.setHeader('X-Plane', 'systems')
  next()
}





