/**
 * Logger Utility for Backend
 * 
 * Centralized logging with environment-aware behavior.
 * In production, logs are sent to observability tools (Prometheus, Grafana).
 * In development, logs are output to console.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production'
const logLevel = (process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel

const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function shouldLog(level: LogLevel): boolean {
  return levels[level] >= levels[logLevel]
}

function formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error): string {
  const timestamp = new Date().toISOString()
  const logEntry: Record<string, unknown> = {
    timestamp,
    level: level.toUpperCase(),
    message,
  }

  if (context) {
    logEntry.context = context
  }

  if (error) {
    logEntry.error = {
      name: error.name,
      message: error.message,
      stack: isDevelopment ? error.stack : undefined,
    }
  }

  return JSON.stringify(logEntry)
}

/**
 * Logger API
 * 
 * Usage:
 *   import { logger } from '../lib/logger'
 *   
 *   logger.info('User logged in', { userId: '123' })
 *   logger.error('Database error', error, { query: 'SELECT * FROM users' })
 */
export const logger = {
  /**
   * Log debug messages (development only)
   */
  debug: (message: string, context?: LogContext) => {
    if (shouldLog('debug') && isDevelopment) {
      console.debug(formatLog('debug', message, context))
    }
  },

  /**
   * Log informational messages
   */
  info: (message: string, context?: LogContext) => {
    if (shouldLog('info')) {
      if (isDevelopment) {
        console.log(formatLog('info', message, context))
      }
      // In production, send to observability (Prometheus, Grafana)
      // Note: Observability integration handled by metrics middleware
    }
  },

  /**
   * Log warning messages
   */
  warn: (message: string, context?: LogContext) => {
    if (shouldLog('warn')) {
      if (isDevelopment) {
        console.warn(formatLog('warn', message, context))
      }
      // In production, send to observability
    }
  },

  /**
   * Log error messages
   * Always logs errors, even in production (for debugging)
   */
  error: (message: string, error?: Error, context?: LogContext) => {
    if (shouldLog('error')) {
      if (isDevelopment) {
        console.error(formatLog('error', message, context, error))
      } else {
        // In production, send to error tracking service
        console.error(formatLog('error', message, context, error))
        // Note: Error tracking integration can be added via metrics middleware or external service
      }
    }
  },
}

/**
 * Legacy console replacement for gradual migration
 * Use logger.info(), logger.error(), etc. instead
 */
export const devConsole = {
  log: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.log(message, ...args)
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(message, ...args)
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.error(message, ...args)
    }
  },
  debug: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(message, ...args)
    }
  },
}

