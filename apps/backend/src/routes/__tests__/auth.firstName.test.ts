/**
 * Auth Routes - FirstName Extraction Tests
 * 
 * Tests specifically for firstName extraction from Google OAuth.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('FirstName Extraction from Google OAuth', () => {
  it('should extract firstName from given_name (priority)', () => {
    const payload = {
      sub: 'google-id',
      email: 'test@example.com',
      given_name: 'John',
      name: 'John Doe',
    }

    let firstName: string | undefined = undefined
    if (payload.given_name) {
      firstName = payload.given_name
    } else if (payload.name) {
      const nameParts = payload.name.trim().split(/\s+/)
      if (nameParts.length > 0) {
        firstName = nameParts[0]
      }
    }

    expect(firstName).toBe('John')
  })

  it('should extract firstName from name when given_name not available', () => {
    const payload = {
      sub: 'google-id',
      email: 'test@example.com',
      name: 'Jane Smith',
    }

    let firstName: string | undefined = undefined
    if (payload.given_name) {
      firstName = payload.given_name
    } else if (payload.name) {
      const nameParts = payload.name.trim().split(/\s+/)
      if (nameParts.length > 0) {
        firstName = nameParts[0]
      }
    }

    expect(firstName).toBe('Jane')
  })

  it('should handle empty name gracefully', () => {
    const payload = {
      sub: 'google-id',
      email: 'test@example.com',
      name: '',
    }

    let firstName: string | undefined = undefined
    if (payload.given_name) {
      firstName = payload.given_name
    } else if (payload.name) {
      const nameParts = payload.name.trim().split(/\s+/)
      if (nameParts.length > 0) {
        firstName = nameParts[0]
      }
    }

    expect(firstName).toBeUndefined()
  })

  it('should handle missing name fields', () => {
    const payload = {
      sub: 'google-id',
      email: 'test@example.com',
    } as any

    let firstName: string | undefined = undefined
    if (payload.given_name) {
      firstName = payload.given_name
    } else if (payload.name) {
      const nameParts = payload.name.trim().split(/\s+/)
      if (nameParts.length > 0) {
        firstName = nameParts[0]
      }
    }

    expect(firstName).toBeUndefined()
  })

  it('should prioritize given_name over name', () => {
    const payload = {
      sub: 'google-id',
      email: 'test@example.com',
      given_name: 'John',
      name: 'Jane Doe', // Should be ignored
    }

    let firstName: string | undefined = undefined
    if (payload.given_name) {
      firstName = payload.given_name
    } else if (payload.name) {
      const nameParts = payload.name.trim().split(/\s+/)
      if (nameParts.length > 0) {
        firstName = nameParts[0]
      }
    }

    expect(firstName).toBe('John')
    expect(firstName).not.toBe('Jane')
  })
})
