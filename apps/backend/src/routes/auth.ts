import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(100),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// Register
router.post('/register', async (req, res) => {
  try {
    // Ensure Prisma client is available
    if (!prisma) {
      console.error('Prisma client is not initialized')
      return res.status(503).json({ error: 'Database connection not available. Please try again later.' })
    }

    const { email, username, password } = registerSchema.parse(req.body)

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user with initial data
    let user
    try {
      user = await prisma.user.create({
        data: {
          email,
          username,
          passwordHash,
        },
      })
    } catch (createError: any) {
      console.error('User creation error:', createError)
      return res.status(500).json({ 
        error: 'Failed to create user account.',
        details: process.env.NODE_ENV === 'development' ? createError.message : undefined
      })
    }

    // Create initial cloud, resources, and XP records
    try {
      await Promise.all([
      prisma.cloud.create({
        data: {
          userId: user.id,
          capacityStrength: 50,
          enginesStrength: 50,
          oxygenStrength: 50,
          meaningStrength: 50,
          optionalityStrength: 50,
        },
      }),
      prisma.resources.create({
        data: {
          userId: user.id,
          oxygen: 0,
          water: 50,
          gold: 0,
          armor: 0,
          keys: 0,
          energy: 100, // Base daily energy, will be reset by daily tick
        },
      }),
      prisma.xP.create({
        data: {
          userId: user.id,
          overallXP: 0,
          overallRank: 'RECRUIT',
          overallLevel: 1,
          capacityXP: 0,
          enginesXP: 0,
          oxygenXP: 0,
          meaningXP: 0,
          optionalityXP: 0,
        },
      }),
      ])
    } catch (initError: any) {
      console.error('Initial data creation error:', initError)
      // User was created but initial data failed - try to clean up
      try {
        await prisma.user.delete({ where: { id: user.id } })
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError)
      }
      return res.status(500).json({ 
        error: 'Failed to initialize user data. Please try again.',
        details: process.env.NODE_ENV === 'development' ? initError.message : undefined
      })
    }

    // Generate token
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured')
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    })

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      })
    }
    console.error('Register error:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('JWT_SECRET')) {
        return res.status(500).json({ error: 'Server configuration error. Please contact support.' })
      }
      if (error.message.includes('connect') || error.message.includes('database')) {
        return res.status(503).json({ error: 'Database connection failed. Please try again later.' })
      }
      return res.status(500).json({ error: error.message || 'Registration failed' })
    }
    
    res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured')
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    })

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

export default router

