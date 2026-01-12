/**
 * Error Handler Utility
 * 
 * Provides detailed error handling and logging for API requests.
 */

export interface ApiError extends Error {
  status?: number
  statusText?: string
  endpoint?: string
  method?: string
  responseBody?: any
  originalError?: Error
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
 * Extract error message from response
 */
async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const data = await response.json()
      return data.error || data.message || `HTTP ${response.status}: ${response.statusText}`
    } else {
      const text = await response.text()
      return text || `HTTP ${response.status}: ${response.statusText}`
    }
  } catch (e) {
    return `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`
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
    const errorMessage = originalError?.message || 'Network request failed'
    const error = createApiError(
      `Network error: ${errorMessage}`,
      endpoint,
      method,
      undefined,
      undefined,
      undefined,
      originalError
    )

    console.error('❌ API Request Failed:', {
      endpoint,
      method,
      error: errorMessage,
      type: 'network',
      timestamp: new Date().toISOString(),
    })

    throw error
  }

  // HTTP error (response exists but not ok)
  try {
    const errorMessage = await extractErrorMessage(response)
    const responseBody = await response.json().catch(() => null)

    const error = createApiError(
      errorMessage,
      endpoint,
      method,
      response.status,
      response.statusText,
      responseBody,
      originalError
    )

    console.error('❌ API Request Failed:', {
      endpoint,
      method,
      status: response.status,
      statusText: response.statusText,
      error: errorMessage,
      responseBody,
      type: 'http',
      timestamp: new Date().toISOString(),
    })

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

    console.error('❌ API Request Failed (fallback):', {
      endpoint,
      method,
      status: response.status,
      statusText: response.statusText,
      error: e,
      type: 'http',
      timestamp: new Date().toISOString(),
    })

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





