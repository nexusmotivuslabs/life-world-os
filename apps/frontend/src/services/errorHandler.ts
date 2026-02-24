/**
 * Error Handler Utility
 *
 * Provides detailed error handling and logging for API requests.
 * Logs all known user issues (validation, auth, missing details) in a consistent format.
 */

import { logger } from '../lib/logger'

export interface ApiError extends Error {
  status?: number
  statusText?: string
  endpoint?: string
  method?: string
  responseBody?: any
  originalError?: Error
}

/** Known user-issue codes from API (RFC 7807 or legacy) */
const USER_ISSUE_CODES = new Set([
  'VALIDATION_ERROR',
  'USER_ALREADY_EXISTS',
  'USER_NOT_FOUND',
  'INVALID_CREDENTIALS',
  'OAUTH_ONLY_ACCOUNT',
  'MISSING_ID_TOKEN',
  'EMAIL_NOT_PROVIDED',
  'INVALID_TOKEN',
  'TOKEN_EXPIRED',
  'REQUIRES_SIGN_UP',
  'REQUIRES_FIRST_NAME',
  'CONFIG_ERROR',
  'SCHEMA_MISMATCH',
  'AUTH_FAILED',
  'USER_CREATE_FAILED',
  'USER_INIT_FAILED',
  'REGISTRATION_FAILED',
  'LOGIN_FAILED',
  'PROFILE_FETCH_FAILED',
  'PROFILE_UPDATE_FAILED',
])

export type UserIssueType = 'validation' | 'auth' | 'not_found' | 'missing_details' | 'client_error'

/**
 * Log a known user issue (validation, missing details, auth failures) for debugging and observability.
 * Call this whenever the API returns a 4xx that represents a user-fixable or expected condition.
 */
export function logUserIssue(
  context: {
    type: UserIssueType
    code?: string
    status: number
    detail?: string
    title?: string
    endpoint: string
    method: string
    [key: string]: unknown
  }
): void {
  const payload = {
    userIssue: true,
    type: context.type,
    code: context.code,
    status: context.status,
    detail: context.detail,
    title: context.title,
    endpoint: context.endpoint,
    method: context.method,
    timestamp: new Date().toISOString(),
    ...(context.responseBody && { responseBody: context.responseBody }),
  }
  logger.warn('[User Issue] ' + (context.detail || context.title || context.code || String(context.status)), payload)
}

function inferUserIssueType(status: number, code?: string): UserIssueType {
  if (code === 'USER_NOT_FOUND' || code === 'REQUIRES_SIGN_UP') return 'not_found'
  if (code === 'VALIDATION_ERROR' || code === 'USER_ALREADY_EXISTS') return 'validation'
  if (
    code === 'INVALID_CREDENTIALS' ||
    code === 'OAUTH_ONLY_ACCOUNT' ||
    code === 'INVALID_TOKEN' ||
    code === 'TOKEN_EXPIRED' ||
    code === 'AUTH_FAILED' ||
    code === 'LOGIN_FAILED'
  )
    return 'auth'
  if (code === 'REQUIRES_FIRST_NAME' || code === 'MISSING_ID_TOKEN' || code === 'EMAIL_NOT_PROVIDED') return 'missing_details'
  if (status >= 400 && status < 500) return 'client_error'
  return 'client_error'
}

/**
 * Create a detailed API error with context
 */
export function createApiError(
  message: string,
  endpoint: string,
  method: string = 'GET',
  status?: number,
  statusText?: string,
  responseBody?: any,
  originalError?: Error
): ApiError {
  const error = new Error(message) as ApiError
  error.name = 'ApiError'
  error.endpoint = endpoint
  error.method = method
  error.status = status
  error.statusText = statusText
  error.responseBody = responseBody
  error.originalError = originalError
  return error
}

/**
 * Parse response body once (body can only be read once)
 */
async function parseResponseBody(response: Response): Promise<{ message: string; body: any }> {
  const contentType = response.headers.get('content-type')
  try {
    if (contentType?.includes('application/json') || contentType?.includes('application/problem+json')) {
      const data = await response.json()
      const message =
        data.detail ?? data.error ?? data.message ?? `HTTP ${response.status}: ${response.statusText}`
      return { message, body: data }
    }
    const text = await response.text()
    return { message: text || `HTTP ${response.status}: ${response.statusText}`, body: null }
  } catch {
    return { message: `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`, body: null }
  }
}

/**
 * Handle fetch errors with detailed logging
 */
export async function handleFetchError(
  response: Response | null,
  endpoint: string,
  method: string = 'GET',
  originalError?: Error
): Promise<never> {
  // Network error (no response)
  if (!response) {
    const error = createApiError(
      'Unable to connect. Please try again later.',
      endpoint,
      method,
      undefined,
      undefined,
      undefined,
      originalError
    )
    if (import.meta.env.DEV) {
      console.error('API Request Failed (network):', { endpoint, method, error: originalError?.message })
    }
    throw error
  }

  // HTTP error (response exists but not ok) - read body once
  try {
    const { message: errorMessage, body: responseBody } = await parseResponseBody(response)

    const error = createApiError(
      errorMessage,
      endpoint,
      method,
      response.status,
      response.statusText,
      responseBody,
      originalError
    )

    // Log all 4xx as known user issues (validation, auth, missing details, etc.)
    if (response.status >= 400 && response.status < 500 && responseBody) {
      const code = responseBody.code ?? responseBody.error
      logUserIssue({
        type: inferUserIssueType(response.status, code),
        code: code ?? undefined,
        status: response.status,
        detail: responseBody.detail ?? responseBody.error ?? responseBody.message,
        title: responseBody.title,
        endpoint,
        method,
        responseBody,
      })
    }

    if (import.meta.env.DEV) {
      console.error('API Request Failed:', { endpoint, method, status: response.status, error: errorMessage })
    }
    throw error
  } catch (e) {
    // If we already threw an error, re-throw it
    if (e && typeof e === 'object' && 'endpoint' in e) {
      throw e
    }

    // Otherwise, create a generic error
    const error = createApiError(
      `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`,
      endpoint,
      method,
      response.status,
      response.statusText,
      undefined,
      originalError
    )

    if (import.meta.env.DEV) {
      console.error('API Request Failed (fallback):', { endpoint, method, status: response.status, error: e })
    }
    throw error
  }
}

/**
 * Log successful API requests (optional, for debugging)
 */
export function logApiSuccess(
  endpoint: string,
  method: string = 'GET',
  status: number = 200,
  duration?: number
) {
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ API Request Success:', {
      endpoint,
      method,
      status,
      duration: duration ? `${duration}ms` : undefined,
      timestamp: new Date().toISOString(),
    })
  }
}





