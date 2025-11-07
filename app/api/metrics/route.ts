import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { performanceMonitor } from '@/lib/monitoring/performance'
import { logger } from '@/lib/utils/error-handler'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'all'
    const since = url.searchParams.get('since')
      ? parseInt(url.searchParams.get('since')!)
      : undefined

    const sinceTimestamp = since ? Date.now() - since : undefined

    const response: any = {
      timestamp: Date.now(),
      uptime: performanceMonitor.getUptime(),
      memory: performanceMonitor.getMemoryUsage(),
      cpu: performanceMonitor.getCpuUsage(),
    }

    if (type === 'all' || type === 'performance') {
      response.performance = {
        metrics: performanceMonitor.getMetrics({ since: sinceTimestamp }),
        apiCalls: performanceMonitor.getApiCalls({ since: sinceTimestamp }),
        averageMetrics: {
          apiDuration: performanceMonitor.getAverageMetric('api_duration', sinceTimestamp),
        },
      }
    }

    if (type === 'all' || type === 'api') {
      const apiCalls = performanceMonitor.getApiCalls({ since: sinceTimestamp })
      response.api = {
        totalCalls: apiCalls.length,
        errorRate: performanceMonitor.getErrorRate(sinceTimestamp),
        throughput: performanceMonitor.getApiThroughput(sinceTimestamp),
        slowestCalls: performanceMonitor.getSlowestApiCalls(10),
      }
    }

    if (type === 'all' || type === 'summary') {
      const apiCalls = performanceMonitor.getApiCalls({ since: sinceTimestamp })
      response.summary = {
        totalRequests: apiCalls.length,
        averageResponseTime: apiCalls.length > 0
          ? apiCalls.reduce((sum, c) => sum + c.duration, 0) / apiCalls.length
          : 0,
        errorCount: apiCalls.filter(c => c.statusCode >= 400).length,
        successRate: apiCalls.length > 0
          ? ((apiCalls.filter(c => c.statusCode < 400).length / apiCalls.length) * 100).toFixed(2)
          : '100.00',
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    logger.error('Error fetching metrics', error as Error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id || session.user.id !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    performanceMonitor.clearMetrics()

    return NextResponse.json({
      message: 'Metrics cleared successfully',
    })
  } catch (error) {
    logger.error('Error clearing metrics', error as Error)
    return NextResponse.json(
      { error: 'Failed to clear metrics' },
      { status: 500 }
    )
  }
}
