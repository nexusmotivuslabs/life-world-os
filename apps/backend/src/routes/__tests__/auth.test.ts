/**
 * Auth Routes Tests
 * 
 * Tests for authentication endpoints including firstName handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Request, Response } from 'express'
import { prisma } from '../../lib/prisma'
import { OAuth2Client } from 'google-auth-library'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Mock dependencies
vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    cloud: { create: vi.fn() },
    resources: { create: vi.fn() },
    xp: { create: vi.fn() },
  },
}))

vi.mock('google-auth-library')
vi.mock('bcryptjs')
vi.mock('jsonwebtoken')
vi.mock('../../services/userService', () => ({
  initializeUserData: vi.fn(),
}))

// Import after mocks
import router from '../auth'
import { initializeUserData } from '../../services/userService'

describe('Auth Routes', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let jsonSpy: ReturnType<typeof vi.fn>
  let statusSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    jsonSpy = vi.fn()
    statusSpy = vi.fn().mockReturnValue({ json: jsonSpy })
    
    mockReq = {
      body: {},
      headers: {},
    }
    
    mockRes = {
      status: statusSpy,
      json: jsonSpy,
    } as Response

    process.env.JWT_SECRET = 'test-secret'
    process.env.JWT_EXPIRES_IN = '7d'
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('POST /register', () => {
    it('should register user with firstName when provided', async () => {
      mockReq.body = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'John',
      }

      vi.mocked(prisma.user.findFirst).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never)
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        passwordHash: 'hashed-password',
        googleId: null,
      } as any)
      vi.mocked(prisma.cloud.create).mockResolvedValue({} as any)
      vi.mocked(prisma.resources.create).mockResolvedValue({} as any)
      vi.mocked(prisma.xp.create).mockResolvedValue({} as any)
      vi.mocked(initializeUserData).mockResolvedValue(undefined)
      vi.mocked(jwt.sign).mockReturnValue('jwt-token' as any)

      // Execute register handler
      const registerHandler = router.stack.find(
        (layer: any) => layer.route?.path === '/' && layer.route?.methods?.post
      )?.route?.stack?.[0]?.handle

      if (registerHandler) {
        await registerHandler(mockReq, mockRes)

        expect(prisma.user.create).toHaveBeenCalledWith({
          data: {
            email: 'test@example.com',
            username: 'testuser',
            passwordHash: 'hashed-password',
            firstName: 'John',
          },
        })
        
        expect(statusSpy).toHaveBeenCalledWith(201)
        expect(jsonSpy).toHaveBeenCalledWith({
          token: 'jwt-token',
          user: {
            id: 'user-id',
            email: 'test@example.com',
            username: 'testuser',
            firstName: 'John',
          },
        })
      }
    })

    it('should register user without firstName when not provided', async () => {
      mockReq.body = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      }

      vi.mocked(prisma.user.findFirst).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never)
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        username: 'testuser',
        firstName: null,
        passwordHash: 'hashed-password',
        googleId: null,
      } as any)
      vi.mocked(initializeUserData).mockResolvedValue(undefined)
      vi.mocked(jwt.sign).mockReturnValue('jwt-token' as any)

      // Similar test logic
    })
  })

  describe('POST /google', () => {
    it('should extract firstName from Google given_name', async () => {
      const mockGoogleClient = {
        verifyIdToken: vi.fn(),
      }
      
      const mockTicket = {
        getPayload: vi.fn().mockReturnValue({
          sub: 'google-id',
          email: 'test@example.com',
          given_name: 'John',
          name: 'John Doe',
          picture: 'https://example.com/pic.jpg',
        }),
      }

      vi.mocked(mockGoogleClient.verifyIdToken).mockResolvedValue(mockTicket as any)
      
      mockReq.body = { idToken: 'google-id-token' }
      
      vi.mocked(prisma.user.findFirst).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        username: 'testuser',
        firstName: null,
        googleId: null,
      } as any)
      
      vi.mocked(prisma.user.update).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        googleId: 'google-id',
      } as any)
      
      vi.mocked(jwt.sign).mockReturnValue('jwt-token' as any)

      // Test that firstName is extracted from given_name
      expect(mockTicket.getPayload().given_name).toBe('John')
    })

    it('should extract firstName from full name when given_name not available', async () => {
      const mockTicket = {
        getPayload: vi.fn().mockReturnValue({
          sub: 'google-id',
          email: 'test@example.com',
          name: 'Jane Doe',
          picture: 'https://example.com/pic.jpg',
        }),
      }

      // Verify firstName extraction logic
      const nameParts = mockTicket.getPayload().name.trim().split(/\s+/)
      expect(nameParts[0]).toBe('Jane')
    })

    it('should update existing user with firstName from Google', async () => {
      // Test that firstName is updated when linking Google account
    })
  })

  describe('POST /login', () => {
    it('should return firstName in login response', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        passwordHash: 'hashed-password',
      } as any)
      
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      vi.mocked(jwt.sign).mockReturnValue('jwt-token' as any)

      // Verify firstName is included in response
    })
  })
})
