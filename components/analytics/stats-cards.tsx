'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, CheckCircle, Clock, Target } from 'lucide-react'

interface StatsCardsProps {
  data: {
    totalTasks: number
    completedTasks: number
    successRate: number
    avgDuration: string
    activeTasks: number
    thisWeek: number
  }
}

export function StatsCards({ data }: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Tasks',
      value: data.totalTasks,
      change: '+12%',
      icon: Target,
      gradient: 'gradient-primary',
      color: 'text-white'
    },
    {
      title: 'Completed',
      value: data.completedTasks,
      change: '+8%',
      icon: CheckCircle,
      gradient: 'gradient-success',
      color: 'text-white'
    },
    {
      title: 'Success Rate',
      value: `${data.successRate}%`,
      change: '+2.3%',
      icon: TrendingUp,
      gradient: 'gradient-accent',
      color: 'text-white'
    },
    {
      title: 'Active Now',
      value: data.activeTasks,
      change: 'Live',
      icon: Clock,
      gradient: 'gradient-warning',
      color: 'text-white'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card
          key={stat.title}
          className="stats-card interactive-card animate-slide-in-bottom"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.gradient}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold">{stat.value}</div>
              <Badge
                variant="secondary"
                className="text-xs font-normal hover:scale-105 transition-transform"
              >
                {stat.change}
              </Badge>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {stat.title === 'Success Rate' && 'vs last month'}
              {stat.title === 'Total Tasks' && 'all time'}
              {stat.title === 'Completed' && 'this month'}
              {stat.title === 'Active Now' && 'currently running'}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
