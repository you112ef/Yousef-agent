'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Clock, CheckCircle, XCircle, Bot, GitBranch } from 'lucide-react'

interface Task {
  id: string
  prompt: string
  agent: string
  model: string
  status: string
  createdAt: string
  updatedAt: string
  branchName?: string
}

interface TaskSelectorProps {
  onTaskSelect: (task: Task) => void
  trigger?: React.ReactNode
}

export function TaskSelector({ onTaskSelect, trigger }: TaskSelectorProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedAgent, setSelectedAgent] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
    filterTasks()
  }, [tasks, searchTerm, selectedStatus, selectedAgent])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      // Mock data for demonstration
      setTasks([
        {
          id: '1',
          prompt: 'Add user authentication to the React app',
          agent: 'claude',
          model: 'claude-sonnet-4-5-20250929',
          status: 'completed',
          createdAt: '2024-01-07T10:30:00Z',
          updatedAt: '2024-01-07T10:45:00Z',
          branchName: 'feature/user-auth-A1b2C3'
        },
        {
          id: '2',
          prompt: 'Fix memory leak in image processing component',
          agent: 'codex',
          model: 'openai/gpt-5',
          status: 'completed',
          createdAt: '2024-01-07T09:15:00Z',
          updatedAt: '2024-01-07T09:30:00Z',
          branchName: 'fix/memory-leak-X9y8Z7'
        },
        {
          id: '3',
          prompt: 'Implement dark mode toggle',
          agent: 'copilot',
          model: 'claude-sonnet-4.5',
          status: 'running',
          createdAt: '2024-01-07T11:00:00Z',
          updatedAt: '2024-01-07T11:15:00Z',
          branchName: 'feature/dark-mode-B7xQ2w'
        },
        {
          id: '4',
          prompt: 'Optimize database queries for performance',
          agent: 'gemini',
          model: 'gemini-2.5-pro',
          status: 'failed',
          createdAt: '2024-01-07T08:45:00Z',
          updatedAt: '2024-01-07T09:00:00Z',
          branchName: 'perf/db-optimize-M4nR8s'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const filterTasks = () => {
    let filtered = tasks

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.model.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus)
    }

    if (selectedAgent !== 'all') {
      filtered = filtered.filter(task => task.agent === selectedAgent)
    }

    setFilteredTasks(filtered)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const uniqueAgents = Array.from(new Set(tasks.map(task => task.agent)))

  const defaultTrigger = (
    <Button variant="outline" className="glass-button">
      <Search className="h-4 w-4 mr-2" />
      Select Tasks
    </Button>
  )

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="running">Running</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Agents</option>
          {uniqueAgents.map(agent => (
            <option key={agent} value={agent}>{agent}</option>
          ))}
        </select>
      </div>

      {/* Tasks list */}
      <ScrollArea className="h-64">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                    <div className="h-6 w-16 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                className="interactive-card cursor-pointer"
                onClick={() => onTaskSelect(task)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(task.status)}
                        <h4 className="text-sm font-medium truncate">{task.prompt}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Bot className="h-3 w-3" />
                          <span>{task.agent}</span>
                        </div>
                        {task.branchName && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <GitBranch className="h-3 w-3" />
                              <span>{task.branchName}</span>
                            </div>
                          </>
                        )}
                        <span>•</span>
                        <span>{formatDate(task.createdAt)}</span>
                      </div>
                    </div>
                    <Badge
                      variant={task.status === 'completed' ? 'default' : task.status === 'failed' ? 'destructive' : 'secondary'}
                      className="shrink-0"
                    >
                      {task.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No tasks found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
