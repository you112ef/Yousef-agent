import { describe, it, expect, beforeEach } from 'vitest'
import { AppError, ValidationError, AuthenticationError, NotFoundError, ErrorLogger, handleApiError } from '@/lib/utils/error-handler'

describe('Error Classes', () => {
  it('should create AppError with correct properties', () => {
    const error = new AppError('Test error', 'TEST_ERROR', 400)

    expect(error.message).toBe('Test error')
    expect(error.code).toBe('TEST_ERROR')
    expect(error.statusCode).toBe(400)
    expect(error.isOperational).toBe(true)
    expect(error.name).toBe('AppError')
  })

  it('should create ValidationError with correct defaults', () => {
    const error = new ValidationError('Invalid input')

    expect(error.message).toBe('Invalid input')
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.statusCode).toBe(400)
    expect(error.name).toBe('ValidationError')
  })

  it('should create AuthenticationError with correct defaults', () => {
    const error = new AuthenticationError()

    expect(error.message).toBe('Unauthorized')
    expect(error.code).toBe('AUTH_ERROR')
    expect(error.statusCode).toBe(401)
    expect(error.name).toBe('AuthenticationError')
  })

  it('should create NotFoundError with correct defaults', () => {
    const error = new NotFoundError()

    expect(error.message).toBe('Resource not found')
    expect(error.code).toBe('NOT_FOUND')
    expect(error.statusCode).toBe(404)
    expect(error.name).toBe('NotFoundError')
  })
})

describe('ErrorLogger', () => {
  let logger: ErrorLogger

  beforeEach(() => {
    logger = ErrorLogger.getInstance()
    logger.clearLogs()
  })

  it('should log error messages', () => {
    const testError = new Error('Test error')
    logger.error('Test error message', testError, { test: true })

    const logs = logger.getLogs({ level: 'error' })
    expect(logs).toHaveLength(1)
    expect(logs[0].message).toBe('Test error message')
    expect(logs[0].error).toBe(testError)
    expect(logs[0].metadata?.test).toBe(true)
  })

  it('should log warning messages', () => {
    logger.warn('Test warning', { test: true })

    const logs = logger.getLogs({ level: 'warn' })
    expect(logs).toHaveLength(1)
    expect(logs[0].message).toBe('Test warning')
    expect(logs[0].metadata?.test).toBe(true)
  })

  it('should log info messages', () => {
    logger.info('Test info', { test: true })

    const logs = logger.getLogs({ level: 'info' })
    expect(logs).toHaveLength(1)
    expect(logs[0].message).toBe('Test info')
    expect(logs[0].metadata?.test).toBe(true)
  })

  it('should filter logs by level', () => {
    logger.error('Error message')
    logger.warn('Warning message')
    logger.info('Info message')

    const errorLogs = logger.getLogs({ level: 'error' })
    const warnLogs = logger.getLogs({ level: 'warn' })
    const infoLogs = logger.getLogs({ level: 'info' })

    expect(errorLogs).toHaveLength(1)
    expect(warnLogs).toHaveLength(1)
    expect(infoLogs).toHaveLength(1)
  })

  it('should filter logs by timestamp', () => {
    const now = Date.now()
    logger.info('Old log')
    const futureTime = now + 10000
    logger.info('New log')

    const logs = logger.getLogs({ since: futureTime })
    expect(logs).toHaveLength(1)
    expect(logs[0].message).toBe('New log')
  })

  it('should clear logs', () => {
    logger.info('Test info')
    logger.warn('Test warning')

    expect(logger.getLogs()).toHaveLength(2)

    logger.clearLogs()
    expect(logger.getLogs()).toHaveLength(0)
  })
})

describe('handleApiError', () => {
  it('should handle AppError correctly', () => {
    const error = new AppError('Custom error', 'CUSTOM_ERROR', 400)
    const result = handleApiError(error)

    expect(result.message).toBe('Custom error')
    expect(result.code).toBe('CUSTOM_ERROR')
    expect(result.statusCode).toBe(400)
  })

  it('should handle generic Error correctly', () => {
    const error = new Error('Generic error')
    const result = handleApiError(error)

    expect(result.message).toBe('Generic error')
    expect(result.code).toBe('UNKNOWN_ERROR')
    expect(result.statusCode).toBe(500)
  })

  it('should handle unknown error correctly', () => {
    const result = handleApiError('unknown error')

    expect(result.message).toBe('An unknown error occurred')
    expect(result.code).toBe('UNKNOWN_ERROR')
    expect(result.statusCode).toBe(500)
  })
})
