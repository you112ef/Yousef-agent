import { NextResponse } from 'next/server'
import { logger } from '@/lib/utils/error-handler'

export async function GET() {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: 'unknown', // Will be updated when we check DB
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB'
        },
        cpu: {
          usage: process.cpuUsage(),
          loadAverage: process.platform !== 'win32' ? (process as any).loadavg() : null
        }
      }
    }

    // In a real application, you would check:
    // - Database connectivity
    // - External API availability
    // - Disk space
    // - etc.

    return NextResponse.json(healthCheck, { status: 200 })
  } catch (error) {
    logger.error('Health check failed', error as Error)

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    )
  }
}

export async function HEAD() {
  // Simple health check for load balancers
  try {
    // Add database ping here if needed
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}
