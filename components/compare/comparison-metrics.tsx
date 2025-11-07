'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Clock, CheckCircle, XCircle, Bot, GitBranch } from 'lucide-react'

interface Task {
  id: string
  prompt: string
  agent: string
  model: string
  status: string
  createdAt: string
  duration?: number
  branchName?: string
}

interface ComparisonMetricsProps {
  tasks: Task[]
}

export function ComparisonMetrics({ tasks }: ComparisonMetricsProps) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const failedTasks = tasks.filter(task => task.status === 'failed').length
  const runningTasks = tasks.filter(task => task.status === 'running').length

  const avgDuration = tasks
    .filter(task => task.duration)
    .reduce((sum, task) => sum + (task.duration || 0), 0) / tasks.filter(task => task.duration).length || 0

  const fastestTask = tasks
    .filter(task => task.duration)
    .sort((a, b) => (a.duration || 0) - (b.duration || 0))[0]

  const slowestTask = tasks
    .filter(task => task.duration)
    .sort((a, b) => (b.duration || 0) - (a.duration || 0))[0]

  const uniqueAgents = Array.from(new Set(tasks.map(task => task.agent)))

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`
  }

  const getSuccessRate = () => {
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Success Rate */}
      <Card className="modern-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getSuccessRate()}%</div>
          <Progress value={getSuccessRate()} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {completedTasks} of {totalTasks} completed
          </p>
        </CardContent>
      </Card>

      {/* Average Duration */}
      <Card className="modern-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatDuration(avgDuration)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across {tasks.filter(t => t.duration).length} tasks
          </p>
        </CardContent>
      </Card>

      {/* Performance Range */}
      <Card className="modern-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance Range</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {fastestTask && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fastest:</span>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {fastestTask.agent}
                  </Badge>
                  <span className="font-medium">{formatDuration(fastestTask.duration!)}</span>
                </div>
              </div>
            )}
            {slowestTask && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Slowest:</span>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {slowestTask.agent}
                  </Badge>
                  <span className="font-medium">{formatDuration(slowestTask.duration!)}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Agent Diversity */}
      <Card className="modern-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agents Compared</CardTitle>
          <Bot className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueAgents.length}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {uniqueAgents.map((agent) => (
              <Badge key={agent} variant="secondary" className="text-xs">
                {agent}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Status Distribution */}
      <Card className="md:col-span-2 lg:col-span-4 modern-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Completed</span>
              <Badge variant="default">{completedTasks}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm">Failed</span>
              <Badge variant="destructive">{failedTasks}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Running</span>
              <Badge variant="secondary">{runningTasks}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
