/**
 * RFC 7807 Problem Details for HTTP APIs
 * https://datatracker.ietf.org/doc/html/rfc7807
 */

import type { Response } from 'express'

export interface ProblemDetails {
  type?: string
  title: string
  status: number
  detail?: string
  instance?: string
  traceId?: string
  [key: string]: unknown
}

const DEFAULT_TYPE_BASE = 'https://api.lifeworld.os/errors'

/**
 * Send an RFC 7807 problem details response and return the response for optional chaining.
 */
export function sendProblem(
  res: Response,
  status: number,
  title: string,
  options: Omit<Partial<ProblemDetails>, 'title' | 'status'> = {}
): Response {
  const body: ProblemDetails = {
    type: options.type ?? `${DEFAULT_TYPE_BASE}#${status}`,
    title,
    status,
    ...options,
  }
  res.setHeader('Content-Type', 'application/problem+json')
  return res.status(status).json(body)
}
