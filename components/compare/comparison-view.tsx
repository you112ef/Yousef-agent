'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskSelector } from './task-selector'
import { TaskComparisonCard } from './task-comparison-card'
import { ComparisonMetrics } from './comparison-metrics'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GitBranch, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

interface Task {
  id: string
  prompt: string
  agent: string
  model: string
  status: string
  createdAt: string
  updatedAt: string
  duration?: number
  logs?: string
  filesChanged?: number
  branchName?: string
}

interface ComparisonViewProps {
  taskIds: string[]
  userId: string
}

export function ComparisonView({ taskIds, userId }: ComparisonViewProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'unified'>('side-by-side')

  useEffect(() => {
    if (taskIds.length > 0) {
      fetchTasks(taskIds)
    } else {
      setLoading(false)
    }
  }, [taskIds])

  const fetchTasks = async (ids: string[]) => {
    try {
      const taskPromises = ids.map(async (id) => {
        const response = await fetch(`/api/tasks/${id}`)
        if (response.ok) {
          return await response.json()
        }
        return null
      })

      const results = await Promise.all(taskPromises)
      const validTasks = results.filter(Boolean) as Task[]
      setTasks(validTasks)
      setSelectedTasks(validTasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks for comparison')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskSelect = (selectedTask: Task) => {
    if (selectedTasks.length >= 4) {
      toast.error('You can compare up to 4 tasks at a time')
      return
    }
    setSelectedTasks(prev => [...prev, selectedTask])
  }

  const handleTaskRemove = (taskId: string) => {
    setSelectedTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getAgentColor = (agent: string) => {
    const colors: Record<string, string> = {
      claude: 'gradient-primary',
      codex: 'gradient-secondary',
      copilot: 'gradient-accent',
      cursor: 'gradient-warning',
      gemini: 'gradient-success',
      opencode: 'gradient-danger'
    }
    return colors[agent] || 'gradient-primary'
  }

  if (loading) {
    return <ComparisonSkeleton />
  }

  if (selectedTasks.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="modern-card">
          <CardHeader>
            <CardTitle>Select Tasks to Compare</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskSelector onTaskSelect={handleTaskSelect} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="px-3 py-1">
            {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedTasks([])}
            className="text-xs"
          >
            Clear all
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <Select value={comparisonMode} onValueChange={(value: any) => setComparisonMode(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="side-by-side">Side by Side</SelectItem>
              <SelectItem value="unified">Unified View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comparison Metrics */}
      <ComparisonMetrics tasks={selectedTasks} />

      {/* Task Cards */}
      <div className={`grid gap-6 ${comparisonMode === 'side-by-side' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {selectedTasks.map((task, index) => (
          <TaskComparisonCard
            key={task.id}
            task={task}
            index={index}
            comparisonMode={comparisonMode}
            onRemove={() => handleTaskRemove(task.id)}
            agentColor={getAgentColor(task.agent)}
            statusIcon={getStatusIcon(task.status)}
          />
        ))}
      </div>

      {/* Add more tasks button */}
      {selectedTasks.length < 4 && (
        <Card className="modern-card border-dashed">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Add More Tasks</h3>
              <p className="text-muted-foreground mb-4">
                Compare up to 4 tasks to analyze different agent approaches
              </p>
              <TaskSelector onTaskSelect={handleTaskSelect} trigger={
                <Button variant="outline" className="glass-button">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Select Tasks
                </Button>
              } />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
