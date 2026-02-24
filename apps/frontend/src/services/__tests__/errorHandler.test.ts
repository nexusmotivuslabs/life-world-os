import { describe, it, expect, vi } from 'vitest'
import { createApiError, logUserIssue, handleFetchError, type ApiError } from '../errorHandler'

vi.mock('../../lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('errorHandler', () => {
  describe('createApiError', () => {
    it('creates an error with message and context', () => {
      const err = createApiError('Test error', '/api/test', 'POST')
      expect(err.message).toBe('Test error')
      expect(err.name).toBe('ApiError')
      expect(err.endpoint).toBe('/api/test')
      expect(err.method).toBe('POST')
    })

    it('defaults method to GET', () => {
      const err = createApiError('Test', '/api/test')
      expect(err.method).toBe('GET')
    })

    it('includes status, statusText, responseBody when provided', () => {
      const err = createApiError('Test', '/api/test', 'GET', 404, 'Not Found', { code: 'NOT_FOUND' })
      expect(err.status).toBe(404)
      expect(err.statusText).toBe('Not Found')
      expect(err.responseBody).toEqual({ code: 'NOT_FOUND' })
    })

    it('includes originalError when provided', () => {
      const orig = new Error('Network failed')
      const err = createApiError('Test', '/api/test', 'GET', undefined, undefined, undefined, orig)
      expect(err.originalError).toBe(orig)
    })
  })

  describe('logUserIssue', () => {
    it('calls logger.warn with payload', async () => {
      const { logger } = await import('../../lib/logger')
      logUserIssue({
        type: 'auth',
        code: 'INVALID_CREDENTIALS',
        status: 401,
        detail: 'Wrong password',
        endpoint: '/api/auth/login',
        method: 'POST',
      })
      expect(logger.warn).toHaveBeenCalled()
    })
  })

  describe('handleFetchError', () => {
    it('throws ApiError when response is null (network error)', async () => {
      await expect(handleFetchError(null, '/api/test', 'GET')).rejects.toMatchObject({
        message: expect.stringContaining('Unable to connect'),
        endpoint: '/api/test',
        method: 'GET',
      })
    })

    it('throws ApiError for non-ok HTTP response with parsed body', async () => {
      const res = new Response(JSON.stringify({ detail: 'Unauthorized' }), {
        status: 401,
        statusText: 'Unauthorized',
        headers: { 'Content-Type': 'application/json' },
      })
      await expect(handleFetchError(res, '/api/test', 'GET')).rejects.toMatchObject({
        message: 'Unauthorized',
        status: 401,
        endpoint: '/api/test',
      })
    })

    it('uses detail, error, or message from JSON body', async () => {
      const res = new Response(JSON.stringify({ error: 'Validation failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
      let err: Error
      try {
        await handleFetchError(res, '/api/test', 'POST')
        err = new Error('Expected throw')
      } catch (e) {
        err = e as Error
      }
      expect(err.message).toBe('Validation failed')
      expect((err as ApiError).responseBody).toEqual({ error: 'Validation failed' })
    })
  })
})
