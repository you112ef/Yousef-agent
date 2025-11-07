import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { tasks, taskMessages, users } from '@/lib/db/schema'
import { eq, and, isNull, desc, count, sql, gte, lte, between } from 'drizzle-orm'
import { getServerSession } from '@/lib/session/get-server-session'
import type { Task, TaskMessage } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Calculate date ranges
    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const thisWeek = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000)

    // Get all tasks for analytics (not deleted)
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))

    // Basic stats
    const totalTasks = allTasks.length
    const completedTasks = allTasks.filter(t => t.status === 'completed').length
    const failedTasks = allTasks.filter(t => t.status === 'error').length
    const runningTasks = allTasks.filter(t => t.status === 'processing' || t.status === 'pending').length

    const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    // Calculate average duration from completed tasks
    const completedWithDuration = allTasks.filter(t => t.status === 'completed' && t.completedAt && t.createdAt)
    const avgDurationMs = completedWithDuration.length > 0
      ? completedWithDuration.reduce((sum, t) => {
          if (t.completedAt) {
            return sum + (t.completedAt.getTime() - t.createdAt.getTime())
          }
          return sum
        }, 0) / completedWithDuration.length
      : 0

    const avgDuration = formatDuration(avgDurationMs)

    // Get tasks this week
    const thisWeekTasks = allTasks.filter(t => t.createdAt >= thisWeek).length

    // Tasks over time (last 7 days)
    const tasksOverTime: { date: string; tasks: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dayTasks = allTasks.filter(t => {
        const taskDate = t.createdAt.toISOString().split('T')[0]
        return taskDate === dateStr
      }).length
      tasksOverTime.push({ date: dateStr, tasks: dayTasks })
    }

    // Success rate over time (last 6 months)
    const successRateData: { month: string; rate: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStr = monthDate.toLocaleString('en-US', { month: 'short' })
      const monthTasks = allTasks.filter(t => {
        const taskMonth = t.createdAt.getMonth()
        const taskYear = t.createdAt.getFullYear()
        return taskMonth === monthDate.getMonth() && taskYear === monthDate.getFullYear()
      })
      const monthCompleted = monthTasks.filter(t => t.status === 'completed').length
      const monthRate = monthTasks.length > 0 ? (monthCompleted / monthTasks.length) * 100 : 0
      successRateData.push({ month: monthStr, rate: Math.round(monthRate) })
    }

    // Task status distribution
    const statusDistribution = [
      { status: 'Completed', count: completedTasks, color: '#10b981' },
      { status: 'Failed', count: failedTasks, color: '#ef4444' },
      { status: 'Running', count: runningTasks, color: '#f59e0b' }
    ].filter(item => item.count > 0)

    // Top repositories
    const repoMap = new Map<string, { name: string; tasks: number; success: number }>()
    allTasks.forEach(t => {
      if (t.repoUrl) {
        try {
          const url = new URL(t.repoUrl)
          const name = url.pathname.split('/').slice(1, 3).join('/')
          const existing = repoMap.get(name) || { name, tasks: 0, success: 0 }
          existing.tasks++
          if (t.status === 'completed') existing.success++
          repoMap.set(name, existing)
        } catch {
          // Skip invalid URLs
        }
      }
    })

    const topRepositories = Array.from(repoMap.values())
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 4)
      .map(r => ({
        ...r,
        success: r.tasks > 0 ? Math.round((r.success / r.tasks) * 100) : 0
      }))

    // Agent performance
    const agentMap = new Map<string, { name: string; tasks: number; success: number; totalDuration: number }>()
    allTasks.forEach(t => {
      const agent = t.selectedAgent || 'unknown'
      const existing = agentMap.get(agent) || { name: agent, tasks: 0, success: 0, totalDuration: 0 }
      existing.tasks++
      if (t.status === 'completed') {
        existing.success++
        if (t.completedAt && t.createdAt) {
          existing.totalDuration += t.completedAt.getTime() - t.createdAt.getTime()
        }
      }
      agentMap.set(agent, existing)
    })

    const agentPerformance = Array.from(agentMap.values())
      .map(a => ({
        name: capitalizeFirst(a.name),
        tasks: a.tasks,
        successRate: a.tasks > 0 ? Math.round((a.success / a.tasks) * 100) : 0,
        avgDuration: formatDuration(a.tasks > 0 ? a.totalDuration / a.success : 0)
      }))
      .sort((a, b) => b.tasks - a.tasks)

    // Agent comparison (similar to agent performance but formatted for cards)
    const agentComparison = agentPerformance.map(a => ({
      name: a.name,
      successRate: a.successRate,
      avgDuration: a.avgDuration,
      totalTasks: a.tasks
    }))

    // Recent tasks (last 10)
    const recentTasksData = allTasks
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
      .map(t => ({
        id: t.id,
        prompt: t.title || t.prompt.substring(0, 50) + '...',
        agent: t.selectedAgent || 'claude',
        status: t.status,
        duration: formatDuration(t.completedAt && t.createdAt
          ? t.completedAt.getTime() - t.createdAt.getTime()
          : 0),
        createdAt: t.createdAt.toISOString()
      }))

    const analyticsData = {
      stats: {
        totalTasks,
        completedTasks,
        successRate: Math.round(successRate * 10) / 10,
        avgDuration,
        activeTasks: runningTasks,
        thisWeek: thisWeekTasks
      },
      tasksOverTime,
      successRate: successRateData,
      statusDistribution,
      topRepositories,
      agentPerformance,
      agentComparison,
      recentTasks: recentTasksData
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '0m'
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${seconds}s`
  }
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
