// Global error types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'AUTH_ERROR', 401)
    this.name = 'AuthenticationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 'RATE_LIMIT', 429)
    this.name = 'RateLimitError'
  }
}

// Error logging utility
export class ErrorLogger {
  private static instance: ErrorLogger
  private logs: Array<{
    timestamp: Date
    level: 'error' | 'warn' | 'info' | 'debug'
    message: string
    error?: Error
    metadata?: Record<string, any>
  }> = []

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger()
    }
    return ErrorLogger.instance
  }

  error(message: string, error?: Error, metadata?: Record<string, any>) {
    const log = {
      timestamp: new Date(),
      level: 'error' as const,
      message,
      error,
      metadata,
    }

    this.logs.push(log)
    console.error(`[ERROR] ${message}`, error, metadata)

    // In production, you would send to a service like Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(log)
    }

    // Keep only last 1000 logs in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000)
    }
  }

  warn(message: string, metadata?: Record<string, any>) {
    const log = {
      timestamp: new Date(),
      level: 'warn' as const,
      message,
      metadata,
    }

    this.logs.push(log)
    console.warn(`[WARN] ${message}`, metadata)

    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(log)
    }
  }

  info(message: string, metadata?: Record<string, any>) {
    const log = {
      timestamp: new Date(),
      level: 'info' as const,
      message,
      metadata,
    }

    this.logs.push(log)
    console.info(`[INFO] ${message}`, metadata)

    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(log)
    }
  }

  debug(message: string, metadata?: Record<string, any>) {
    if (process.env.NODE_ENV !== 'production') {
      const log = {
        timestamp: new Date(),
        level: 'debug' as const,
        message,
        metadata,
      }

      this.logs.push(log)
      console.debug(`[DEBUG] ${message}`, metadata)
    }
  }

  getLogs(filter?: {
    level?: 'error' | 'warn' | 'info' | 'debug'
    since?: Date
  }) {
    let logs = [...this.logs]

    if (filter?.level) {
      logs = logs.filter(log => log.level === filter.level)
    }

    if (filter?.since) {
      logs = logs.filter(log => log.timestamp >= filter.since!)
    }

    return logs
  }

  clearLogs() {
    this.logs = []
  }

  private async sendToExternalService(log: any) {
    // In production, integrate with external logging service
    // Examples: Sentry, LogRocket, DataDog, etc.
    try {
      // Example: await fetch('https://logging-service.com/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(log)
      // })
    } catch (err) {
      // Silently fail to avoid infinite loops
      console.error('Failed to send log to external service:', err)
    }
  }
}

export const logger = ErrorLogger.getInstance()

// API error handler
export function handleApiError(error: unknown): {
  message: string
  code: string
  statusCode: number
} {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
    }
  }

  return {
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
  }
}
