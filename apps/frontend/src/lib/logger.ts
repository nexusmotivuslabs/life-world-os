/**
 * Logger Utility
 * 
 * Centralized logging that only outputs in development mode.
 * In production, logs are silent to avoid exposing debugging information to users.
 * 
 * Developers should use browser DevTools, local logs, or observability dashboards
 * for debugging in production.
 */

type LogLevel = 'log' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: unknown
}

const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development'

/**
 * Internal logger that respects environment
 */
function log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
  if (!isDevelopment) {
    // In production, silently ignore logs
    // Developers should use observability tools, local logs, or DevTools
    return
  }

  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}`
  
  if (context) {
    console[level](logMessage, context, error || '')
  } else if (error) {
    console[level](logMessage, error)
  } else {
    console[level](logMessage)
  }
}

/**
 * Logger API - Only logs in development
 */
export const logger = {
  /**
   * Log informational messages (development only)
   */
  log: (message: string, context?: LogContext) => {
    log('log', message, context)
  },

  /**
   * Log warning messages (development only)
   */
  warn: (message: string, context?: LogContext) => {
    log('warn', message, context)
  },

  /**
   * Log error messages (development only)
   * Note: Critical errors that affect user experience should still be handled
   * through proper error boundaries and user-facing error messages
   */
  error: (message: string, error?: Error, context?: LogContext) => {
    log('error', message, context, error)
  },

  /**
   * Log debug messages (development only)
   */
  debug: (message: string, context?: LogContext) => {
    log('debug', message, context)
  },
}

/**
 * Legacy console replacement for gradual migration
 * Use logger.log(), logger.error(), etc. instead
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





