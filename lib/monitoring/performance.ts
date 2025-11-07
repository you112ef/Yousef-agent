import { logger } from '@/lib/utils/error-handler'

interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count' | 'percent'
  timestamp: number
  tags?: Record<string, string>
}

interface ApiCallMetric {
  endpoint: string
  method: string
  duration: number
  statusCode: number
  timestamp: number
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private apiCalls: ApiCallMetric[] = []
  private maxMetrics = 10000
  private maxApiCalls = 10000

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  recordMetric(name: string, value: number, unit: 'ms' | 'bytes' | 'count' | 'percent', tags?: Record<string, string>) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags,
    }

    this.metrics.push(metric)

    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log slow operations
    if (unit === 'ms' && value > 5000) {
      logger.warn(`Slow operation detected: ${name}`, {
        value,
        tags,
      })
    }
  }

  recordApiCall(endpoint: string, method: string, duration: number, statusCode: number) {
    const metric: ApiCallMetric = {
      endpoint,
      method,
      duration,
      statusCode,
      timestamp: Date.now(),
    }

    this.apiCalls.push(metric)

    // Keep only the last maxApiCalls
    if (this.apiCalls.length > this.maxApiCalls) {
      this.apiCalls = this.apiCalls.slice(-this.maxApiCalls)
    }

    // Log slow API calls
    if (duration > 3000) {
      logger.warn(`Slow API call: ${method} ${endpoint}`, {
        duration,
        statusCode,
      })
    }

    // Log errors
    if (statusCode >= 400) {
      logger.error(`API error: ${method} ${endpoint}`, undefined, {
        statusCode,
        duration,
      })
    }
  }

  getMetrics(filter?: {
    name?: string
    since?: number
    tags?: Record<string, string>
  }): PerformanceMetric[] {
    let filtered = [...this.metrics]

    if (filter?.name) {
      filtered = filtered.filter(m => m.name === filter.name)
    }

    if (filter?.since) {
      filtered = filtered.filter(m => m.timestamp >= filter.since!)
    }

    if (filter?.tags) {
      filtered = filtered.filter(m => {
        if (!m.tags) return false
        return Object.entries(filter.tags!).every(([key, value]) => m.tags![key] === value)
      })
    }

    return filtered
  }

  getApiCalls(filter?: {
    endpoint?: string
    method?: string
    since?: number
  }): ApiCallMetric[] {
    let filtered = [...this.apiCalls]

    if (filter?.endpoint) {
      filtered = filtered.filter(m => m.endpoint === filter.endpoint)
    }

    if (filter?.method) {
      filtered = filtered.filter(m => m.method === filter.method)
    }

    if (filter?.since) {
      filtered = filtered.filter(m => m.timestamp >= filter.since!)
    }

    return filtered
  }

  getAverageMetric(name: string, since?: number): number {
    const metrics = this.getMetrics({ name, since })
    if (metrics.length === 0) return 0

    return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length
  }

  getSlowestApiCalls(limit: number = 10): ApiCallMetric[] {
    return [...this.apiCalls]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
  }

  getErrorRate(since?: number): number {
    const calls = this.getApiCalls({ since })
    if (calls.length === 0) return 0

    const errorCalls = calls.filter(c => c.statusCode >= 400)
    return (errorCalls.length / calls.length) * 100
  }

  getApiThroughput(since?: number): { count: number; perSecond: number } {
    const calls = this.getApiCalls({ since })
    if (calls.length === 0) return { count: 0, perSecond: 0 }

    const timeRange = since ? (Date.now() - since) : (calls[calls.length - 1].timestamp - calls[0].timestamp)
    const seconds = timeRange / 1000

    return {
      count: calls.length,
      perSecond: seconds > 0 ? calls.length / seconds : 0,
    }
  }

  getMemoryUsage() {
    const used = process.memoryUsage()
    return {
      rss: Math.round(used.rss / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100, // MB
      heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100, // MB
      external: Math.round(used.external / 1024 / 1024 * 100) / 100, // MB
    }
  }

  getCpuUsage() {
    const usage = process.cpuUsage()
    return {
      user: usage.user,
      system: usage.system,
    }
  }

  getUptime() {
    return process.uptime()
  }

  clearMetrics() {
    this.metrics = []
    this.apiCalls = []
  }

  exportMetrics() {
    return {
      metrics: this.metrics,
      apiCalls: this.apiCalls,
      memory: this.getMemoryUsage(),
      cpu: this.getCpuUsage(),
      uptime: this.getUptime(),
      timestamp: Date.now(),
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()

// Middleware to track API performance
export function withPerformanceTracking<T extends Record<string, any>>(
  handler: (request: Request) => Promise<T>,
  endpoint: string
) {
  return async (request: Request): Promise<T> => {
    const start = Date.now()
    const method = request.method

    try {
      const result = await handler(request)

      // Record successful API call
      const duration = Date.now() - start
      performanceMonitor.recordApiCall(endpoint, method, duration, 200)

      return result
    } catch (error) {
      // Record failed API call
      const duration = Date.now() - start
      const statusCode = error instanceof Error && 'statusCode' in error
        ? (error as any).statusCode
        : 500

      performanceMonitor.recordApiCall(endpoint, method, duration, statusCode)

      throw error
    }
  }
}

// Performance tracking decorator
export function trackPerformance(name: string, unit: 'ms' | 'bytes' | 'count' | 'percent' = 'ms') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const start = performance.now()
      try {
        const result = await originalMethod.apply(this, args)
        const duration = performance.now() - start
        performanceMonitor.recordMetric(name, duration, unit)
        return result
      } catch (error) {
        const duration = performance.now() - start
        performanceMonitor.recordMetric(`${name}_error`, duration, unit)
        throw error
      }
    }

    return descriptor
  }
}
