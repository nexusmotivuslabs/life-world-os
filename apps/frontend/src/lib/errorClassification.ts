/**
 * Error Classification Utility
 * 
 * Distinguishes between user errors (should be shown to users) and app errors
 * (should be hidden from users, only logged).
 * 
 * User Errors: Validation errors, business logic errors, authentication errors
 * App Errors: System errors, bugs, unexpected errors
 */

import { ApiError } from '../services/errorHandler'

export type ErrorType = 'user' | 'app' | 'unknown'

export interface ClassifiedError {
  type: ErrorType
  isUserError: boolean
  isAppError: boolean
  userMessage: string
  technicalMessage: string
  shouldShowToUser: boolean
}

/**
 * Check if an HTTP status code represents a user error
 */
function isUserErrorStatus(status: number): boolean {
  // 4xx errors are typically user errors (except some 5xx that might be user-facing)
  return status >= 400 && status < 500
}

/**
 * Check if an error message indicates a user error
 */
function isUserErrorMessage(message: string): boolean {
  const userErrorKeywords = [
    'validation',
    'invalid',
    'required',
    'missing',
    'unauthorized',
    'forbidden',
    'not found',
    'already exists',
    'duplicate',
    'insufficient',
    'limit exceeded',
    'not allowed',
    'permission',
    'authentication',
    'authorization',
  ]

  const lowerMessage = message.toLowerCase()
  return userErrorKeywords.some(keyword => lowerMessage.includes(keyword))
}

/**
 * Classify an error as user error or app error
 */
export function classifyError(error: Error | ApiError | unknown): ClassifiedError {
  // Default to app error (don't show to users)
  let type: ErrorType = 'app'
  let userMessage = 'Something went wrong. Please try again later.'
  let technicalMessage = 'Unknown error'

  if (error instanceof Error) {
    technicalMessage = error.message

    // Check if it's an ApiError with status code
    if ('status' in error) {
      const apiError = error as ApiError
      const status = apiError.status

      if (status) {
        if (isUserErrorStatus(status)) {
          type = 'user'
          // Use the error message from the API (it's user-facing)
          userMessage = apiError.message || userMessage
        } else {
          // 5xx errors are app errors
          type = 'app'
          userMessage = 'A server error occurred. Our team has been notified.'
        }
      } else {
        // Network errors are app errors
        type = 'app'
        userMessage = 'Unable to connect to the server. Please check your connection.'
      }
    } else {
      // Check error message for user error keywords
      if (isUserErrorMessage(error.message)) {
        type = 'user'
        userMessage = error.message
      } else {
        type = 'app'
        userMessage = 'An unexpected error occurred. Please try again.'
      }
    }
  } else if (typeof error === 'string') {
    technicalMessage = error
    if (isUserErrorMessage(error)) {
      type = 'user'
      userMessage = error
    } else {
      type = 'app'
    }
  }

  return {
    type,
    isUserError: type === 'user',
    isAppError: type === 'app',
    userMessage,
    technicalMessage: technicalMessage || 'Unknown error',
    shouldShowToUser: type === 'user',
  }
}

/**
 * Get user-friendly error message
 */
export function getUserErrorMessage(error: Error | ApiError | unknown): string {
  const classified = classifyError(error)
  return classified.userMessage
}

/**
 * Check if error should be shown to user
 */
export function shouldShowErrorToUser(error: Error | ApiError | unknown): boolean {
  const classified = classifyError(error)
  return classified.shouldShowToUser
}


