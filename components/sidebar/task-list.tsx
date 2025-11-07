'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle, XCircle, Clock, PlayCircle, Archive, MoreHorizontal, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Task } from '@/lib/db/schema'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface TaskListProps {
  tasks: Task[]
  onDeleteTask?: (taskId: string) => void
  onBulkDelete?: (taskIds: string[]) => void
  searchQuery: string
  statusFilter: string | null
  agentFilter: string | null
  sortBy: 'recent' | 'oldest' | 'name'
  className?: string
}

export function TaskList({
  tasks,
  onDeleteTask,
  onBulkDelete,
  searchQuery,
  statusFilter,
  agentFilter,
  sortBy,
  className
}: TaskListProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.prompt.toLowerCase().includes(query) ||
          (task.title && task.title.toLowerCase().includes(query)) ||
          (task.repoUrl && task.repoUrl.toLowerCase().includes(query))
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    // Agent filter
    if (agentFilter) {
      filtered = filtered.filter((task) => task.selectedAgent === agentFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return b.createdAt.getTime() - a.createdAt.getTime()
      } else if (sortBy === 'oldest') {
        return a.createdAt.getTime() - b.createdAt.getTime()
      } else {
        const aTitle = a.title || a.prompt
        const bTitle = b.title || b.prompt
        return aTitle.localeCompare(bTitle)
      }
    })

    return filtered
  }, [tasks, searchQuery, statusFilter, agentFilter, sortBy])

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'error':
        return <XCircle className="h-3 w-3 text-red-500" />
      case 'processing':
        return <PlayCircle className="h-3 w-3 text-blue-500 animate-pulse" />
      case 'pending':
        return <Clock className="h-3 w-3 text-yellow-500" />
      case 'stopped':
        return <Archive className="h-3 w-3 text-gray-500" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-600 dark:text-green-400'
      case 'error':
        return 'bg-red-500/10 text-red-600 dark:text-red-400'
      case 'processing':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
      case 'stopped':
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
      default:
        return 'bg-muted'
    }
  }

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    )
  }

  const toggleAllTasks = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(filteredTasks.map((task) => task.id))
    }
  }

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedTasks.length > 0) {
      onBulkDelete(selectedTasks)
      setSelectedTasks([])
    }
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">
          {searchQuery || statusFilter || agentFilter ? 'No tasks match your filters' : 'No tasks yet'}
        </p>
        {!searchQuery && !statusFilter && !agentFilter && (
          <p className="text-xs mt-1">Create your first task to get started</p>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <div className="flex items-center gap-2 p-2 glass rounded-lg">
          <Checkbox
            checked={selectedTasks.length === filteredTasks.length}
            onCheckedChange={toggleAllTasks}
          />
          <span className="text-xs text-muted-foreground">
            {selectedTasks.length} selected
          </span>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      )}

      {/* Task List */}
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className={cn(
                'modern-card hover-lift transition-all cursor-pointer group',
                selectedTasks.includes(task.id) && 'ring-2 ring-primary'
              )}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={() => toggleTaskSelection(task.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <Link href={`/tasks/${task.id}`} className="block">
                      <div className="flex items-start gap-2 mb-2">
                        {getStatusIcon(task.status)}
                        <h4 className="text-sm font-medium truncate flex-1 group-hover:text-primary transition-colors">
                          {task.title || task.prompt.substring(0, 50) + '...'}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {task.selectedAgent}
                        </Badge>
                        {task.status && (
                          <Badge variant="secondary" className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        )}
                        {task.progress !== undefined && task.progress > 0 && task.progress < 100 && (
                          <Badge variant="secondary" className="text-xs">
                            {task.progress}%
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(task.createdAt, { addSuffix: true })}
                        </span>
                        {task.repoUrl && (
                          <span className="truncate max-w-[100px]">
                            {new URL(task.repoUrl).pathname.split('/').pop()}
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onDeleteTask?.(task.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
