'use client'

import { Component, ReactNode, ErrorInfo } from 'react'
import { logger } from '@/lib/utils/error-handler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Log the error
    logger.error('React Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
          <div className="max-w-md w-full">
            <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/10">
                <svg
                  className="w-8 h-8 text-destructive"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-center mb-4 text-foreground">
                Something went wrong
              </h2>

              <p className="text-muted-foreground text-center mb-6">
                An unexpected error occurred. Our team has been notified and is working to fix it.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Reload Page
                </button>

                <button
                  onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                  className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                >
                  Try Again
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Error Details (Dev Mode)
                  </summary>
                  <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-auto text-red-600">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component version
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={errorFallback}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

// Hook for error handling in components
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack: string }) => {
    logger.error('Component error', error, errorInfo)
  }
}
