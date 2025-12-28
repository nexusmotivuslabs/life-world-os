import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { classifyError, ClassifiedError } from '../lib/errorClassification'
import { logger } from '../lib/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'app' | 'feature' | 'component'
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  classifiedError?: ClassifiedError
}

/**
 * ErrorBoundary Component
 * 
 * Catches React component errors and displays a fallback UI instead of crashing the app.
 * Supports multiple levels: app-level, feature-level, and component-level.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const classified = classifyError(error)
    return {
      hasError: true,
      error,
      errorInfo: null,
      classifiedError: classified,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Classify error
    const classified = classifyError(error)
    
    // Always log app errors (but don't show to users)
    // User errors are also logged but can be shown to users
    logger.error(`ErrorBoundary (${this.props.level || 'component'}) caught an error`, error, {
      errorInfo,
      componentStack: errorInfo.componentStack,
      errorType: classified.type,
      isUserError: classified.isUserError,
      timestamp: new Date().toISOString(),
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Store error and classification
    // App errors will show generic message, user errors will show specific message
    this.setState({
      error,
      errorInfo,
      classifiedError: classified,
    })
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      classifiedError: undefined,
    })
  }

  handleGoHome = () => {
    window.location.href = '/choose-plane'
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const classified = this.state.classifiedError || classifyError(this.state.error || new Error('Unknown error'))
      const isUserError = classified.isUserError
      const userMessage = classified.userMessage

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-gray-800 rounded-lg border border-red-500/30 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-400">
                  {isUserError ? 'Error' : 'Something went wrong'}
                </h1>
                <p className="text-gray-400 mt-1">
                  {isUserError 
                    ? userMessage
                    : this.props.level === 'app' 
                    ? 'The application encountered an error. Our team has been notified.'
                    : this.props.level === 'feature'
                    ? 'This feature encountered an error. Please try again later.'
                    : 'This component encountered an error. Please try again.'}
                </p>
              </div>
            </div>

            {/* Show user error details, but hide app error details from users */}
            {isUserError && this.state.error && (
              <div className="mb-6 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                <p className="text-sm text-red-300">{userMessage}</p>
              </div>
            )}

            {/* Technical details are logged to console in development only */}
            {/* Users should not see technical error details */}

            <div className="flex gap-4">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              {this.props.level === 'app' && (
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Go to Entry Point
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Feature-level Error Boundary
 * Wraps a specific feature/system (e.g., Master Money, Energy)
 */
export function FeatureErrorBoundary({ 
  children, 
  featureName 
}: { 
  children: ReactNode
  featureName: string 
}) {
  return (
    <ErrorBoundary
      level="feature"
      onError={(error, errorInfo) => {
        logger.error(`Feature error in ${featureName}`, error, { errorInfo })
      }}
      fallback={
        <div className="min-h-[400px] bg-gray-800 rounded-lg border border-red-500/30 p-8 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-400 mb-2">
              {featureName} Error
            </h2>
            <p className="text-gray-400 mb-4">
              This feature encountered an error. Please try refreshing or contact support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Component-level Error Boundary
 * Wraps individual components that might fail
 */
export function ComponentErrorBoundary({ 
  children, 
  componentName 
}: { 
  children: ReactNode
  componentName?: string 
}) {
  return (
    <ErrorBoundary
      level="component"
      fallback={
        <div className="p-4 bg-gray-800 rounded-lg border border-yellow-500/30">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">
              {componentName || 'Component'} is temporarily unavailable
            </span>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

