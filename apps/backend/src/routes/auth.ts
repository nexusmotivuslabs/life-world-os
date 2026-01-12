import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '../lib/prisma'

const router = Router()

// Initialize Google OAuth client
const googleClient = process.env.GOOGLE_CLIENT_ID 
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null

// Helper function to initialize user data
async function initializeUserData(userId: string) {
  await Promise.all([
    prisma.cloud.create({
      data: {
        userId,
        capacityStrength: 50,
        enginesStrength: 50,
        oxygenStrength: 50,
        meaningStrength: 50,
        optionalityStrength: 50,
      },
    }),
    prisma.resources.create({
      data: {
        userId,
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
        userId,
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
}

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(100),
  password: z.string().min(8),
  firstName: z.string().min(1).max(100).optional(), // Optional first name
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

    const { email, username, password, firstName } = registerSchema.parse(req.body)

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
          firstName: firstName || undefined, // Store firstName if provided
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
      await initializeUserData(user.id)
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
        firstName: user.firstName,
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

    // Check if user has a password (OAuth-only users don't have passwordHash)
    if (!user.passwordHash) {
      return res.status(401).json({ error: 'This account uses Google Sign-In. Please sign in with Google.' })
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
        firstName: user.firstName,
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

// Google OAuth endpoint
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' })
    }

    if (!googleClient || !process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Google OAuth not configured' })
    }

    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { sub: googleId, email, name, picture, given_name } = payload

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google' })
    }

    // Extract first name from Google (priority: given_name > name.split[0])
    let firstName: string | undefined = undefined
    if (given_name) {
      firstName = given_name
    } else if (name) {
      // Fallback: extract first word from full name
      const nameParts = name.trim().split(/\s+/)
      if (nameParts.length > 0) {
        firstName = nameParts[0]
      }
    }

    // Generate username from email (before @)
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    let username = baseUsername
    let usernameCounter = 1

    // Find existing user by Google ID or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email },
        ],
      },
    })

    if (!user) {
      // User does not exist - require sign-up first
      return res.status(404).json({ 
        error: 'Account not found',
        message: 'Please sign up first before using Google Sign-In. Visit /register to create an account.',
        requiresSignUp: true
      })
    }

    // Update existing user with Google ID and firstName if not set (link Google account)
    const updateData: { googleId?: string; firstName?: string } = {}
    if (!user.googleId) {
      updateData.googleId = googleId
    }
    if (!user.firstName && firstName) {
      updateData.firstName = firstName
    }
    if (Object.keys(updateData).length > 0) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      })
    }

    // Generate JWT token
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
        firstName: user.firstName,
      },
    })
  } catch (error) {
    console.error('Google OAuth error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Token used too early') || error.message.includes('expired')) {
        return res.status(401).json({ error: 'Token expired or invalid' })
      }
      if (error.message.includes('JWT_SECRET')) {
        return res.status(500).json({ error: 'Server configuration error' })
      }
    }
    
    res.status(500).json({ error: 'Authentication failed' })
  }
})

export default router

