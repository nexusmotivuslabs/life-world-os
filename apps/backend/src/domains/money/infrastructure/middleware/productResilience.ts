/**
 * Product Resilience Middleware
 * 
 * Middleware to ensure products remain available even when team/domain data has issues.
 * Provides circuit breaker pattern and graceful degradation.
 */

import { Request, Response, NextFunction } from 'express'

interface CircuitBreakerState {
  failures: number
  lastFailureTime: number | null
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
}

const circuitBreakers = new Map<string, CircuitBreakerState>()

const MAX_FAILURES = 5
const TIMEOUT_MS = 60000 // 1 minute
const HALF_OPEN_TIMEOUT_MS = 30000 // 30 seconds

/**
 * Get or initialize circuit breaker state for a key
 */
function getCircuitBreaker(key: string): CircuitBreakerState {
  if (!circuitBreakers.has(key)) {
    circuitBreakers.set(key, {
      failures: 0,
      lastFailureTime: null,
      state: 'CLOSED',
    })
  }
  return circuitBreakers.get(key)!
}

/**
 * Record a failure in the circuit breaker
 */
function recordFailure(key: string): void {
  const breaker = getCircuitBreaker(key)
  breaker.failures++
  breaker.lastFailureTime = Date.now()

  if (breaker.failures >= MAX_FAILURES) {
    breaker.state = 'OPEN'
    console.warn(`🔴 Circuit breaker OPEN for ${key} due to ${breaker.failures} failures`)
  }
}

/**
 * Record a success in the circuit breaker
 */
function recordSuccess(key: string): void {
  const breaker = getCircuitBreaker(key)
  breaker.failures = 0
  breaker.state = 'CLOSED'
}

/**
 * Check if circuit breaker allows request
 */
function isCircuitOpen(key: string): boolean {
  const breaker = getCircuitBreaker(key)

  if (breaker.state === 'CLOSED') {
    return false
  }

  if (breaker.state === 'OPEN') {
    // Check if timeout has passed
    if (breaker.lastFailureTime && Date.now() - breaker.lastFailureTime > TIMEOUT_MS) {
      breaker.state = 'HALF_OPEN'
      console.log(`🟡 Circuit breaker HALF_OPEN for ${key}, allowing test request`)
      return false
    }
    return true
  }

  // HALF_OPEN state - allow one request to test
  return false
}

/**
 * Middleware to add resilience headers
 */
export function productResilienceHeaders(req: Request, res: Response, next: NextFunction): void {
  // Add headers indicating resilience capabilities
  res.setHeader('X-Product-Resilience', 'enabled')
  res.setHeader('X-Product-Ownership', 'organization')
  next()
}

/**
 * Wrap async handler with circuit breaker and error handling
 */
export function withProductResilience<T>(
  key: string,
  handler: () => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Check circuit breaker
      if (isCircuitOpen(key)) {
        console.warn(`⚠️  Circuit breaker OPEN for ${key}, using fallback`)
        try {
          const result = await fallback()
          resolve(result)
          return
        } catch (fallbackError) {
          reject(fallbackError)
          return
        }
      }

      // Execute handler
      const result = await handler()
      recordSuccess(key)
      resolve(result)
    } catch (error) {
      recordFailure(key)
      
      // Try fallback before rejecting
      try {
        console.warn(`⚠️  Handler failed for ${key}, attempting fallback:`, error)
        const fallbackResult = await fallback()
        resolve(fallbackResult)
      } catch (fallbackError) {
        reject(error) // Return original error, not fallback error
      }
    }
  })
}


