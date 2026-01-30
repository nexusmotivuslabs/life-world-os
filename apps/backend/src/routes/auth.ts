import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '../lib/prisma'
import { sendProblem } from '../utils/problemDetails'

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
  lastName: z.string().min(1).max(100).optional(),  // Optional last name
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
      return sendProblem(res, 503, 'Service Unavailable', {
        detail: 'Database connection not available. Please try again later.',
        code: 'DATABASE_UNAVAILABLE',
      })
    }

    const { email, username, password, firstName, lastName } = registerSchema.parse(req.body)

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return sendProblem(res, 400, 'Bad Request', {
        detail: 'Email or username already exists',
        code: 'USER_ALREADY_EXISTS',
      })
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
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        },
      })
    } catch (createError: any) {
      console.error('User creation error:', createError)
      return sendProblem(res, 500, 'Internal Server Error', {
        detail: 'Failed to create user account.',
        code: 'USER_CREATE_FAILED',
        ...(process.env.NODE_ENV === 'development' && { debug: createError.message }),
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
      return sendProblem(res, 500, 'Internal Server Error', {
        detail: 'Failed to initialize user data. Please try again.',
        code: 'USER_INIT_FAILED',
        ...(process.env.NODE_ENV === 'development' && { debug: initError.message }),
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
        lastName: user.lastName,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendProblem(res, 400, 'Bad Request', {
        detail: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
        code: 'VALIDATION_ERROR',
      })
    }
    console.error('Register error:', error)
    if (error instanceof Error) {
      if (error.message.includes('JWT_SECRET')) {
        return sendProblem(res, 500, 'Internal Server Error', {
          detail: 'Server configuration error. Please contact support.',
          code: 'CONFIG_ERROR',
        })
      }
      if (error.message.includes('connect') || error.message.includes('database')) {
        return sendProblem(res, 503, 'Service Unavailable', {
          detail: 'Database connection failed. Please try again later.',
          code: 'DATABASE_UNAVAILABLE',
        })
      }
      return sendProblem(res, 500, 'Internal Server Error', {
        detail: error.message || 'Registration failed',
        code: 'REGISTRATION_FAILED',
      })
    }
    return sendProblem(res, 500, 'Internal Server Error', {
      detail: 'Registration failed. Please try again.',
      code: 'REGISTRATION_FAILED',
    })
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
      return sendProblem(res, 401, 'Unauthorized', {
        detail: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      })
    }

    // Check if user has a password (OAuth-only users don't have passwordHash)
    if (!user.passwordHash) {
      return sendProblem(res, 401, 'Unauthorized', {
        detail: 'This account uses Google Sign-In. Please sign in with Google.',
        code: 'OAUTH_ONLY_ACCOUNT',
      })
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) {
      return sendProblem(res, 401, 'Unauthorized', {
        detail: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      })
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
        lastName: user.lastName,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendProblem(res, 400, 'Bad Request', {
        detail: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
        code: 'VALIDATION_ERROR',
      })
    }
    console.error('Login error:', error)
    return sendProblem(res, 500, 'Internal Server Error', {
      detail: 'Login failed',
      code: 'LOGIN_FAILED',
    })
  }
})

// Google OAuth endpoint
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body

    if (!idToken) {
      return sendProblem(res, 400, 'Bad Request', {
        detail: 'ID token is required',
        code: 'MISSING_ID_TOKEN',
      })
    }

    if (!googleClient || !process.env.GOOGLE_CLIENT_ID) {
      return sendProblem(res, 500, 'Internal Server Error', {
        detail: 'Google OAuth not configured',
        code: 'OAUTH_NOT_CONFIGURED',
      })
    }

    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    if (!payload) {
      return sendProblem(res, 401, 'Unauthorized', {
        detail: 'Invalid token',
        code: 'INVALID_TOKEN',
      })
    }

    const { sub: googleId, email, name, picture, given_name, family_name } = payload

    if (!email) {
      return sendProblem(res, 400, 'Bad Request', {
        detail: 'Email not provided by Google',
        code: 'EMAIL_NOT_PROVIDED',
      })
    }

    // Extract first name from Google (priority: given_name > name.split[0])
    let firstName: string | undefined = undefined
    if (given_name) {
      firstName = given_name
    } else if (name) {
      const nameParts = name.trim().split(/\s+/)
      if (nameParts.length > 0) {
        firstName = nameParts[0]
      }
    }
    // Extract last name from Google (family_name)
    const lastName: string | undefined = family_name ?? undefined

    // Generate username from email (before @)
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'
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
      // No account yet: create one from Google profile (Sign up / Sign in with Google)
      while (await prisma.user.findFirst({ where: { username } })) {
        username = `${baseUsername}${usernameCounter++}`
      }
      try {
        user = await prisma.user.create({
          data: {
            email,
            username,
            googleId,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            passwordHash: null,
          },
        })
      } catch (createError: unknown) {
        console.error('Google OAuth: user create failed', createError)
        return sendProblem(res, 500, 'Internal Server Error', {
          detail: 'Could not create your account. Please try again.',
          code: 'USER_CREATE_FAILED',
        })
      }
      try {
        await initializeUserData(user.id)
      } catch (initError: unknown) {
        console.error('Google OAuth: initialize user data failed', initError)
        try {
          await prisma.user.delete({ where: { id: user.id } })
        } catch (cleanupError) {
          console.error('Google OAuth: cleanup after init failure', cleanupError)
        }
        return sendProblem(res, 500, 'Internal Server Error', {
          detail: 'Could not set up your account. Please try again.',
          code: 'USER_INIT_FAILED',
        })
      }
    } else {
      // Existing user: link Google ID and fill in names if missing
      const updateData: { googleId?: string; firstName?: string; lastName?: string } = {}
      if (!user.googleId) {
        updateData.googleId = googleId
      }
      if (!user.firstName && firstName) {
        updateData.firstName = firstName
      }
      if (!user.lastName && lastName) {
        updateData.lastName = lastName
      }
      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        })
      }
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
        lastName: user.lastName,
      },
      // When Google didn't provide a name and user has none, ask them to set it
      requiresFirstName: !user.firstName || user.firstName.trim() === '',
    })
  } catch (error) {
    console.error('Google OAuth error:', error)
    if (error instanceof Error) {
      if (error.message.includes('Token used too early') || error.message.includes('expired')) {
        return sendProblem(res, 401, 'Unauthorized', {
          detail: 'Token expired or invalid',
          code: 'TOKEN_EXPIRED',
        })
      }
      if (error.message.includes('JWT_SECRET')) {
        return sendProblem(res, 500, 'Internal Server Error', {
          detail: 'Server configuration error',
          code: 'CONFIG_ERROR',
        })
      }
      if (error.message.includes('firstName') || error.message.includes('lastName') || error.message.includes('P2022')) {
        return sendProblem(res, 500, 'Internal Server Error', {
          detail: 'Database schema out of date. Please run migrations (npm run migrate).',
          code: 'SCHEMA_MISMATCH',
        })
      }
    }
    return sendProblem(res, 500, 'Internal Server Error', {
      detail: 'Authentication failed',
      code: 'AUTH_FAILED',
    })
  }
})

export default router

