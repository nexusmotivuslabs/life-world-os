import { describe, it, expect, vi } from 'vitest'
import { sendProblem } from '../problemDetails'
import type { Response } from 'express'

describe('problemDetails', () => {
  describe('sendProblem', () => {
    it('sets Content-Type to application/problem+json', () => {
      const res = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response
      sendProblem(res, 400, 'Bad Request')
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/problem+json')
    })

    it('calls status with the given code', () => {
      const res = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response
      sendProblem(res, 404, 'Not Found')
      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('sends problem details body with title and status', () => {
      const res = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response
      sendProblem(res, 422, 'Validation Failed')
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Validation Failed',
          status: 422,
        })
      )
    })

    it('includes optional detail in body', () => {
      const res = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response
      sendProblem(res, 400, 'Bad Request', { detail: 'Missing id field' })
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: 'Missing id field',
        })
      )
    })

    it('returns the response for chaining', () => {
      const res = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response
      const result = sendProblem(res, 500, 'Internal Server Error')
      expect(result).toBe(res)
    })
  })
})
