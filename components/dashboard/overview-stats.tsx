'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Activity, Clock, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Stat {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  description?: string
}

interface OverviewStatsProps {
  stats: {
    totalTasks: number
    completedTasks: number
    successRate: number
    avgDuration: string
    activeTasks: number
    thisWeek: number
  }
  className?: string
}

export function OverviewStats({ stats, className }: OverviewStatsProps) {
  const statItems: Stat[] = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      change: 12,
      trend: 'up',
      icon: <Activity className="h-4 w-4" />,
      description: 'All time',
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      change: 8,
      trend: 'up',
      icon: <CheckCircle className="h-4 w-4" />,
      description: `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% success rate`,
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      change: stats.successRate - 87.3,
      trend: stats.successRate >= 87.3 ? 'up' : 'down',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Past 30 days',
    },
    {
      title: 'Avg Duration',
      value: stats.avgDuration,
      change: -0.3,
      trend: 'down',
      icon: <Clock className="h-4 w-4" />,
      description: 'Per task',
    },
    {
      title: 'Active Tasks',
      value: stats.activeTasks,
      icon: <Activity className="h-4 w-4" />,
      description: 'Currently running',
    },
    {
      title: 'This Week',
      value: stats.thisWeek,
      change: 15,
      trend: 'up',
      icon: <TrendingUp className="h-4 w-4" />,
      description: '7 days',
    },
  ]

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {statItems.map((stat) => (
        <Card key={stat.title} className="modern-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center gap-2 mt-1">
              {stat.change !== undefined && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs',
                    stat.trend === 'up' && 'bg-green-500/10 text-green-600 dark:text-green-400',
                    stat.trend === 'down' && 'bg-red-500/10 text-red-600 dark:text-red-400',
                    stat.trend === 'neutral' && 'bg-muted'
                  )}
                >
                  {stat.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                  {stat.trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(stat.change)}%
                </Badge>
              )}
              {stat.description && (
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
